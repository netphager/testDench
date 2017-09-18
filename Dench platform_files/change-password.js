var username = null;
$(function () {
    var isMobileDevice = isMobile();
    initializeChangePasswordValidators()
    initializeChangePasswordOnClicks()

    if (isMobileDevice) {
        handleCurrentUser(function (currentUser) {
            if (currentUser == null) {
                 window.location.replace(config.hostUrl + "/login");
                 return;
            }
            username = currentUser.username;
        });
        $(".change-password").addClass("modal-show");
    } else {
        $("#web-tab-change-password").click(function (e) {
            e.preventDefault();
			username = window.currentUser.username;
        });
    }
});

function initializeChangePasswordOnClicks() {
    $("#logoutButtonChange").click(function() {
		window.location.replace(config.hostUrl);
        $.ajax({
            method: "POST",
            url: config.denchApiUrl + "/api/v1/customerfacing/logout",
            success: function (data) {
                if (isMobileDevice) {
                    window.location.replace(config.hostUrl);
                } else {
                    handleLogout();
                }
            }
        });
    });

    $("#homeButton").click(function() {
        window.location.replace(config.hostUrl);
    });

    $("#change-password").click(function() {
        $("#process_message").html();

        var oldPassword = $("#oldPassword").val();
        var newPassword = $("#newPassword").val();
        var confirmPassword = $("#confirmPassword").val();

        if ($('#changePasswordForm').valid()){
            $.ajax({
                  method: "POST",
                  headers : {
                    "labelEntryPointCode" : config.labelCode
                  },
                  url: config.denchApiUrl + "/api/v1/customerfacing/customers/changePassword?username=" + username + "&oldPassword=" + oldPassword + "&newPassword=" + newPassword,
                  success: function (data) {
                      $("#change_password").hide();
                      $("#logout_and_home").show();
                      showSuccessMessage(translations.password_reset);
                  }
            });
            $('#oldPassword').val("");
            $('#newPassword').val("");
            $('#confirmPassword').val("");
        }

    });
}

function initializeChangePasswordValidators() {
    $.validator.addMethod('matchNewPassword', function (value, element) {
        if(value == $('#newPassword').val()) {
            return true;
        }
        return false;
    }, translations.change_password_not_match_validation_error_message);

    $.validator.addMethod('validPassString', function (value, element) {
         // RegExps:
         // should contain at least one digit (/^(?=.*\d)
         // should contain at least one lower case (?=.*[a-z])
        return (new RegExp(/^(?=.*[A-Z])[0-9a-zA-Z]\S{5,27}$/).test(value));
    }, translations.registration_validation_password_invalid)

    $('#changePasswordForm').validate({
            rules : {
                oldPassword : {
                    required : true
                },
                newPassword : {
                    required : true,
                    validPassString : true
                },
                confirmPassword : {
                    required : true,
                    matchNewPassword : true
                }
            },
            messages : {
                oldPassword : {
                    required : translations.missing_field
                },
                newPassword : {
                    required : translations.missing_field
                },
                confirmPassword : {
                    required : translations.missing_field
                }
            }
    });
}
