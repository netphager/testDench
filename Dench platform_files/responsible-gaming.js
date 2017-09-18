var currentLimit;
var currentSelfExclusion = [];
$(function() {
    var defaultResponsibleGamingLimits = {};

    initializeSelfExclusionDateFields();
    initializeSettingsOnClicks();
    initializeSelfExclusionsValidator();
    initializeResponsibleGamingValidator();
    initializeSecretQuestions();

	var isMobileDevice = isMobile();
	if (isMobileDevice) {
        $(".responsible-gaming").addClass("modal-show");
        $('#accordion').collapsible({
            accordion: true
        });
        handleCurrentUser(function() {
            if (window.currentUser == null) {
                window.location.replace(config.hostUrl + "/login");
            } else {
                getResponsibleGamingDefaultLimitConfiguration();
                setSecuritySettings();
            }
        });
    } else {
        $("#web-tab-settings").click(function (e) {
            e.preventDefault();
            getResponsibleGamingDefaultLimitConfiguration();
            setSecuritySettings();
        });
    }

    function setSecuritySettings() {
        var currentUser = window.currentUser;
        if (!isBlank(currentUser.pin)) {
            $("#security_checkbox_pin").prop('checked', true).trigger('change');
            $("#customer_pin").val(currentUser.pin);
        }
        if (!isBlank(currentUser.secretAnswer)) {
            $("#security_checkbox_question_and_answer").prop('checked', true).trigger('change');
            $("#customer_secret_question_key").val(currentUser.secretQuestionKey).trigger('change');
            $("#customer_secret_question").val(currentUser.secretQuestion);
            $("#customer_secret_answer").val(currentUser.secretAnswer);
        }
    }

    function initializeSecretQuestions() {
        var secretQuestionKeys =
            ["FAVOURITE_PET", "CITY_BORN", "HIGH_SCHOOL", "MOTHER_MAIDEN_NAME", "FAVOURITE_COLOR", "CUSTOM"];
        var optionsHtml = '<option value="">---</option>';
        for (var i = 0; i < secretQuestionKeys.length; i++) {
            var secretQuestionKey = secretQuestionKeys[i];
            optionsHtml += '<option value="' + secretQuestionKey + '">' +
                translations['secret_question_' + secretQuestionKey.toLowerCase()] + '</option>';
        }
        $("#customer_secret_question_key").html(optionsHtml);

        $("#security_checkbox_pin").change(function() {
            if (this.checked) {
                $("#customer_pin_area").show();
            } else {
                $("#customer_pin_area").hide().find(':input').val('');
            }
        });

        $("#security_checkbox_question_and_answer").change(function() {
            if (this.checked) {
                $("#customer_question_and_answer_area").show();
            } else {
                $("#customer_question_and_answer_area").hide().find(':input').val('');
            }
        });

        $("#customer_secret_question_key").change(function() {
            if ($(this).val() == 'CUSTOM') {
                $("#customer_custom_secret_question_area").show();
            } else {
                $("#customer_custom_secret_question_area").hide().find(':input').val('');
            }
        });

        $("#saveSecurityChangesBtn").click(function() {
            if ($('#securitySettingsForm').valid()) {
                var formData = $('#securitySettingsForm').serializeObject();
                if (isBlank(formData.secretQuestionKey)) {
                    formData.secretQuestionKey = null;
                }
                var data = window.currentUser;
                $.each(formData, function(key, value) {
                    data[key] = value;
                });

                $.ajax({
                    type : 'POST',
                    url : config.denchApiUrl + "/api/v1/customerfacing/customers/update",
                    headers : {
                      "labelEntryPointCode" : config.labelCode
                    },
                    contentType: "application/json",
                    data: JSON.stringify(data),
                    dataType : "json",
                    success : function () {
                        $("#customer_security_password").val('');
                        showSuccessMessage(translations.success);
                    }
                });
            }
        });

        $('#securitySettingsForm').validate({
            rules : {
                pin : {
                    required: true,
                },
                secretQuestionKey : {
                    required: true,
                },
                secretQuestion : {
                    required: true,
                },
                secretAnswer : {
                    required: true,
                },
                password : {
                    required: true,
                }
            }
        });
    }

    function getResponsibleGamingDefaultLimitConfiguration() {
        $.ajax({
            type : 'GET',
            url : config.denchApiUrl + "/api/v1/customerfacing/customers/gaming/responsibleGaming/limits/default",
            headers : {
               "labelEntryPointCode" : config.labelCode
            },
            success : function (response) {
                defaultResponsibleGamingLimits = response;
                initializeCustomersResponsibleGamingLimits(window.currentUser);
                populateSelfExclusions(window.currentUser);
            },
//            error : function () {
//                //TODO Discuss with Marto how we are going to handle that case?
//            }
        });
    }

    function initializeCustomersResponsibleGamingLimits(currentCustomer) {
        var customersResponsibleGamingLimits = {};
        if (null == currentCustomer || currentCustomer.responsibleGaming == null) {
            customersResponsibleGamingLimits = defaultResponsibleGamingLimits;
        } else {
            customersResponsibleGamingLimits = currentCustomer.responsibleGaming;
            if (customersResponsibleGamingLimits.maxDepositAmount == null) {
                customersResponsibleGamingLimits.maxDepositAmount = defaultResponsibleGamingLimits.maxDepositAmount;
            }
            if (customersResponsibleGamingLimits.maxWithdrawMonthly == null) {
                customersResponsibleGamingLimits.maxWithdrawMonthly = defaultResponsibleGamingLimits.maxWithdrawMonthly;
            }
            if (customersResponsibleGamingLimits.maxWithdrawDaily == null) {
                customersResponsibleGamingLimits.maxWithdrawDaily = defaultResponsibleGamingLimits.maxWithdrawDaily;
            }
            if (customersResponsibleGamingLimits.maxWithdrawWeekly == null) {
                customersResponsibleGamingLimits.maxWithdrawWeekly = defaultResponsibleGamingLimits.maxWithdrawWeekly;
            }
            if (customersResponsibleGamingLimits.maxDepositDaily == null) {
                customersResponsibleGamingLimits.maxDepositDaily = defaultResponsibleGamingLimits.maxDepositDaily;
            }
            if (customersResponsibleGamingLimits.maxDepositWeekly == null) {
                customersResponsibleGamingLimits.maxDepositWeekly = defaultResponsibleGamingLimits.maxDepositWeekly;
            }
            if (customersResponsibleGamingLimits.maxDepositMonthly == null) {
                customersResponsibleGamingLimits.maxDepositMonthly = defaultResponsibleGamingLimits.maxDepositMonthly;
            }
            if (customersResponsibleGamingLimits.maxLossDaily == null) {
                customersResponsibleGamingLimits.maxLossDaily = defaultResponsibleGamingLimits.maxLossDaily;
            }
            if (customersResponsibleGamingLimits.maxLossWeekly == null) {
                customersResponsibleGamingLimits.maxLossWeekly = defaultResponsibleGamingLimits.maxLossWeekly;
            }
            if (customersResponsibleGamingLimits.maxLossMonthly == null) {
                customersResponsibleGamingLimits.maxLossMonthly = defaultResponsibleGamingLimits.maxLossMonthly;
            }
            if (customersResponsibleGamingLimits.maxPlacebetsDaily == null) {
                customersResponsibleGamingLimits.maxPlacebetsDaily = defaultResponsibleGamingLimits.maxPlacebetsDaily;
            }
            if (customersResponsibleGamingLimits.maxPlacebetsWeekly == null) {
                customersResponsibleGamingLimits.maxPlacebetsWeekly = defaultResponsibleGamingLimits.maxPlacebetsWeekly;
            }
            if (customersResponsibleGamingLimits.maxPlacebetsMonthly == null) {
                customersResponsibleGamingLimits.maxPlacebetsMonthly = defaultResponsibleGamingLimits.maxPlacebetsMonthly;
            }
            if (customersResponsibleGamingLimits.sessionLength == null) {
                customersResponsibleGamingLimits.sessionLength = defaultResponsibleGamingLimits.sessionLength;
            }
        }
        populateResponsibleGamingFields(customersResponsibleGamingLimits);
    }

    function populateResponsibleGamingFields(customersResponsibleGamingLimits) {
        $("#maxPlacebetsMonthly").val(renderResponsibleGamingLimits(customersResponsibleGamingLimits.maxPlacebetsMonthly));
        $("#maxPlacebetsWeekly").val(renderResponsibleGamingLimits(customersResponsibleGamingLimits.maxPlacebetsWeekly));
        $("#maxPlacebetsDaily").val(renderResponsibleGamingLimits(customersResponsibleGamingLimits.maxPlacebetsDaily));
        $("#maxLossMonthly").val(renderResponsibleGamingLimits(customersResponsibleGamingLimits.maxLossMonthly));
        $("#maxLossWeekly").val(renderResponsibleGamingLimits(customersResponsibleGamingLimits.maxLossWeekly));
        $("#maxLossDaily").val(renderResponsibleGamingLimits(customersResponsibleGamingLimits.maxLossDaily));
        $("#maxDepositAmount").val(renderResponsibleGamingLimits(customersResponsibleGamingLimits.maxDepositAmount));
        $("#maxWithdrawMonthly").val(renderResponsibleGamingLimits(customersResponsibleGamingLimits.maxWithdrawMonthly));
        $("#maxWithdrawDaily").val(renderResponsibleGamingLimits(customersResponsibleGamingLimits.maxWithdrawDaily));
        $("#maxWithdrawWeekly").val(renderResponsibleGamingLimits(customersResponsibleGamingLimits.maxWithdrawWeekly));
        $("#maxDepositDaily").val(renderResponsibleGamingLimits(customersResponsibleGamingLimits.maxDepositDaily));
        $("#maxDepositWeekly").val(renderResponsibleGamingLimits(customersResponsibleGamingLimits.maxDepositWeekly));
        $("#maxDepositMonthly").val(renderResponsibleGamingLimits(customersResponsibleGamingLimits.maxDepositMonthly));
        populateSessionLengthFields(customersResponsibleGamingLimits.sessionLength)

    }

    function populateSessionLengthFields(time) {
        if (null !== time && "" !== time) {
            $("#sessionLengthHours").val(Math.floor(time / 36e5));
            $("#sessionLengthMinutes").val(Math.floor((time % 36e5) / 6e4));
        }
    }

    function initializeSettingsOnClicks() {
        $(".updateResponsibleGamingSettings").click(function () {
            if ( $('#responsibleGamingLimitsForm').valid()) {
                var data = prepareUpdatedResponsibleGamingData();
                $.ajax({
                    type : 'POST',
                    url : config.denchApiUrl + "/api/v1/customerfacing/customers/responsibleGaming/settings",
                    headers : {
                      "labelEntryPointCode" : config.labelCode
                    },
                    contentType: "application/json",
                    data: JSON.stringify(data),
                    dataType : "json",
                    success : function (data) {
                        window.currentUser.responsibleGaming = data;
                        initializeCustomersResponsibleGamingLimits( window.currentUser)
                        showSuccessMessage(translations.update_responsible_gaming_settings_success)
                    },
                    error : function () {
                        showErrorMessage(translations.update_responsible_gaming_settings_failed)
                    }
                });
            }
        });

        $("#selfExcludePermanent").click(function () {
            if ($('#permanentSelfExclusionForm').valid()) {
                showConfirmationModal(translations.self_exclude_system_message, saveSystemSelfExclude);
            }
        });

        $("#selfExcludeByProduct").click(function () {
            if ($('#casinoSelfExclusionForm').valid() && $('#sportSelfExclusionForm').valid() &&
                    $('#dfsSelfExclusionForm').valid() && $('#live_casinoSelfExclusionForm').valid()) {
                showConfirmationModal(translations.self_exclude_product_message, updateProductSelfExclusions);
            } else {
                $("#invalidProductSelfExclusionForm").html(translations.self_exclude_validation_error_product_forms);
            }
        });
    }

    function initializeResponsibleGamingValidator() {
        jQuery.validator.addMethod("decimals", function (value, element) {
            return this.optional(element) || /^\d{0,20}(\.\d{0,2})?$/i.test(value);
        }, translations.amount_validation_amount_decimals);

        jQuery.validator.addMethod("validateAmount", function (value, element) {
            if ("sessionLengthMinutes" == $(element).attr("name") ||
                    "sessionLengthHours" == $(element).attr("name")) {
                value = calculateSessionTime();
            }
            return validateAmountByLimits(value, element);
        },  function(value, element) {
            if ("sessionLengthMinutes" == elementName ||
                    "sessionLengthHours" == elementName) {
                return translations.amount_validation_error_limits +
                     handleResponsibleGamingSessionTime(getResponsibleGamingLimitForElement("sessionLength"));
            }
            elementName = getElementName(element);
            return translations.amount_validation_error_limits +
                        handleNullResponsibleGamingLimit(getResponsibleGamingLimitForElement(elementName));
        });

        $('#responsibleGamingLimitsForm').validate({
            rules : {
                maxWithdrawMonthly : {
                    decimals : true,
                    validateAmount : true
                },
                maxWithdrawDaily : {
                    decimals : true,
                    validateAmount : true
                },
                maxWithdrawWeekly : {
                    decimals : true,
                    validateAmount : true
                },
                maxDepositMonthly : {
                    decimals : true,
                    validateAmount : true
                },
                maxLossWeekly : {
                    decimals : true,
                    validateAmount : true
                },
                maxPlacebetsMonthly : {
                    decimals : true,
                    validateAmount : true
                },
                maxLossMonthly : {
                    decimals : true,
                    validateAmount : true
                },
                maxPlacebetsWeekly : {
                    decimals : true,
                    validateAmount : true
                },
                maxDepositDaily : {
                   decimals : true,
                   validateAmount : true
                },
                maxPlacebetsDaily : {
                    decimals : true,
                    validateAmount : true
                },
                maxLossDaily : {
                    decimals : true,
                    validateAmount : true
                },
                maxDepositAmount : {
                    decimals : true,
                    validateAmount : true
                },
                maxDepositWeekly : {
                    decimals : true,
                    validateAmount : true
                },
                sessionLengthMinutes : {
                    number: true,
                    min : 0
                },
                sessionLengthHours: {
                    number: true,
                    min: 0
                }
            }
            ,
            messages : {
                sessionLengthHours : {
                    number : translations.session_length_validation_number,
                    validateAmount : true
                },
                sessionLengthMinutes : {
                    number : translations.session_length_validation_number,
                    validateAmount : true
                }
            },
            groups : {
                sessionLengthLimit : "sessionLengthMinutes sessionLengthHours"
            }
        });
    }

    function handleResponsibleGamingSessionTime(time) {
        var hours = Math.floor(time / 36e5);
        var minutes = Math.floor((time % 36e5) / 6e4);
        return hours + "h/" + minutes + "m"
    }

    function handleNullResponsibleGamingLimit(limit) {
        if (null == limit || "" == limit) {
            return translations.amount_validation_error_null_limit;
        }
        return limit.toFixed(2);
    }

    function validateAmountByLimits(amount, element) {
        elementName = getElementName(element);
        if(elementName == "sessionLengthHours" || elementName == "sessionLengthMinutes") {
            elementName = "sessionLength";
        }
        limit = getResponsibleGamingLimitForElement(elementName);
        if (amount == "" || ("" != amount && amount < 1) || ((limit != null && limit != 0) && (parseFloat(amount) > limit ))) {
            return false;
        }
        return true;
    }

    function getElementName(element) {
        return $(element).attr("name");
    }



    function getResponsibleGamingLimitForElement(elementName) {
        var result;
        switch(elementName) {
            case "maxPlacebetsMonthly": result = parseFloat(renderMoney(defaultResponsibleGamingLimits.maxPlacebetsMonthly)); break;
            case "maxPlacebetsWeekly": result = parseFloat(renderMoney(defaultResponsibleGamingLimits.maxPlacebetsWeekly)); break;
            case "maxPlacebetsDaily": result = parseFloat(renderMoney(defaultResponsibleGamingLimits.maxPlacebetsDaily)); break;
            case "maxLossMonthly": result = parseFloat(renderMoney(defaultResponsibleGamingLimits.maxLossMonthly)); break;
            case "maxLossWeekly": result = parseFloat(renderMoney(defaultResponsibleGamingLimits.maxLossWeekly)); break;
            case "maxLossDaily": result = parseFloat(renderMoney(defaultResponsibleGamingLimits.maxLossDaily)); break;
            case "maxDepositAmount": result = parseFloat(renderMoney(defaultResponsibleGamingLimits.maxDepositAmount)); break;
            case "maxWithdrawMonthly": result = parseFloat(renderMoney(defaultResponsibleGamingLimits.maxWithdrawMonthly)); break;
            case "maxWithdrawDaily": result = parseFloat(renderMoney(defaultResponsibleGamingLimits.maxWithdrawDaily)); break;
            case "maxWithdrawWeekly": result = parseFloat(renderMoney(defaultResponsibleGamingLimits.maxWithdrawWeekly)); break;
            case "maxDepositDaily": result = parseFloat(renderMoney(defaultResponsibleGamingLimits.maxDepositDaily)); break;
            case "maxDepositWeekly": result = parseFloat(renderMoney(defaultResponsibleGamingLimits.maxDepositWeekly)); break;
            case "maxDepositMonthly": result = parseFloat(renderMoney(defaultResponsibleGamingLimits.maxDepositMonthly)); break;
            case "sessionLength" : result = defaultResponsibleGamingLimits.sessionLength; break;
          default: result = null; break;
        }
        return result;
    }

    function prepareUpdatedResponsibleGamingData() {
        var updatedResponsibleGamingLimits = {};
        if ("" != $("#maxPlacebetsMonthly").val()) {
            updatedResponsibleGamingLimits.maxPlacebetsMonthly = $("#maxPlacebetsMonthly").val() * 100;
        }
        if ("" != $("#maxPlacebetsWeekly").val()) {
            updatedResponsibleGamingLimits.maxPlacebetsWeekly = $("#maxPlacebetsWeekly").val() * 100;
        }
        if ("" != $("#maxPlacebetsDaily").val()) {
            updatedResponsibleGamingLimits.maxPlacebetsDaily = $("#maxPlacebetsDaily").val() * 100;
        }
        if ("" != $("#maxLossMonthly").val()) {
            updatedResponsibleGamingLimits.maxLossMonthly = $("#maxLossMonthly").val() * 100;
        }
        if ("" != $("#maxLossWeekly").val()) {
            updatedResponsibleGamingLimits.maxLossWeekly = $("#maxLossWeekly").val() * 100;
        }
        if ("" != $("#maxLossDaily").val()) {
            updatedResponsibleGamingLimits.maxLossDaily = $("#maxLossDaily").val() * 100;
        }
        if ("" != $("#maxDepositAmount").val()) {
            updatedResponsibleGamingLimits.maxDepositAmount = $("#maxDepositAmount").val() * 100;
        }
        if ("" != $("#maxWithdrawMonthly").val()) {
            updatedResponsibleGamingLimits.maxWithdrawMonthly = $("#maxWithdrawMonthly").val() * 100;
        }
        if ("" != $("#maxWithdrawDaily").val()) {
            updatedResponsibleGamingLimits.maxWithdrawDaily = $("#maxWithdrawDaily").val() * 100;
        }
        if ("" != $("#maxWithdrawWeekly").val()) {
            updatedResponsibleGamingLimits.maxWithdrawWeekly = $("#maxWithdrawWeekly").val() * 100;
        }
        if ("" != $("#maxDepositDaily").val()) {
            updatedResponsibleGamingLimits.maxDepositDaily = $("#maxDepositDaily").val() * 100;
        }
        if ("" != $("#maxDepositWeekly").val()) {
            updatedResponsibleGamingLimits.maxDepositWeekly = $("#maxDepositWeekly").val() * 100;
        }
        if ("" != $("#maxDepositMonthly").val()) {
            updatedResponsibleGamingLimits.maxDepositMonthly = $("#maxDepositMonthly").val() * 100;
        }
        updatedResponsibleGamingLimits.sessionLength = calculateSessionTime();

        return updatedResponsibleGamingLimits;
    }

    function calculateSessionTime() {
        var hours = $("#sessionLengthHours").val();
        var minutes = $("#sessionLengthMinutes").val();
        var sessionLength = 0;
        if (null != hours && "" != hours) {
            sessionLength += hours*(1000*60*60);
        }
        if (null != minutes && "" != minutes) {
            sessionLength += minutes*(1000*60);
        }
        if(0 != sessionLength) {
            return sessionLength;
        }
        return null;
    }

    function populateSelfExclusions(currentCustomer) {
        if (null == currentCustomer) {
            return;
        }
        var selfExclusions = currentCustomer.selfExclusions;
        $.each(selfExclusions, function (i, selfExclusion) {
            if(selfExclusion.exclusionProduct == "CASINO") {
//                if (isCustomerSelfExcluded("CASINO")) {
                   populateAndLockProductSelfExclusionFields(selfExclusion);
//                }
            } else if(selfExclusion.exclusionProduct == "SPORT") {
//                if (isCustomerSelfExcluded("SPORT")) {
                   populateAndLockProductSelfExclusionFields(selfExclusion);
//                }
            } else if(selfExclusion.exclusionProduct == "DFS") {
//                if (isCustomerSelfExcluded("DFS")) {
                   populateAndLockProductSelfExclusionFields(selfExclusion);
//                }
            } else if(selfExclusion.exclusionProduct == "LIVE_CASINO") {
//                if (isCustomerSelfExcluded("LIVE_CASINO")) {
                   populateAndLockProductSelfExclusionFields(selfExclusion);
//                }
            } else {
                currentSelfExclusion.push(selfExclusion);
                populateAndLockSystemSelfExclusionFields(selfExclusion);
            }
        });
    }

    function initializeSelfExclusionDateFields() {
        initializeDateFields($("#fromDate_day"), $("#fromDate_month"), $("#fromDate_year"), "FUTURE_DATE");
        initializeDateFields($("#toDate_day"), $("#toDate_month"), $("#toDate_year"), "FUTURE_DATE");
        initializeDateFields($("#casinoToDate_day"), $("#casinoToDate_month"), $("#casinoToDate_year"), "FUTURE_DATE");
        initializeDateFields($("#sportToDate_day"), $("#sportToDate_month"), $("#sportToDate_year"), "FUTURE_DATE");
        initializeDateFields($("#dfsToDate_day"), $("#dfsToDate_month"), $("#dfsToDate_year"), "FUTURE_DATE");
        initializeDateFields($("#live_casinoToDate_day"), $("#live_casinoToDate_month"), $("#live_casinoToDate_year"), "FUTURE_DATE");
        initializeDateFields($("#casinoFromDate_day"), $("#casinoFromDate_month"), $("#casinoFromDate_year"), "FUTURE_DATE");
        initializeDateFields($("#sportFromDate_day"), $("#sportFromDate_month"), $("#sportFromDate_year"), "FUTURE_DATE");
        initializeDateFields($("#dfsFromDate_day"), $("#dfsFromDate_month"), $("#dfsFromDate_year"), "FUTURE_DATE");
        initializeDateFields($("#live_casinoFromDate_day"), $("#live_casinoFromDate_month"), $("#live_casinoFromDate_year"), "FUTURE_DATE");
    }

    function initializeSelfExclusionsValidator() {
        jQuery.validator.addMethod('validPeriod', function (value, element) {
            var fromToFieldValues = initializeFromToFieldValuesObject(element);
            if (("sport" == fromToFieldValues.product &&
                    $(element).parents(".selfexclude-container").find("#sportSelfExclude").prop("checked")) ||
                ("casino" == fromToFieldValues.product &&
                     $(element).parents(".selfexclude-container").find("#casinoSelfExclude").prop("checked")) ||
                ("dfs" == fromToFieldValues.product &&
                     $(element).parents(".selfexclude-container").find("#dfsSelfExclude").prop("checked")) ||
                ("live_casino" == fromToFieldValues.product &&
                     $(element).parents(".selfexclude-container").find("#live_casinoSelfExclude").prop("checked")) ||
                ("all" == fromToFieldValues.product)) {
                    return validatePeriod(fromToFieldValues);
            }
            return true;
        });

        $(".selfExclusionForm").each(function() {
            var product = $(this).closest(".selfexclude-container").attr("product");
            $(this).validate({
//                errorLabelContainer: "#" + product + "validationErrorContainerForPermanentSelfExclusion",
                ignore : ":hidden",
                rules : {
                    fromDate_day : {
                        validDate : true,
                        validPeriod : true
                    },
                    fromDate_month : {
                        validDate : true,
                        validPeriod : true
                    },
                    fromDate_year : {
                        validDate : true,
                        validPeriod : true
                    },
                    toDate_day : {
                        validDate : true,
                        validPeriod : true
                    },
                    toDate_month : {
                        validDate : true,
                        validPeriod : true
                    },
                    toDate_year : {
                        validDate : true,
                        validPeriod : true
                    },
                    exclusionReason : {
                        required : true
                    }
                },
                messages : {
                    exclusionReason : {
                        required: translations.missing_field,
                    },
                    fromDate_day : {
                        validDate : translations.invalid_date,
                        validPeriod : ""
                    },
                    fromDate_month : {
                        validDate : "",
                        validPeriod : ""
                    },
                    fromDate_year : {
                        validDate : "",
                        validPeriod : ""
                    },
                    toDate_day : {
                        validDate : translations.invalid_date,
                        validPeriod : translations.self_exclude_validation_error_period
                    },
                    toDate_month : {
                        validDate : "",
                        validPeriod : ""
                    },
                    toDate_year : {
                        validDate : "",
                        validPeriod : ""
                    }
                }
//                ,
//                groups : {
//                    validDate1 : "fromDate_day fromDate_month fromDate_year",
//                    validDate2 : "toDate_day toDate_month toDate_year",
//                    validPeriod : "fromDate_day fromDate_month fromDate_year toDate_day toDate_month toDate_year"
//                }
            });
        })
    }

    function saveSystemSelfExclude() {
        var systemSelfExclusion = [];
        var selfExclusion = {};
        selfExclusion.startDate =
            moment($("#fromDate_year").val() + "-" + $("#fromDate_month").val() + "-" + $("#fromDate_day").val()).valueOf();
        selfExclusion.endDate =
            moment($("#toDate_year").val() + "-" + $("#toDate_month").val() + "-" + $("#toDate_day").val()).valueOf();
        selfExclusion.exclusionReason = $("#exclusionReason").val();
        systemSelfExclusion.push(selfExclusion);
        var data = $.merge(systemSelfExclusion, initializeSelfExclusionPerProductDataTobeSentToServer());
        $.ajax({
            type : 'POST',
            url : config.denchApiUrl + "/api/v1/customerfacing/customers/selfExclude",
            headers : {
              "labelEntryPointCode" : config.labelCode
            },
            contentType: "application/json",
            data: JSON.stringify(data),
            success : function (response) {
                showSuccessMessage(translations.self_exclude_update_success);
            },
            error : function () {
                showErrorMessage(translations.self_exclude_update_failed);
            }
        });
    }

    function updateProductSelfExclusions() {
        var productSelfExclusions = initializeSelfExclusionPerProductDataTobeSentToServer();
        var data = $.merge(productSelfExclusions, currentSelfExclusion);
        $.ajax({
            type : 'POST',
            url : config.denchApiUrl + "/api/v1/customerfacing/customers/selfExclude",
            headers : {
              "labelEntryPointCode" : config.labelCode
            },
            contentType: "application/json",
            data: JSON.stringify(data),
            success : function (response) {
                showSuccessMessage(translations.self_exclude_update_success);
            },
            error : function () {
                showErrorMessage(translations.self_exclude_update_failed);
            }
        });
    }

    function initializeSelfExclusionPerProductDataTobeSentToServer() {
        var selfExclusions = [];
        $(".productSelfExclusionCheckbox").each(function () {
            if($(this).prop("checked")) {
                var product = $(this).closest(".selfexclude-container").attr("product");
                selfExclusions.push(buildSelfExclusionObject(product));
            }
        });
        return selfExclusions;
    }

    function buildSelfExclusionObject(product) {
        var selfExclusion = {}
        selfExclusion.exclusionProduct = product.toUpperCase();
        selfExclusion.startDate =
            moment($("#" + product + "FromDate_year").val() + "-" + $("#" + product + "FromDate_month").val() + "-" +
            $("#" + product + "FromDate_day").val())
            .valueOf();
        selfExclusion.endDate =
            moment($("#" + product + "ToDate_year").val() + "-" + $("#" + product + "ToDate_month").val() + "-" +
            $("#" + product + "ToDate_day").val()).valueOf();
        return selfExclusion;
    }

    function validatePeriod(fromToFieldValues) {
        var toDate = moment(fromToFieldValues.toDateYear + "-" + fromToFieldValues.toDateMonth + "-" +  fromToFieldValues.toDateDay, 'YYYY-M-D');
        var fromDate = moment(fromToFieldValues.fromDateYear + "-" + fromToFieldValues.fromDateMonth + "-" +  fromToFieldValues.fromDateDay, 'YYYY-M-D');
        if (((("" != fromToFieldValues.fromDateDay && "" != fromToFieldValues.fromDateMonth && "" != fromToFieldValues.fromDateYear)) &&
            fromDate.isAfter(new Date().getTime())
            && ("" == fromToFieldValues.toDateDay && "" == fromToFieldValues.toDateMonth && "" == fromToFieldValues.toDateYear)) ||
            ((("" == fromToFieldValues.fromDateDay && "" == fromToFieldValues.fromDateMonth && "" == fromToFieldValues.fromDateYear) &&
            ("" != fromToFieldValues.toDateDay && "" != fromToFieldValues.toDateMonth && "" != fromToFieldValues.toDateYear))
            && (toDate.isAfter(new Date().getTime()))) ||
            ((("" != fromToFieldValues.fromDateDay && "" != fromToFieldValues.fromDateMonth && "" != fromToFieldValues.fromDateYear) &&
            ("" != fromToFieldValues.toDateDay && "" != fromToFieldValues.toDateMonth && "" != fromToFieldValues.toDateYear)) &&
            (toDate.isAfter(new Date().getTime()) && toDate.isAfter(fromDate))) ||
            ("" == fromToFieldValues.fromDateDay && "" == fromToFieldValues.fromDateMonth && "" == fromToFieldValues.fromDateYear &&
             "" == fromToFieldValues.toDateMonth && "" == fromToFieldValues.toDateDay && "" == fromToFieldValues.toDateYear)) {
            return true;
        }
        return false;
    }

    function initializeFromToFieldValuesObject(element) {
        var product = $(element).parents(".selfexclude-container").attr("product");
        var fromToFieldValues = {};
        fromToFieldValues.product = 'all';
        if ("" != product) {
            fromToFieldValues.product = product;
        }
        if ("" == product || null == product) {
            fromToFieldValues.fromDateDay = $(element).parents(".selfexclude-container").find("#fromDate_day").val();
            fromToFieldValues.fromDateMonth = $(element).parents(".selfexclude-container").find("#fromDate_month").val();
            fromToFieldValues.fromDateYear = $(element).parents(".selfexclude-container").find("#fromDate_year").val();
            fromToFieldValues.toDateDay = $(element).parents(".selfexclude-container").find("#toDate_day").val();
            fromToFieldValues.toDateMonth = $(element).parents(".selfexclude-container").find("#toDate_month").val();
            fromToFieldValues.toDateYear = $(element).parents(".selfexclude-container").find("#toDate_year").val();
        } else {
            fromToFieldValues.fromDateDay = $(element).parents(".selfexclude-container").find("#" + product + "FromDate_day").val();
            fromToFieldValues.fromDateMonth = $(element).parents(".selfexclude-container").find("#" + product + "FromDate_month").val();
            fromToFieldValues.fromDateYear = $(element).parents(".selfexclude-container").find("#" + product + "FromDate_year").val();
            fromToFieldValues.toDateDay = $(element).parents(".selfexclude-container").find("#" + product + "ToDate_day").val();
            fromToFieldValues.toDateMonth = $(element).parents(".selfexclude-container").find("#" + product + "ToDate_month").val();
            fromToFieldValues.toDateYear = $(element).parents(".selfexclude-container").find("#" + product + "ToDate_year").val();
        }
        return fromToFieldValues;
    }

    function populateAndLockProductSelfExclusionFields(selfExclusion) {
        $("#" + selfExclusion.exclusionProduct.toLowerCase() + "SelfExclude").prop('checked', true);
        $("#" + selfExclusion.exclusionProduct.toLowerCase() + "SelfExclude").prop('disabled', true);
        if(null != selfExclusion.startDate){
            var startDate = new Date(selfExclusion.startDate);
            $("#" + selfExclusion.exclusionProduct.toLowerCase() + "FromDate_day").val(startDate.getDate());
            $("#" + selfExclusion.exclusionProduct.toLowerCase() + "FromDate_month").val(startDate.getMonth() + 1);
            $("#" + selfExclusion.exclusionProduct.toLowerCase() + "FromDate_year").val(startDate.getFullYear());
        } else {
            $("#" + selfExclusion.exclusionProduct.toLowerCase() + "FromDate_day option[value='']").html('---');
            $("#" + selfExclusion.exclusionProduct.toLowerCase() + "FromDate_month option[value='']").html('---');
            $("#" + selfExclusion.exclusionProduct.toLowerCase() + "FromDate_year option[value='']").html('---');
        }
        if(null != selfExclusion.endDate) {
            var endDate = new Date(selfExclusion.endDate);
            $("#" + selfExclusion.exclusionProduct.toLowerCase() + "ToDate_day").val(endDate.getDate());
            $("#" + selfExclusion.exclusionProduct.toLowerCase() + "ToDate_month").val(endDate.getMonth() + 1);
            $("#" + selfExclusion.exclusionProduct.toLowerCase() + "ToDate_year").val(endDate.getFullYear());
        } else {
            $("#" + selfExclusion.exclusionProduct.toLowerCase() + "ToDate_day option[value='']").html('---');
            $("#" + selfExclusion.exclusionProduct.toLowerCase() + "ToDate_month option[value='']").html('---');
            $("#" + selfExclusion.exclusionProduct.toLowerCase() + "ToDate_year option[value='']").html('---');
        }
        $("#" + selfExclusion.exclusionProduct.toLowerCase() + "FromDate_day").prop('disabled', true);
        $("#" + selfExclusion.exclusionProduct.toLowerCase() + "FromDate_month").prop('disabled', true);
        $("#" + selfExclusion.exclusionProduct.toLowerCase() + "FromDate_year").prop('disabled', true);
        $("#" + selfExclusion.exclusionProduct.toLowerCase() + "ToDate_day").prop('disabled', true);
        $("#" + selfExclusion.exclusionProduct.toLowerCase() + "ToDate_month").prop('disabled', true);
        $("#" + selfExclusion.exclusionProduct.toLowerCase() + "ToDate_year").prop('disabled', true);
    }

    function populateAndLockSystemSelfExclusionFields(selfExclusion) {
        if(null != selfExclusion.startDate){
            var startDate = new Date(selfExclusion.startDate);
            $("#fromDate_day").val(startDate.getDate());
            $("#fromDate_month").val(startDate.getMonth() + 1);
            $("#fromDate_year").val(startDate.getFullYear());
        } else {
            $("#fromDate_day option[value='']").html('---');
            $("#fromDate_month option[value='']").html('---');
            $("#fromDate_year option[value='']").html('---');
        }
        if(null != selfExclusion.endDate) {
            var endDate = new Date(selfExclusion.endDate);
            $("#toDate_day").val(endDate.getDate());
            $("#toDate_month").val(endDate.getMonth() + 1);
            $("#toDate_year").val(endDate.getFullYear());
        } else {
            $("#toDate_day option[value='']").html('---');
            $("#toDate_month option[value='']").html('---');
            $("#toDate_year option[value='']").html('---');
        }
        if (null != selfExclusion.exclusionReason) {
            $("#exclusionReason").val(selfExclusion.exclusionReason);
        } else {
            $("#exclusionReason").val("---");
        }
        $("#fromDate_day").prop('disabled', true);
        $("#fromDate_month").prop('disabled', true);
        $("#fromDate_year").prop('disabled', true);
        $("#toDate_day").prop('disabled', true);
        $("#toDate_month").prop('disabled', true);
        $("#toDate_year").prop('disabled', true);
        $("#exclusionReason").prop('disabled', true);
    }

    function renderResponsibleGamingLimits(data) {
        if (!data || 0 == data) {
            return null;
        }
        return parseFloat(data / 100).toFixed(2);
    }

    $('body').on('change', '.overall-date .date-dropdown.day.from', function(e) {
        var container = $(this).closest(".overall-date");
        container.find(".date-dropdown.month").valid();
        container.find(".date-dropdown.year").valid();
        container.find(".date-dropdown.day").valid();
    })

    $('body').on('change', '.overall-date .date-dropdown.month.from', function(e) {
        var container = $(this).closest(".overall-date");
        container.find(".date-dropdown.day").valid();
        container.find(".date-dropdown.year").valid();
        container.find(".date-dropdown.month").valid();
    })

    $('body').on('change', '.overall-date .date-dropdown.year.from', function(e) {
        var container = $(this).closest(".overall-date");
        container.find(".date-dropdown.day").valid();
        container.find(".date-dropdown.month").valid();
        container.find(".date-dropdown.year").valid();
    })

     $('body').on('change', '.overall-date .date-dropdown.day.to', function(e) {
         var container = $(this).closest("form");
         container.find(".date-dropdown.month").each(function (index, element) {
           $(element).valid();
         })
         container.find(".date-dropdown.year").each(function (index, element) {
           $(element).valid();
         })
         container.find(".date-dropdown.day").each(function (index, element) {
           $(element).valid();
         })
     })

     $('body').on('change', '.overall-date .date-dropdown.month.to', function(e) {
         var container = $(this).closest("form");
         container.find(".date-dropdown.month").each(function (index, element) {
           $(element).valid();
         })
         container.find(".date-dropdown.year").each(function (index, element) {
           $(element).valid();
         })
         container.find(".date-dropdown.day").each(function (index, element) {
           $(element).valid();
         })
     })

     $('body').on('change', '.overall-date .date-dropdown.year.to', function(e) {
         var container = $(this).closest("form");
         container.find(".date-dropdown.month").each(function (index, element) {
           $(element).valid();
         })
         container.find(".date-dropdown.year").each(function (index, element) {
           $(element).valid();
         })
         container.find(".date-dropdown.day").each(function (index, element) {
           $(element).valid();
         })
     })

});