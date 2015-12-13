var pusher;

function getPusher() {
	if (!pusher) {
		Pusher.log = function(message) {
			if (window.console && window.console.log) {
				window.console.log(message);
			}
		};
		pusher = new Pusher('9d3ca23fe4e0cd26c73c', {
			authEndpoint: 'http://realtime-browsing.tomclarke.xyz/index.php'
		});
	}
	return pusher;
}

chrome.runtime.onMessage.addListener(function(request) {
	channel = getPusher().subscribe("private-" + request.token);
	
	if(request.from == "host"){
	    channel.bind('client-user_joined', function(data) {
			var html = document.documentElement.innerHTML;
			sendData(channel, "websiteHTML", html);
		});
	} else {
		channel.bind("client-sending", function(data) {
			decodeData(data);
		});

		setTimeout(function() {
			channel.trigger("client-user_joined", {nil: "nil?"});
		}, 1000);
	}

});

function websiteHTML(html) {
	document.write(html);
}

/* Sending */

var toSend = [];

function sendData(channel, packetName, str) {
	toSend.push({channel: channel, packetName: packetName, str: str, index: 0, sending: false, sent: false});
	startSendDatas();
}

var sending;

function startSendDatas() {
	if (sending) return;
	setInterval(function() {
		if (toSend.length == 0) return;
		var packet = toSend[0];

		if (!packet.sending) {
			sendOnChannel(packet.channel, {packetName: packet.packetName});
			packet.sending = true;
			return;
		}
		if (packet.sent) {
			sendOnChannel(packet.channel, {sent: true});
			toSend.shift();
			return;
		}

		var str = packet.str.substring(packet.index, packet.index + 9000);
		packet.index += 9000;

		sendOnChannel(packet.channel, {str: str});

		if (packet.index >= packet.str.length) {
			packet.sent = true;
		}
	}, 200);
}

function sendOnChannel(channel, info) {
	channel.trigger("client-sending", info);
}


/*  Decoding */

var packetName = "";
var strIn = "";

function decodeData(data) {
	if (data.sent) {
		callPackMan();
		return;
	}
	if (data.packetName) {
		packetName = data.packetName;
		strIn = "";
		return;
	}
	strIn += data.str;
}

function callPackMan() {
	switch (packetName) {
		case "websiteHTML":
			websiteHTML(strIn);
			break;
	}
}
