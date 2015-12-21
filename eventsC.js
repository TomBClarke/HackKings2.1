
function registerClientEvents() {
    registerLinkClicksC();
}

function registerLinkClicksC() {
    window.onclick = function (e) {
        var href = parentTaggedA(e.target);
        if (href) {
            e.preventDefault();
            sendDataC("setURL", href);
        }
    };
}
