
function registerHostEvents() {
    registerLinkClicksH();
    registerScrollH();
}

function registerLinkClicksH() {
    window.onclick = function (e) {
        var href = parentTaggedA(e.target);
        if (href) {
            e.preventDefault();
            setURL(href);
        }
    };
}

function registerScrollH() {
    $(window).scroll( $.throttle( 100, function() {
        var scrollPercent = $(window).scrollTop() / $(document).height();
        sendData("scrolled", scrollPercent.toString());
    }));
}
