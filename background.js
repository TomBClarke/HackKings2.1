var pusher;

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
	channel = getPusher().subscribe("private-" + request.token);
	
	if(request.from == "host"){
	    channel.bind('client-user_joined', function(data) {
			var html = document.documentElement.innerHTML;
			setTimeout(function() {
				channel.trigger("client-website_link", { html: html });
			}, 2500);
		});
	} else {
		channel.bind('client-website_link', function(data) {
			document.write(data.html);
		});

		setTimeout(function() {
			channel.trigger("client-user_joined", {nil: "nil?"});
		}, 2500);
	}

});
