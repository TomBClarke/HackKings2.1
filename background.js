var pusher;

function getPusher() {
	if (!pusher) {
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
			var html = document.getElementsByName("html")[0].innerHTML;
			channel.trigger("client-website_link", { html: html });
		});
	} else {
		channel.trigger("client-user_joined", {nil: "nil?"});

		channel.bind('client-website_link', function(data) {
			document.getElementsByName("html")[0].innerHTML = data.html;
		});
	}


});
