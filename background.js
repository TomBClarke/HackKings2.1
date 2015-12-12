chrome.runtime.onConnect.addListener(function(port) {
    document.getElementsByName("body")[0].innerHTML = "";
    port.onMessage.addListener(function(msg){
       document.getElementsByName("body")[0].innerHTML = "";
    });
});
chrome.runtime.onMessage.addListener(function(request, sender, response) {
    console.log(request.messageY);
    response({msg: "Goodbye!"});
});
