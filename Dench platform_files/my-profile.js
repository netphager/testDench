//var isStandard;
$(function() {
    var isMobileDevice = isMobile();
    initializeDateOfBirthFields();
    initializeCountyField();
    initializeDepositValidators();
    initializeUpdateButtonClickFunction();

    if (isMobileDevice) {
        handleCurrentUser(function (currentUser) {
            if (currentUser == null) {
                 window.location.replace(config.hostUrl + "/login");
            }
            $(".my-profile").addClass("modal-show");
//            isStandard = currentUser.registrationDetailLevel == 'STANDARD';
            populateCurrentUserFields(currentUser);
        });
    } else {
        $("#web-tab-my-profile").click(function (e) {
            e.preventDefault();
            if (window.currentUser == null) {
                alert("There isn't logged user");
                return;
            }
//            isStandard = window.currentUser.registrationDetailLevel == 'STANDARD';
            populateCurrentUserFields(window.currentUser);
        });
    }
});

function initializeDateOfBirthFields() {
    initializeDateFields($("#my-profile-dateOfBirth_day"), $("#my-profile-dateOfBirth_month"), $("#my-profile-dateOfBirth_year"), "BIRTH_DATE");
}

function initializeCountyField() {
    var html = '';
    for (var k in allcountries) {
        var country = allcountries[k];
        html += '<option value="' + allcountries[k] + '">' + countriestranslations[country] + '</option>';
    }
    $("#my-profile-country").html(html);
}

function initializeUpdateButtonClickFunction() {
    $("#updateProfileBtn").click(function() {
        $("#process_message").html();

        var birthDate = $("#my-profile-dateOfBirth_year").val() + "-" + $("#my-profile-dateOfBirth_month").val() + "-" + $("#my-profile-dateOfBirth_day").val();

        if($('#myProfileForm').valid()) {
            var formData = $('#myProfileForm').serializeObject();
            formData.acceptPromotions = $("#my-profile-promotions").is(':checked');
            formData.acceptCommunication = $("#my-profile-messages").is(':checked');
            formData.dateOfBirth = birthDate;
            var data = JSON.parse(JSON.stringify(window.currentUser));
            $.each(formData, function(key, value) {
                data[key] = value;
            });

            $.ajax({
              method: "POST",
              headers : {
                "labelEntryPointCode" : config.labelCode
              },
              contentType : "application/json",
              url: config.denchApiUrl + "/api/v1/customerfacing/customers/update",
              data: JSON.stringify(data),
              dataType: "json",
              success: function (data) {
                  window.currentUser = data;
                  showSuccessMessage(translations.success);
              }
//              error: function(xhr, textStatus, errorThrown) {
//                  for (var i in error.validationErrors) {
//                      $('<div class="error">' + translations.missing_field + '</div>').insertBefore($("#" + error.validationErrors[i].parameter));
//                  }
//              }
            });
        }
    });
}

function initializeDepositValidators() {
    $.validator.addMethod('validateEmail', function (value, element) {
    return new RegExp('\\s*\\S+@\\s*\\S+\\.\\s*\\S+').test(value);
    });

//    $.validator.addMethod('validDate', function (value, element) {
//            var date = $("#my-profile-dateOfBirth_year").val() + "-" + $("#my-profile-dateOfBirth_month").val() + "-" +
//            $("#my-profile-dateOfBirth_day").val();
//            return moment(date, 'YYYY-M-D', true).isValid();
//    });

    $('#myProfileForm').validate({
        rules : {
            acc_username : {
                required : true
            },
            firstName : {
                required : isStandard
            },
            lastName : {
                required : isStandard
            },
            email : {
                 required : true,
                 validateEmail : true
            },
            title : {
                required : true
            },
            dateOfBirth_day : {
                validDate : true
            },
            dateOfBirth_month : {
                validDate : true
            },
            dateOfBirth_year : {
                validDate : true
            },
            gender : {
                required : isStandard
            },
            mobilePhone : {
                required : isStandard
            },
            country : {
                required : true
            },
            city : {
                required : isStandard
            },
            postalCode : {
                required : isStandard
            },
            address : {
                required : isStandard
            }
        },
        messages : {
            acc_username : {
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
            title : {
                required : translations.missing_field
            },
             dateOfBirth_day : {
                validDate : translations.invalid_date
            },
            dateOfBirth_month : {
                validDate : translations.invalid_date
            },
            dateOfBirth_year : {
                validDate : translations.invalid_date
            },
            gender : {
                required : translations.missing_field
            },
             mobilePhone : {
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
             }
        },
        groups : {
            dateOfBirth : "dateOfBirth_day dateOfBirth_month dateOfBirth_year"
        }
    });
}

function populateCurrentUserFields(data) {
    var bDate = data.dateOfBirth.split("-");
    var day = Number(bDate[2]);
    var month = Number(getMonth(bDate[1]));
    $("#myProfileForm [name=acc_username]").val(data.username);
    $("#myProfileForm [name=firstName]").val(data.firstName);
    $("#myProfileForm [name=lastName]").val(data.lastName);
    $("#myProfileForm [name=email]").val(data.email);
    $("#myProfileForm [name=dateOfBirth_day]").val(day);
    $("#myProfileForm [name=dateOfBirth_month]").val(month);
    $('#myProfileForm [name=dateOfBirth_month]').attr('value', month);
    $("#myProfileForm [name=dateOfBirth_year]").val(bDate[0]);
    $("#myProfileForm [name=gender]").val(data.gender);
    $("#myProfileForm [name=mobilePhone]").val(data.mobilePhone);
    $("#myProfileForm [name=city]").val(data.city);
    $("#myProfileForm [name=postalCode]").val(data.postalCode);
    $("#myProfileForm [name=address]").val(data.address);
    $("#myProfileForm [name=acceptPromotions]").prop("checked", data.acceptPromotions);
    $("#myProfileForm [name=acceptCommunication]").prop("checked", data.acceptCommunication);
    $("#myProfileForm [name=title]").val(data.title);
    $("#myProfileForm [name=country]").val(data.country);
}

function getMonth(month) {
    switch (month) {
    case 1 :
        month = translations.month_January; break;
    case 2 :
        month = translations.month_February; break;
    case 3 :
        month = translations.month_March; break;
    case 4 :
        month = translations.month_April; break;
    case 5 :
        month = translations.month_May; break;
    case 6 :
        month = translations.month_June; break;
    case 7 :
        month = translations.month_July; break;
    case 8 :
        month = translations.month_August; break;
    case 9 :
        month = translations.month_September; break;
    case 10 :
        month = translations.month_October; break;
    case 11 :
        month = translations.month_November; break;
    case 12 :
        month = translations.month_December; break;
    }

    return month;
}

function isStandard() {
    return window.currentUser.registrationDetailLevel == 'STANDARD';
}
