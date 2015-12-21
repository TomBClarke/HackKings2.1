var pusher;
var token;
var channel;
var from;
var siteVer = Math.random().toString();
connected = false;

/**
 * Check if the plugin was running before a redirect from within the plugin.
 */
chrome.storage.local.get(["token", "from"], function(value) {
	console.log(value);
	if (value.token) { // A link was just clicked.
		chrome.storage.local.set({"token": false});
		onMsg({from: value.from, token: value.token});
	}
});

/**
 * Returns a reference to Pusher for the plugin.
 * Is a singleton.
 * @returns {Pusher}
 */
function getPusher() {
	if (!pusher) {
        // Redirect the Pusher logging.
		Pusher.log = function(message) {
			if (window.console && window.console.log) {
				window.console.log(message);
			}
		};
        // Create the new Pusher variable and assign it to global.
		pusher = new Pusher('9d3ca23fe4e0cd26c73c', {
			authEndpoint: 'http://realtime-browsing.tomclarke.xyz/index.php'
		});
	}
	return pusher;
}

chrome.runtime.onMessage.addListener(onMsg);

/**
 * On a message sent from events.js or just called from this class.
 * @param request An object containing; what role the plugin should play (host or client) and,
 *                the channel token to subscribe to.
 */
function onMsg(request) {
	if (channel) return; // Disallowing multiple channels. Clients should refresh the page.
	token = request.token;
	channel = getPusher().subscribe("private-" + token);

	from = request.from;
	if (request.from == "host") {
		channel.bind("client-receiving", function(data) {
			decodeData(data);
		});
		channel.bind('client-user_joined', function() {
			sendHTML();
		});

		window.onclick = function (e) {
			var href = parentTaggedA(e.target);
			if (href) {
				e.preventDefault();
				setURL(href);
			}
		};

		$(window).scroll( $.throttle( 100, function() {
			var scrollPercent = $(window).scrollTop() / $(document).height();
			sendData("scrolled", scrollPercent.toString());
		}));
		

		channel.bind('pusher:subscription_succeeded', function() {
			connected = true;
		});

		sendHTML();
	} else {
		channel.bind("client-sending", function(data) {
			decodeDataC(data);
		});

		setTimeout(function() {
			channel.trigger("client-user_joined", {nil: "nil?"});
		}, 1000);
	}

}

/* Sending */

/**
 *
 * @param {boolean} host Whether this is the host sending data or the client.
 * @param info The information to send. Should be in packet form, which is specific to the client and host.
 */
function sendOnChannel(host, info) {
	channel.trigger((host ? "client-sending" : "client-receiving"), info);
}

/* Util */

/**
 * Change the URL of the current page, but allow the plugin to rejoin the same channel.
 * @param {string} href The URL to go to.
 */
function setURL(href) {
    chrome.storage.local.set({"token": token, "from": from});
    window.location.href = href;
}

/**
 * Converts a string into it's hash code.
 * Used to check whether a packet sent properly.
 * @param str The string to get the hashCode of.
 * @returns {number} The generated hash code. Will always be constant for the same string.
 */
function hashCode(str) {
	var res = 0,
		len = str.length;
	for (var i = 0; i < len; i++) {
		res = res * 31 + str.charCodeAt(i);
		res = res & res;
	}
	return res;
}
