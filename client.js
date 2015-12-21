
/* Sending */

/**
 * Send client data to the host.
 * @param {string} packetName The name of the packet to send.
 * @param {string} str The data to send in the form of a string.
 */
function sendDataC(packetName, str) {
    sendOnChannel(false, {packetName: packetName, str: str});
}

/* Decoding */

var packetName = "";
var strIn = "";

/**
 * Decodes a data packet or partial-packet from the host,
 * then calls the appropriate method to handle it.
 * If the data is a partial-packet, it will be reconstructed first.
 * @param data The data packet or partial-packet.
 */
function decodeDataC(data) {
    if (data.singleSend) {
        packetName = data.packetName;
        strIn = data.str;
        callPackManC();
        clearData();
        return;
    }
    if (data.hash) {
        if (packetName === "") {
            console.error("No packetName specified. Probably joined during transmission.");
            clearData();
            return;
        }

        var hash = hashCode(strIn);
        if (data.hash === hash) {
            callPackManC();
        } else {
            console.error("Hash codes do not match. " + data.hash + " vs. " + hash);
        }
        clearData();
        return;
    }
    if (data.packetName) {
        packetName = data.packetName;
        strIn = "";
        return;
    }
    strIn += data.str;
}

function clearData() {
    strIn = "";
    packetName = "";
}

/* PackMan */

/**
 * Calls the appropriate method to handle the last received packet.
 * Should only be called from decodeData.
 */
function callPackManC() {
    switch (packetName) {
        case "websiteHTML":
            websiteHTML(strIn);
            break;
        case "scrolled":
            scrolled(strIn);
            break;
    }
}

/**
 * Handles the scroll packet.
 * @param {string} percents The decimal percentage of the page scrolled.
 *                          In the form 'vScroll + " " + hScroll'.
 */
function scrolled(percents) {
    console.log(percents);
    var split = percents.split(" ");
    var v = parseFloat(split[0]);
    var h = parseFloat(split[1]);
    if (isNaN(v) || isNaN(h)) return;
    $("html, body").animate({ scrollTop: (v*$(document).height()), scrollLeft: (h*$(document).width()) }, 50);
}

/**
 * Handles the website changing packet.
 * @param {string} str A JSON string containing;
 *                     the URL of the website,
 *                     the version of the site (should be changed by the host when their page changes) and,
 *                     the content of the page.
 */
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
        setTimeout(function() {
            registerClientEvents();
        }, 1500);
    }
}

/**
 * A util function to get the href of a clicked link element, or of an element inside of a link element.
 * @param {Element} ele The element to search in.
 * @returns The URL if there is one;
 *          null otherwise.
 */
function parentTaggedA(ele) {
    if (ele.nodeName.toLowerCase() === 'a' || ele.tagName.toLowerCase() === 'a') {
        return ele.getAttribute("href");
    }
    if (ele === document.documentElement) return null;
    return parentTaggedA(ele.parentNode);
}
