$(document).ready(function() {
    var isMobileDevice = isMobile();

    if (isMobileDevice) {
        var showChar = 45;  // How many characters are shown by default
        var ellipsestext = "...";
        var content = $("#longText").html();
        if(content.length > showChar) {
            var shortText = content.substr(0, showChar) + ellipsestext;
            $("#shortText").html(shortText);
        }

        $(".footer").show();

        $(".plus-minus-marker").click(function(){
            if($(this).hasClass("icon-arrow_up")) {
                $(this).removeClass("icon-arrow_up");
                $(this).addClass("icon-arrow_down");
            } else {
                $(this).removeClass("icon-arrow_down");
                $(this).addClass("icon-arrow_up");
            }
            $("#shortText").toggle();
            $("#longText").toggle();
        });
	}

    //handle different protocol length
    $(".domain-name").html(getDomainName(config.homeUrl));

	function getDomainName(homeUrl) {
        var result;
        if (~homeUrl.indexOf("https")) {
            result = homeUrl.substring(8);
        } else {
            result = homeUrl.substring(7);
        }
        return result;
    }
});