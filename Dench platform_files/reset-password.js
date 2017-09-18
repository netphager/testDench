var params={};
window.location.search
  .replace(/[?&]+([^=&]+)=([^&]*)/gi, function(str,key,value) {
    params[key] = value;
  }
);

var username = params["username"];
var code = params["key"];

$(function () {
    var isMobileDevice = isMobile();
    if (isMobileDevice) {
        initMobilePage();
    } else if (window.location.pathname.indexOf("/reset-password") >= 0) {
        openModal($("#reset-password-modal"))
    }

    $.validator.addMethod('validPassString', function (value, element) {
         // RegExps:
         // should contain at least one digit (/^(?=.*\d)
         // should contain at least one lower case (?=.*[a-z])
        return (new RegExp(/^(?=.*[A-Z])[0-9a-zA-Z]\S{5,27}$/).test(value));
    }, translations.registration_validation_password_invalid)

    $('#reset_pass').validate({
        rules : {
            password : {
                required : true,
                validPassString : true
            },
            confirmpassword : {
                equalTo : "#password-for-reset"
            }
        },
        messages : {
            password : {
                required : translations.missing_field
            },
            confirmpassword : {
                equalTo : translations.password_not_match
            }
        }
    });

    $('#reset_password').click(function () {
        if ($('#reset_pass').valid()) {
            resetPassword();
        }
    });

    function initMobilePage() {
        $("#login").click(function() {
            window.location.replace(config.hostUrl + "/login");
        });

        $("#home").click(function() {
            window.location.replace(config.hostUrl);
        });

        $(".reset-password").addClass("modal-show");
    }

    function resetPassword() {
        var password = $("#password-for-reset").val();
        $.ajax({
              method: "POST",
              headers : {
                "labelEntryPointCode" : config.labelCode
              },
              url: config.denchApiUrl + "/api/v1/customerfacing/changePassword?username=" + username + "&key=" + code + "&newPassword=" + password,
              success: function (data) {
                  $("#reset_password_container").html('<div class="success">' + translations.password_reset + '</div>');
                  $("#login_and_home").show();
              },
              error : function(xhr, textStatus, errorThrown) {
                  try {
                      var error = JSON.parse(xhr.responseText);

                      if (error.errorCode == 5) {
                         showErrorMessage(translations.activate_key_expired_error);
                      } else if (error.errorCode == 8 || error.errorCode == 12) {
                          showErrorMessage(translations.activate_invalid_key_error);
                      } else if (error.errorCode == 48) {
                          showErrorMessage(translations.activate_key_already_used);
                      } else {
                          showErrorMessage(globaltranslations.internal_server_error);
                      }
                  } catch (err) {
                      showErrorMessage(globaltranslations.internal_server_error);
                  }
              }
        });
    }
});
