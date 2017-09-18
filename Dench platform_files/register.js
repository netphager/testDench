$(function() {

    var isMobileDevice = isMobile();

    populateCountryPhoneCodes($("#mobileCode"));
    initializeDateFields($("#dateOfBirth_day"), $("#dateOfBirth_month"), $("#dateOfBirth_year"), "BIRTH_DATE");
    initializeRegisterValidators()
    initializeRegisterOnclick()

    if (isMobileDevice) {
        $(".register").addClass("modal-show");
            getSupportRegisterCurrencies($('#currency'));
            getSupportRegisterCountries($('#country'));
            loadRegisterPage();
    } else {
        $(".register-popup").click(function() {
            if (this.getAttribute("data-modal-open") == ".standard-register-modal") {
                getSupportRegisterCurrencies($('#currency'));
                getSupportRegisterCountries($('#country'));
                loadRegisterPage();
            }
        });
    }

    function initializeRegisterValidators() {
        $.validator.addMethod('validateEmail', function (value, element) {
            return new RegExp('\\s*\\S+@\\s*\\S+\\.\\s*\\S+').test(value);
        });

        $.validator.addMethod('emailMatch', function (value, element) {
            var email = $("#register-email").val();
            return value === email;
        }, translations.registration_validation_email_not_match);

        $.validator.addMethod('passMatch', function (value, element) {
            var password = $("#register-password").val();
            return value === password;
        }, translations.registration_validation_pass_not_match);

        $.validator.addMethod('validPassString', function (value, element) {
             // RegExps:
             // should contain at least one digit (/^(?=.*\d)
             // should contain at least one lower case (?=.*[a-z])
            return (new RegExp(/^(?=.*[A-Z])[0-9a-zA-Z]\S{5,27}$/).test(value));
        }, translations.registration_validation_password_invalid)

        $.validator.addMethod('validUsernameString', function (value, element) {
            return (new RegExp(/^\S{6,27}$/).test(value));
        }, translations.registration_validation_username_invalid)

        $.validator.addMethod('validRegDate', function (value, element) {
            var dayElement = $(element).closest(".overall-date").find(".date-dropdown.day");
            var monthElement = $(element).closest(".overall-date").find(".date-dropdown.month");
            var yearElement = $(element).closest(".overall-date").find(".date-dropdown.year");
            var day = dayElement.val();
            var month = monthElement.val();
            var year = yearElement.val();
            var date = year + "-" + month + "-" + day;
            if (moment(date, 'YYYY-M-D', true).isValid() && moment().diff(date, 'years', true) >= 18) {
                return true;
            } else {
                return false;
            }
        });

        $('#registerForm').validate({
            rules : {
                username : {
                    required : true,
                    validUsernameString: true
                },
                firstName : {
                    required : true
                },
                lastName : {
                    required : true
                },
                email : {
                     required : true,
                     validateEmail : true
                },
                confirmEmail : {
                    required : true,
                    validateEmail : true,
                    emailMatch : true
                },
                password : {
                     required : true,
                     validPassString: true
                },
                repeatPassword : {
                    required : true,
                    passMatch : true
                },
                currency : {
                    required : true
                },
                dateOfBirth_day : {
                    validRegDate : true
                },
                dateOfBirth_month : {
                    validRegDate : true
                },
                dateOfBirth_year : {
                    validRegDate : true
                },
                mobilePhone : {
                    required : true
                },
                country : {
                    required : true
                },
                city : {
                    required : true
                },
                postalCode : {
                    required : true
                },
                address : {
                    required : true
                },
                acceptTAC : {
                   required : true
                },
                currency : {
                     required : true
                }
            },
            messages : {
                username : {
                    required : translations.missing_field
                },
                firstName : {
                    required : translations.missing_field
                },
                lastName : {
                    required : translations.missing_field
                },
                email : {
                      required : translations.missing_field,
                      validateEmail : translations.email_format_error
                },
                confirmEmail : {
                    required : translations.missing_field,
                    validateEmail : translations.email_format_error
                },
                password : {
                    required : translations.missing_field
                },
                repeatPassword : {
                    required : translations.missing_field
                },
                dateOfBirth_day : {
                     validRegDate :  translations.registration_validation_birth_date_invalid
                },
                dateOfBirth_month : {
                     validRegDate : ""
                },
                dateOfBirth_year : {
                     validRegDate : ""
                },
                 mobilePhone : {
                     required : translations.missing_field
                 },
                 currency : {
                    required : translations.missing_field
                 },
                 country : {
                     required : translations.missing_field
                 },
                 city : {
                     required : translations.missing_field
                 },
                 postalCode : {
                     required : translations.missing_field
                 },
                 address : {
                     required : translations.missing_field
                 },
                 acceptTAC : {
                    required : translations.missing_field
                 }
            }
//            ,
//            groups : {
//                dateOfBirth : "dateOfBirth_day dateOfBirth_month dateOfBirth_year"
//            }
        });
    }
    function initializeRegisterOnclick() {
        $('#country').change(function () {
            var selectedCountry = $("#country").val();
            var phoneCode = countryPhoneCodes[selectedCountry];
            $('#mobileCode').val(phoneCode);
        })

        $("#registerButton").click(function() {
            if ($('#registerForm').valid()) {
                $("#process_message").html();

                var form = $("#registerForm");
                var birthDate = form.find("#dateOfBirth_year").val() + "-" + form.find("#dateOfBirth_month").val() + "-" + form.find("#dateOfBirth_day").val();
                var mobilePhone = form.find("#mobileCode").val() + form.find("#mobilePhone").val();

                var data = form.serializeObject();
                data.dateOfBirth = birthDate;
                data.mobilePhone = mobilePhone;
                data.acceptPromotions = data.acceptPromotions == 'on';
                data.acceptCommunication = data.acceptCommunication == 'on';
                data.acceptTermsAndConditions = data.acceptTAC == 'on';

                $.ajax({
                    method: "POST",
                    headers : {
                        "labelEntryPointCode" : config.labelCode
                    },
                    contentType : "application/json",
                    url: config.denchApiUrl + "/api/v1/customerfacing/customers/register?captchaVerified=" + data.captchaVerified,
                    data: JSON.stringify(data),
                    dataType: "json",
                    success: function (data) {
                        $('#register-form-container').hide();
                        $('#registration-success-message').show();
                    }
                });
            }
        });

        $('body').on('click touchend', '[data-toggle="tooltip"]', function(e) {
            e.stopPropagation();
            $(this).tooltip('show');
        })

        $('body').on('mouseover', '[data-toggle="tooltip"]', function(e) {
            e.stopPropagation();
            $(this).tooltip('show');
        })

        $('body').on('mouseleave', '[data-toggle="tooltip"]', function(e) {
            e.stopPropagation();
            $(this).tooltip('hide');
        })
    }

    function loadRegisterPage() {
        $('#registerForm')[0].reset();
        $('#registerForm').validate().resetForm();
        $('.error').each(function(){
             $(this).removeClass("error");
        });
        $('#register-form-container').show();
        $('#registration-success-message').hide();
    }


    $('body').on('change', '.overall-date .date-dropdown.day', function(e) {
        var container = $(this).closest(".overall-date");
        container.find(".date-dropdown.month").valid();
        container.find(".date-dropdown.year").valid();
        container.find(".date-dropdown.day").valid();
    })

    $('body').on('change', '.overall-date .date-dropdown.month', function(e) {
        var container = $(this).closest(".overall-date");
        container.find(".date-dropdown.day").valid();
        container.find(".date-dropdown.year").valid();
        container.find(".date-dropdown.month").valid();
    })

    $('body').on('change', '.overall-date .date-dropdown.year', function(e) {
        var container = $(this).closest(".overall-date");
        container.find(".date-dropdown.day").valid();
        container.find(".date-dropdown.month").valid();
        container.find(".date-dropdown.year").valid();
    })

});