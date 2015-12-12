pusher = new Pusher('9d3ca23fe4e0cd26c73c', {
    authEndpoint: 'http://real-time-browsing.tombclarke.xyz/index.php'
  });


chrome.runtime.onMessage.addListener(function(request) {
	channel = pusher.subscribe("private-" + request.token);
	
	if(request.from == "host"){
		alert("from the host");
	    channel.bind('client-user_joined', function(data) {
		  channel.trigger("client-website_link", { website: website });
		});
	} else {
		channel.trigger("client-user_joined", { yo: "man" });

		channel.bind('client-website_link', function(data) {
		  	alert("got the link back");
		});
	}


});
