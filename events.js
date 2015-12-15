/**
 * Generates a new token.
 * @param {number} length The length the token should be.
 * @returns {string} The generated token.
 */
function makeID(length) {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (var i=0; i < length; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}

// Handle the "Start Session" button clicks.
document.getElementById('start-session').onclick = function() {
	var token = makeID(10); // New token.
    sendToCurrentTab({token: token, from: "host"}); // Send the token to the tab.

    // Update the popup box.
	document.getElementById("result").innerHTML =  "Send this to someone " + token;
};

// Handle the "Submit" token button clicks.
document.getElementById('submitButton').onclick = function() {
	var token = document.getElementById("token").value; // Specified token.
    sendToCurrentTab({token: token, from: "client"}); // Send the token to the tab.
};

function sendToCurrentTab(data) {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, data);
    });
}
