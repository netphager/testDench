$( document ).ready(function() {
	$("#show-navigation").click(function() {
		$("#navigationMenu").addClass("navigation-open");
		$("#navigation-overlay").css("display", "block");
		$(".main-container").addClass("noscroll");
	});
	
	$("#hide-navigation, #navigation-overlay").click(function() {
		$("#navigationMenu").removeClass("navigation-open");
		$("#navigation-overlay").css("display", "none");
		$(".main-container").removeClass("noscroll");		 
	});
});