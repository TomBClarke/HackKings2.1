function makeid(length)
{
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for( var i=0; i < length; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}

document.getElementById('start-session').onclick = function() {

	var token = makeid(10);

    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {token: token, from: "host"});
    });

	document.getElementById("result").innerHTML =  "Send this to someone " + token;

};

document.getElementById('submitButton').onclick = function() {

	var token = document.getElementById("token").value;

    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {token: token, from: "client"});
    });

};