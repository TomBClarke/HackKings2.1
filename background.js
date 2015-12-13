var pusher;
var channel;

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
	if (channel) return; // Disallowing multiple channels. Clients should refresh the page.
	channel = getPusher().subscribe("private-" + request.token);

	if (request.from == "host") {
		channel.bind("client-receiving", function(data) {
			decodeData(true, data);
		});
		channel.bind('client-user_joined', function() {
			var html = document.documentElement.innerHTML;
			sendData(true, "websiteHTML", html);
		});

		$(window).scroll(function() {
			var scrollPercent = $(window).scrollTop() / $(document).height();
			sendData(true, "scrolled", scrollPercent.toString());
		})
	} else {
		channel.bind("client-sending", function(data) {
			decodeData(false, data);
		});

		setTimeout(function() {
			channel.trigger("client-user_joined", {nil: "nil?"});
		}, 1000);
	}

});

function websiteHTML(html) {
	document.write(html);
	setTimeout(function() {
		window.onclick = function (e) {
			var href = parentTaggedA(e.target);
			if (href) {
				e.preventDefault();
				sendData(false, "linkClicked", href);
			}
		};
	}, 1500);
}

function parentTaggedA(ele) {
	if (ele.nodeName.toLowerCase() === 'a' || ele.tagName.toLowerCase() === 'a') {
		return ele.getAttribute("href");
	}
	if (ele === document.documentElement) return null;
	return parentTaggedA(ele.parentNode);
}

function linkClicked(href) {
	window.location.href = href;
}

function scrolled(percent) {
	var p = parseFloat(percent);
	if (isNaN(p)) return;
	var h = $(document).height();
	console.log(percent);
	$("html, body").animate({ scrollTop: (p*h) }, 400);
}

/* Sending */

var toSend = [];

function sendData(host, packetName, str) {
	if (!channel) return;
	toSend.push({host: host, packetName: packetName, str: str, index: 0, sending: false, sent: false});
	startSendDatas();
}

var sending;

function startSendDatas() {
	if (sending) return;
	setInterval(function() {
		if (toSend.length == 0) return;
		var packet = toSend[0];

		if (!packet.sending) {
			sendOnChannel(packet.host, {packetName: packet.packetName});
			packet.sending = true;
			return;
		}
		if (packet.sent) {
			sendOnChannel(packet.host, {sent: true});
			toSend.shift();
			return;
		}

		var str = packet.str.substring(packet.index, packet.index + 8000);
		packet.index += 8000;

		sendOnChannel(packet.host, {str: str});

		if (packet.index >= packet.str.length) {
			packet.sent = true;
		}
	}, 200);
}

function sendOnChannel(host, info) {
	channel.trigger((host ? "client-sending" : "client-receiving"), info);
}


/*  Decoding */

var packetName = "";
var strIn = "";

function decodeData(host, data) {
	if (data.sent) {
		callPackMan(host);
		return;
	}
	if (data.packetName) {
		packetName = data.packetName;
		strIn = "";
		return;
	}
	strIn += data.str;
}

function callPackMan(host) {
	if (host) {
		switch (packetName) {
			case "linkClicked":
				linkClicked(strIn);
				break;
		}
	} else {
		switch (packetName) {
			case "websiteHTML":
				websiteHTML(strIn);
				break;
			case "scrolled":
				scrolled(strIn);
				break;
		}
	}
}
