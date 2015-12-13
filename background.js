var pusher;
var token;
var channel;
var from;

chrome.storage.local.get(["token", "from"], function(value) {
	console.log(value);
	if (value.token) { // A link was just clicked.
		chrome.storage.local.set({"token": false});
		onMsg({from: value.from, token: value.token});
	}
});

function getPusher() {
	if (!pusher) {
		Pusher.log = function(message) {
			if (window.console && window.console.log) {
				window.console.log(message);
			}
		};
		pusher = new Pusher('9d3ca23fe4e0cd26c73c', {
			authEndpoint: 'http://realtime-browsing.tomclarke.xyz/index.php'
		});
	}
	return pusher;
}

chrome.runtime.onMessage.addListener(onMsg);

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
				linkClicked(href);
			}
		};

		$(window).scroll(function() {
			var scrollPercent = $(window).scrollTop() / $(document).height();
			sendData("scrolled", scrollPercent.toString());
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

function sendOnChannel(host, info) {
	channel.trigger((host ? "client-sending" : "client-receiving"), info);
}
