$(function () {
    initializeAccountTransferOnClicks();
    var isAccountTransferFormValid = false;
	var isMobileDevice = isMobile();
	if (isMobileDevice) {
		handleCurrentUser(function (currentUser) {
            if (currentUser == null) {
                 window.location.replace(config.hostUrl + "/login");
            }

            $.ajax({
                url: config.denchApiUrl + "/api/v1/customerfacing/config/general",
                type : "GET",
                 headers : {
                    "labelEntryPointCode" : config.labelCode
                 },
                 success : function(response) {
                     if (response.accountTransferEnabled == "true") {
                        $('#accountTransferPage').show();
                        $('#accountTransferSend').css('display', 'block');
                     } else {
                        $("#accountTransferDisabled").show();
                     }
                 }
            });
        });

	 	$("#kyc_button_account").click(function() {
           window.location.replace(config.hostUrl + "/kyc");
        });

	    $(".account-transfer").addClass("modal-show");

        $.ajax({
            url: config.denchApiUrl + "/api/v1/customerfacing/customers/balances",
            type : "GET",
            headers : {
                "labelEntryPointCode" : config.labelCode
            },
            success : function(response) {
                $("#customerBalance").html((response.totalBalance / 100).toFixed(2) + "<span> " + response.currency + "</span>");
            }
        });
        initializeAccountTransferValidators();
 	} else {
        $("#web-tab-account-transfer").click(function (e) {
            e.preventDefault();
            hideAllAccountTransferContainers();

            $('#accountTransferPage').show();
            $('#accountTransferSend').css('display', 'block');

            $("#kyc_button_account").click(function() {
                var myProfileTab = $(".profile-details-modal").find(".tabs-menu.main-tabs-bar");
                $(myProfileTab[0]).find(".kyc-details").click();
            });
            initializeAccountTransferCurrencyField();
            initializeAccountTransferValidators();
        });
    }

    function initializeAccountTransferOnClicks() {
        $("#accountTransferSendFunds").click(function() {
            if($('#accountTransferForm').valid() && isAccountTransferFormValid) {
                $.ajax({
                    type : 'POST',
                    url : config.denchApiUrl + '/api/v1/customerfacing/payment/accountTransfers?receiver=' + $('#accountTransferReceiverEmail').val()
                            + '&amount=' + $('#accountTransferAmountToBeSent').val() * 100 + '&currency=' + $('#accountTransferSupportedCurrencies').val(),
                    headers : {
                       "labelEntryPointCode" : config.labelCode
                    },
                    success : function(response) {
                        showSuccessMessage(translations.accounttransfer_success);
                        $('#accountTransferReceiverEmail').val('');
                        $('#accountTransferAmountToBeSent').val('');
                    }
                })
            }
            });
    }

    function initializeAccountTransferValidators() {
        $.validator.addMethod('validateEmail', function (value, element) {
            if (RegExp('\\s*\\S+@\\s*\\S+\\.\\s*\\S+').test(value)) {
                $.ajax({
                    method: "GET",
                    headers : {
                       "labelEntryPointCode" : config.labelCode
                    },
                    contentType : "application/json",
                    url : config.denchApiUrl + "/api/v1/customerfacing/customers/findByEmail?receiverEmail=" + getReceiverEmail(),
                    success : function(response) {
                        isAccountTransferFormValid = true;
                        initializeAccountTransferCurrencyField(response.currency);
                    },
                    error : function() {
                        var validator = $("#accountTransferForm").validate();
                        validator.showErrors({
                            "accountTransferReceiverEmail": translations.buddytransfer_user_not_found
                        });
                        $("#accountTransferReceiverEmail").attr("aria-invalid", true);
                        $("#accountTransferReceiverEmail").addClass("error");
                        isAccountTransferFormValid = false;
                    }
                });
                return true;
            }
            return false;
        }, translations.email_format_error);

        $.validator.addMethod("decimals", function (value, element) {
            return this.optional(element) || /^\d{0,20}(\.\d{0,2})?$/i.test(value);
        }, translations.accounttransfer_validation_invalid_decimals);

        $.validator.addMethod("limits", function (value, element) {
            return value > 0;
        }, translations.accounttransfer_validation_invalid_amount);



        $('#accountTransferForm').validate({
            errorElement:'div',
            rules : {
                accountTransferReceiverEmail : {
                    required : true,
                    validateEmail : true
                },
                accountTransferAmountToBeSent : {
                    required : true,
                    number : true,
                    limits : true,
                    decimals : true
                }
            },
            messages : {
                accountTransferReceiverEmail : {
                    required : translations.accounttransfer_validation_field_required
                },
                accountTransferAmountToBeSent : {
                    required : translations.accounttransfer_validation_field_required,
                    number : translations.accounttransfer_validation_invalid_number
                }
            }
        });
    }

    function initializeAccountTransferCurrencyField(newCurrency) {
        $('#accountTransferSupportedCurrencies').empty();
        $('#accountTransferSupportedCurrencies').append("<option value='" +  currentUser.currency + "'>" + currentUser.currency + "</option>");
        if(null != newCurrency && "" != newCurrency && currentUser.currency != newCurrency) {
            $('#accountTransferSupportedCurrencies').append("<option value='" +  newCurrency + "'>" + newCurrency + "</option>");
        }
    }

    function getReceiverEmail() {
        return $("#accountTransferReceiverEmail").val();
    }

    function getSupportedCurrencies() {
        $.ajax({
            type : 'GET',
            url : config.denchApiUrl + "/api/v1/customerfacing/supportedcurrencies",
            headers : {
              "labelEntryPointCode" : config.labelCode
            },
            success : function(response) {
                var currencySelectOptions;
                jQuery.each(response, function (i, val) {
                    currencySelectOptions += "<option>" + val + "</option>"
                });
                $('#accountTransferSupportedCurrencies').html(currencySelectOptions);
            }
        })
    }

    function hideAllAccountTransferContainers() {
        $("#accountTransferPage").hide();
        $("#accountTransferSend").hide();
        $("#accountTransferPageNotKYCVerified").hide();
    }

});