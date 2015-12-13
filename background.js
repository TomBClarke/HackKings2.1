var pusher;
var channel;

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

chrome.runtime.onMessage.addListener(function(request) {
	if (channel) return; // Disallowing multiple channels. Clients should refresh the page.
	channel = getPusher().subscribe("private-" + request.token);

	if (request.from == "host") {
		channel.bind("client-receiving", function(data) {
			decodeData(data);
		});
		channel.bind('client-user_joined', function() {
			$('a, link').each(function(){$(this).attr('href', this.href);});
			$('img, script, iframe').each(function(){$(this).attr('src', this.src);});
			var html = document.documentElement.innerHTML;
			sendData("websiteHTML", html);
		});

		$(window).scroll(function() {
			var scrollPercent = $(window).scrollTop() / $(document).height();
			sendData("scrolled", scrollPercent.toString());
		})
	} else {
		channel.bind("client-sending", function(data) {
			decodeDataC(data);
		});

		setTimeout(function() {
			channel.trigger("client-user_joined", {nil: "nil?"});
		}, 1000);
	}

});

/* Sending */

function sendOnChannel(host, info) {
	channel.trigger((host ? "client-sending" : "client-receiving"), info);
}
