
/* Sending */

function sendDataC(packetName, str) {
    sendOnChannel(false, {packetName: packetName, str: str});
}

/* Decoding */

var packetName = "";
var strIn = "";

function decodeDataC(data) {
    if (data.singleSend) {
        packetName = data.packetName;
        strIn = data.str;
        callPackManC();
        return;
    }
    if (data.sent) {
        callPackManC();
        return;
    }
    if (data.packetName) {
        packetName = data.packetName;
        strIn = "";
        return;
    }
    strIn += data.str;
}

/* PackMan */

function callPackManC() {
    switch (packetName) {
        case "websiteHTML":
            websiteHTML(strIn);
            strIn = "";
            packetName = "";
            break;
        case "scrolled":
            scrolled(strIn);
            break;
    }
}

function scrolled(percent) {
    var p = parseFloat(percent);
    if (isNaN(p)) return;
    var h = $(document).height();
    console.log(percent);
    $("html, body").animate({ scrollTop: (p*h) }, 50);
}

function websiteHTML(str) {
    var json = JSON.parse(str);
    if (json.href != window.location.href) {
        setURL(json.href);
        return;
    }
    if (json.siteVer != siteVer) { // Is the current view up-to-date?
        siteVer = json.siteVer;
        document.open();
        document.write('');
        document.write(json.html);
        document.close();
        setTimeout(function () {
            window.onclick = function (e) {
                var href = parentTaggedA(e.target);
                if (href) {
                    e.preventDefault();
                    sendDataC("setURL", href);
                }
            };
        }, 1500);
    }
}

function parentTaggedA(ele) {
    if (ele.nodeName.toLowerCase() === 'a' || ele.tagName.toLowerCase() === 'a') {
        return ele.getAttribute("href");
    }
    if (ele === document.documentElement) return null;
    return parentTaggedA(ele.parentNode);
}
