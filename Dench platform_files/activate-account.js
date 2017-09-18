$(function() {
    var isMobileDevice = isMobile();
    if (isMobileDevice) {
        doActivate();
    } else if (window.location.pathname.indexOf("/activate-account") >= 0) {
        openModal($("#activate-account-modal"))
        doActivate();
    }

    function doActivate() {
        var params={};
        window.location.search
            .replace(/[?&]+([^=&]+)=([^&]*)/gi, function(str,key,value) {
                params[key] = value;
            }
        );

        var username = params["username"];
        var code = params["activationKey"];

        $.ajax({
              method: "POST",
              contentType : "application/json",
              url: config.denchApiUrl + "/api/v1/customerfacing/customers/activate?username=" + username +
                    "&activationKey=" + code,
              success: function (data) {
                  $("#activate_account_process_message").html(translations.activate_success);
              },
              error : function(xhr, textStatus, errorThrown) {
                  try {
                      var error = JSON.parse(xhr.responseText);

                      if (error.errorCode == 5) {
                          $("#activate_account_process_message").removeClass("success").addClass("error")
                              .html(translations.activate_key_expired_error);
                      } else if (error.errorCode == 8 || error.errorCode == 12) {
                          $("#activate_account_process_message").removeClass("success").addClass("error")
                              .html(translations.activate_invalid_key_error);
                      } else if (error.errorCode == 48) {
                          $("#activate_account_process_message").removeClass("success").addClass("error")
                              .html(translations.activate_key_already_used);
                      } else {
                           $("#activate_account_process_message").removeClass("success").addClass("error")
                              .html(globaltranslations.internal_server_error);
                      }
                  } catch (err) {
                      $("#activate_account_process_message").removeClass("success").addClass("error")
                          .html(globaltranslations.internal_server_error);
                  }
              },
              complete: function() {
                  $("#activate_account_start").hide();
                  $("#activate_account_process_message").show();
              }
        });
    }
});