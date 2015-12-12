chrome.runtime.onMessage.addListener(function(request) {
	alert("from the host");
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

	response({msg: "goodbye"});

});
