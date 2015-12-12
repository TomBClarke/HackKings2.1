chrome.runtime.onMessage.addListener(function(request, sender, response) {
    console.log(request.messageY);
    response({msg: "Goodbye!"});
});
