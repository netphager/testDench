$(function() {
    var isMobileDevice = isMobile();

    initializeDateFields($("#quickDateOfBirth_day"), $("#quickDateOfBirth_month"), $("#quickDateOfBirth_year"), "BIRTH_DATE");
    initializeQuickRegisterValidators()
    initializeQuickRegisterOnclick()

    if (isMobileDevice) {
        $(".register").addClass("modal-show");
            getQuickSupportRegisterCurrencies();
            getQuickSupportRegisterCountries()
            loadQuickRegisterPage();
    } else {
        $(".register-popup").click(function() {
            if (this.getAttribute("data-modal-open") == ".quick-register-modal") {
                getQuickSupportRegisterCurrencies();
                getQuickSupportRegisterCountries()
                loadQuickRegisterPage();
            }
        });
    }

    function getQuickSupportRegisterCurrencies() {
        $.ajax({
              method: "GET",
              headers : {
                "labelEntryPointCode" : config.labelCode
              },
              contentType : "application/json",
              url: config.denchApiUrl + "/api/v1/customerfacing/supportedcurrencies",
              dataType: "json",
              success: function (data) {
                  var html = '<option value="">' + translations.registration_currency_dropdown_default + ' *</option>';
                  for (var k in data) {
                      html += '<option value="' + data[k] + '">' + data[k] + '</option>';
                  }

                  $("#quickCurrency").html(html);
              }
        });
    }

    function getQuickSupportRegisterCountries() {
        $.ajax({
              method: "GET",
              headers : {
                "labelEntryPointCode" : config.labelCode
              },
              contentType : "application/json",
              url: config.denchApiUrl + "/api/v1/customerfacing/supportedregistrationcountries",
              dataType: "json",
              success: function (data) {
                  var html = '<option value="">' + translations.registration_country_dropdown_default +' *</option>';
                  for (var k in data) {
                      var country = data[k];
                      html += '<option value="' + data[k] + '">' + countriestranslations[country] + '</option>';
                  }

                  $("#quickCountry").html(html);
              }
        });
    }

    function initializeQuickRegisterValidators() {
        $.validator.addMethod('quickValidateEmail', function (value, element) {
            return new RegExp('\\s*\\S+@\\s*\\S+\\.\\s*\\S+').test(value);
        });

        $.validator.addMethod('quickValidPassString', function (value, element) {
             // RegExps:
             // should contain at least one digit (/^(?=.*\d)
             // should contain at least one lower case (?=.*[a-z])
            return (new RegExp(/^(?=.*[A-Z])[0-9a-zA-Z]\S{6,27}$/).test(value));
        }, translations.registration_validation_password_invalid)

        $.validator.addMethod('quickValidUsernameString', function (value, element) {
            return (new RegExp(/^\S{6,27}$/).test(value));
        }, translations.registration_validation_username_invalid)

        $.validator.addMethod('quickValidRegDate', function (value, element) {
            var day = $(element).closest(".overall-date").find(".date-dropdown.day").val();
            var month = $(element).closest(".overall-date").find(".date-dropdown.month").val();
            var year = $(element).closest(".overall-date").find(".date-dropdown.year").val();
            var date = year + "-" + month + "-" + day;
            if (moment().diff(date, 'years', true) >= 18) {
                return true;
            }
            return false;
        }, translations.registration_validation_birth_date_invalid);

        $('#quickRegisterForm').validate({
            rules : {
                quickUsername : {
                    required : true,
                    quickValidUsernameString: true
                },
                quickEmail : {
                     required : true,
                     quickValidateEmail : true
                },
                quickPassword : {
                     required : true,
                     quickValidPassString: true
                },
                quickCurrency : {
                    required : true
                },
                quickCountry : {
                    required : true
                },
                quickDateOfBirth_day : {
                    required : true,
                    validDate : true,
                    quickValidRegDate : true
                },
                quickDateOfBirth_month : {
                    required : true,
                    validDate : true,
                    quickValidRegDate : true
                },
                quickDateOfBirth_year : {
                    required : true,
                    validDate : true,
                    quickValidRegDate : true
                },
                quickAcceptTAC : {
                   required : true
                }
            },
            messages : {
                quickUsername : {
                    required : translations.missing_field
                },
                quickEmail : {
                      required : translations.missing_field,
                      quickValidateEmail : translations.email_format_error
                },
                quickPassword : {
                    required : translations.missing_field
                },
                quickDateOfBirth_day : {
                    required : translations.missing_field,
                    validDate : translations.invalid_birth_date
                },
                quickDateOfBirth_month : {
                    required : translations.missing_field,
                    validDate : translations.invalid_birth_date
                },
                quickDateOfBirth_year : {
                    required : translations.missing_field,
                    validDate : translations.invalid_birth_date
                },
                quickCurrency : {
                   required : translations.missing_field
                },
                quickCountry : {
                    required : translations.missing_field
                },
                quickAcceptTAC : {
                   required : translations.missing_field
                }
            },
            groups : {
                dateOfBirth : "quickDateOfBirth_day quickDateOfBirth_month quickDateOfBirth_year"
            }
        });
    }

    function initializeQuickRegisterOnclick() {
        $("#quickRegisterButton").click(function() {
            if ($('#quickRegisterForm').valid()) {
                $("#process_message").html();
                var form = $("#quickRegisterForm");
                var birthDate = form.find("#quickDateOfBirth_year").val() + "-" + form.find("#quickDateOfBirth_month").val() + "-" + form.find
                ("#quickDateOfBirth_day").val();
                var data = {};
                data.currency = $("#quickCurrency").val();
                data.username = $("#quickUsername").val();
                data.password = $("#quickPassword").val();
                data.email = $("#quickEmail").val();
                data.country = $("#quickCountry").val();
                data.registrationDetailLevel = $("#quickRegistrationDetailLevel").val();
                data.dateOfBirth = birthDate;
                data.acceptPromotions = $("#quickAcceptPromotions").is(":checked");
                data.acceptCommunication = $("#quickAcceptCommunication").is(":checked");
                data.acceptTermsAndConditions = $("#quickAcceptTAC").is(":checked");

                $.ajax({
                    method: "POST",
                    headers : {
                        "labelEntryPointCode" : config.labelCode
                    },
                    contentType : "application/json",
                    url: config.denchApiUrl + "/api/v1/customerfacing/customers/register?captchaVerified=true",
                    data: JSON.stringify(data),
                    dataType: "json",
                    success: function (data) {
                        $('#quick-register-form-container').hide();
                        $('#quick-registration-success-message').show();
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

    function loadQuickRegisterPage() {
        $('#quickRegisterForm')[0].reset();
        $('#quickRegisterForm').validate().resetForm();
        $('.error').each(function(){
             $(this).removeClass("error");
        });
        $('#quick-register-form-container').show();
        $('#quick-registration-success-message').hide();
    }

})