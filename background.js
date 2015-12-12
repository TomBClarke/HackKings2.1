chrome.extension.onConnect.addListener(function(port) {
    console.log("Hello darkness my old friend.");
    port.onMessage.addListener(function(msg){
       console.log(msg);
    });
});
