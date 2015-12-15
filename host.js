/**
 * Sends the current page's HTML to the clients.
 */
function sendHTML() {
    $('a, link').each(function(){$(this).attr('href', this.href);});
    $('img, script, iframe').each(function(){$(this).attr('src', this.src);});
    var str = JSON.stringify({
        href: window.location.href,
        siteVer: siteVer,
        html: document.documentElement.innerHTML
    });
    sendData("websiteHTML", str);
}

/* Sending */

var packetList = [];

/**
 * Sends a packet of data to the client.
 * @param {string} packetName The name of the packet.
 * @param {string} str The packet's data. Must be a string.
 */
function sendData(packetName, str) {
    if (!channel) return;
    packetList.push({packetName: packetName, str: str, index: 0, sending: false, sent: false});
    startSendDatas();
}

var sendingDatas = false;

/**
 * Starts sending any packets added to the packetList to the clients.
 * Packets may be split into partial-packets depending on size.
 * This is a singleton.
 */
function startSendDatas() {
    if (sendingDatas) return;
    sendingDatas = true;
    setInterval(function() {
        if (packetList.length == 0) return;
        if (!connected) return;

        var packet = packetList[0];

        if (packet.str.length < 8000) {
            sendOnChannel(true, {packetName: packet.packetName, str: packet.str, singleSend: true});
            packetList.shift();
            return
        }

        if (!packet.sending) {
            sendOnChannel(true, {packetName: packet.packetName});
            packet.sending = true;
            return;
        }
        if (packet.sent) {
            sendOnChannel(true, {sent: true});
            packetList.shift();
            return;
        }

        var str = packet.str.substring(packet.index, packet.index + 8000);
        packet.index += 8000;

        sendOnChannel(true, {str: str});

        if (packet.index >= packet.str.length) {
            packet.sent = true;
        }
    }, 140);
}

/* Decoding */

/**
 * Decodes a data packet from the client,
 * then calls the appropriate method to handle it.
 * @param data The data packet.
 */
function decodeData(data) {
    var packetName = data.packetName;
    var strIn = data.str;

    switch (packetName) {
        case "setURL":
            setURL(strIn);
            break;
    }
}

/* PackMan */
