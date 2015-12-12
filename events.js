function makeid(length)
{
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for( var i=0; i < length; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}

var pusher = new Pusher('9d3ca23fe4e0cd26c73c', {
    authEndpoint: 'localhost:3000/pusher/auth',
    auth: {
      headers: {
        'X-CSRF-Token': '<%= form_authenticity_token %>'
      }
    }
  });


document.getElementById('start-session').onclick = function() {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        for (var i = 0; i < tabs.length; i++) {
            chrome.tabs.sendMessage(tabs[0].id, {messageY: "I've come to talk with you again."}, function (response) {
                console.log(response.msg);
            });
        }
    });

	document.getElementById("result").innerHTML =  "Send this to someone " + makeid(10);

	channel = pusher.subscribe("private-" + id);

	channel.bind('user_joined', function(data) {
	  channel.trigger("client-website_link", { website: website });
	});

};