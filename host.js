
function sendHTML() {
    $('a, link').each(function(){$(this).attr('href', this.href);});
    $('img, script, iframe').each(function(){$(this).attr('src', this.src);});
    var html = document.documentElement.innerHTML;
    sendData("websiteHTML", html);
}

/* Sending */

var packetList = [];

function sendData(packetName, str) {
    if (!channel) return;
    packetList.push({packetName: packetName, str: str, index: 0, sending: false, sent: false});
    startSendDatas();
}

var sendingDatas = false;

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

function decodeData(data) {
    packetName = data.packetName;
    strIn = data.str;
    callPackMan(packetName, strIn);
}

/* PackMan */

function callPackMan(packetName, strIn) {
    switch (packetName) {
        case "linkClicked":
            linkClicked(strIn);
            break;
    }
}

function linkClicked(href) {
    chrome.storage.local.set({"token": token, "from": from});
    window.location.href = href;
}
