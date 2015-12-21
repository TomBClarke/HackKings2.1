
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
        //noinspection JSValidateTypes It is infact a function.
        var scrollVPercent = $(window).scrollTop() / $(document).height();
        //noinspection JSValidateTypes It is infact a function.
        var scrollHPercent = $(window).scrollLeft() / $(document).width();
        sendData("scrolled", scrollVPercent.toString() + " " + scrollHPercent.toString());
    }));
}
