$(function () {
	var isMobileDevice = isMobile();
	
	if (isMobileDevice) {
		$(".forgot-password").addClass("modal-show");
	}


	$("#forgot_password_continue").click(function() {

    	$("#process_message").html();

    	var email = $("#forgot-password-email").val();
    	if (email.length == 0){
    	    $("#process_message").html(translations.empty_email_error);
    	} else{
    	    $.ajax({
        		  method: "POST",
        		  headers : {
        			"labelEntryPointCode" : config.labelCode
        		  },
        		  url: config.denchApiUrl + "/api/v1/customerfacing/customers/forgotPassword?username=" + email,
        		  success: function (data) {
        			  showSuccessMessage(translations.email_sent);
        		  }
        	});
    	}
    });
});