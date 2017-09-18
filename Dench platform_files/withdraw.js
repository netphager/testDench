var isMobileDevice = isMobile();

$(document).ready(function() {
    var method;
    var amount;
    var limitsAndFees = {};
    var withdrawTransactionsPreview;

    initDOMEvents();

    if (isMobileDevice) {
        handleCurrentUser(function (current){
            if (current != null) {
                $(".withdraw").addClass("modal-show");
                if (window.currentUser.hasDeposited != true) {
                    $("#transactionsPreview").remove();
                    $("#paymentType_default").remove();
                    $('#withdrawPage').hide();
                }
                subscribeForPushMessages();
                loadWithdrawServerData();
            } else {
                window.location.replace(config.hostUrl + "/login");
            }
        });
		$("#kyc_button").click(function() {
             window.location.replace(config.hostUrl + "/kyc");
        });
    } else {
        $("#web-tab-withdraw").click(function (e) {
            e.preventDefault();
            resetTabContent();
            subscribeForPushMessages();
            loadWithdrawServerData();
            $("#kyc_button").click(function() {
                var myProfileTab = $(".profile-details-modal").find(".tabs-menu.main-tabs-bar");
                $(myProfileTab[0]).find(".kyc-details").click();
            });
         });
    }

    function initDOMEvents() {
        if (isMobileDevice) {
            $('#accordion').collapsible({
                accordion: true,
                onClick : function(element) {
                    if (!$('#amountForm').valid()) {
                        return false;
                    }
                    return true;
                },
                onAccordionOpened : function(element) {
                    method = element.attr("withdrawmethod");
                    amount = ($('#amountToWithdraw').val() * 100);
                    handleChosenMethod();
                }
            });
        } else {
            $('#chooseWithdraw').change(function() {
                var chosenMethod = $(this).val();
                if (!$('#amountForm').valid() || isBlank(chosenMethod)) {
                    $("#chooseWithdraw").prop("selectedIndex", 0);
                    $("#transactionsPreview").hide();
                    $("#bankAccountAccordionContainer").hide();
                    return;
                }
                method = chosenMethod;
                amount = ($('#amountToWithdraw').val() * 100);
                handleChosenMethod();
            });
        }

        initializeWithdrawValidators();

        $('#amountToWithdraw').on('keyup', function() {
            var validator = $('#amountForm').validate();
            if ($('#amountForm').valid()) {
                var isDefaultMethodChosen = (method == 'DEFAULT');
                if ($.fn.DataTable.isDataTable('#withdrawTransactionsTable') && isDefaultMethodChosen) {
                    withdrawTransactionsPreview.ajax.reload();
                }
            }
        });

        $('.withdrawNow').click(function() {
            if (!$('#amountForm').valid()) {
                return;
            }
            var data = {};
            if ('DEFAULT' == method || 'EASY_PAY' == method) {
                data.amount = $('#amountToWithdraw').val() * 100;
                data.withdrawMethod = method;
                submitWithdrawRequest(data);
            } else if ('BANK_ACCOUNT' == method && $('#bankAccountForm').valid()) {
                var iban = $('#iban').val();
                if (!IBAN.isValid(iban)) {
                    showConfirmationModal(translations.withdraw_bank_account_iban_confirm + ":<div class='iban-confirm'>" + iban + "</div>",
                        processBankTransferWithdraw)
                }
            }
        });
    }

    function processBankTransferWithdraw() {
        var data = {};
        data.amount = $('#amountToWithdraw').val() * 100;
        data.withdrawMethod = method;
        data.bankAccountIBAN = $('#iban').val();
        data.bankAccountBIC = $('#bic_swift').val();
        data.bankAccountHolderName = $('#accountHolder').val();
        data.bankName = $('#bankName').val();
        data.bankAddress = $('#bankAddress').val();
        data.bankCountry = $('#bankCountry').val();
        submitWithdrawRequest(data);
    }

    function loadCustomerBalances() {
        $.ajax({
            url: config.denchApiUrl + "/api/v1/customerfacing/customers/balances",
            type : "GET",
            headers : {
                "labelEntryPointCode" : config.labelCode
            },
            success : function(response) {
                $("#customerBalance").html((response.totalBalance/100).toFixed(2) + "<span> " + response.currency + "</span>");
            }
        });
    }

    function initializeWithdrawValidators() {
        jQuery.validator.addMethod("decimals", function (value, element) {
            return this.optional(element) || /^\d{0,20}(\.\d{0,2})?$/i.test(value);
        }, translations.withdraw_validation_amount_decimals);

        jQuery.validator.addMethod('limits', function (value, element) {
            return validateWithdrawAmountByLimits(value);
        }, translations.withdraw_validation_amount_limit);

        jQuery.validator.addMethod('validIBAN', function (value, element) {
            if (new RegExp('^[0-9A-Z]+$').test(value)) {
               return true;
            }
            return false;
        }, translations.withdraw_banaccount_validation_iban);

        jQuery.validator.addMethod('validBIC', function (value, element) {
            if (new RegExp('^[0-9A-Z]+$').test(value)) {
               return true;
            }
            return false;
        }, translations.withdraw_banaccount_validation_bic);

        jQuery.validator.addMethod('balance', function (value, element) {
            if (window.currentUser.realMoneyAccount.cashBalance >= value * 100) {
               return true;
            }
            return false;
        }, translations.not_enough_money);

        $('#amountForm').validate({
            rules : {
                amountToWithdraw : {
                    required : true,
                    number : true,
                    limits : true,
                    decimals : true,
                    balance : true
                }
            },
            messages : {
                amountToWithdraw : {
                    required : translations.withdraw_validation_amount_required,
                    number : translations.withdraw_validation_amount_number
                }
            }
        });

        $('#bankAccountForm').validate({
            rules : {
                iban : {
                    required : true,
                    validIBAN : true,
                    minlength: 15,
                    maxlength: 34,
                },
                bic_swift : {
                    required : true,
                    validBIC: true
                },
                accountHolder : {
                    required : true
                },
                bankName : {
                    required : true
                },
                bankAddress : {
                     required : true
                },
                bankCountry : {
                     required : true
                }
            },
            messages : {
                iban : {
                    required : translations.withdraw_validation_field_required,
                    minlength: translations.withdraw_banaccount_validation_iban_min,
                    maxlength: translations.withdraw_banaccount_validation_iban_max
                },
                bic_swift : {
                    required : translations.withdraw_validation_field_required
                },
                accountHolder : {
                    required : translations.withdraw_validation_field_required
                },
                bankName : {
                    required : translations.withdraw_validation_field_required
                },
                bankAddress : {
                    required : translations.withdraw_validation_field_required
                },
                bankCountry : {
                    required : translations.withdraw_validation_field_required
                }
            }
        });
    }

    function handleChosenMethod() {
        if (!isMobileDevice) {
            $(".withdrawFormContainer").hide();
        }
        if (method == 'DEFAULT') {
            if (!$.fn.DataTable.isDataTable('#withdrawTransactionsTable')) {
                withdrawTransactionsPreview = $('#withdrawTransactionsTable').DataTable({
                    'processing' : true,
                    'serverSide' : false,
                    'sort' : false,
                    "dom" : '<"top"><"bottom"><"clear">',
                    'responsive' : true,
                    'lengthChange': false,
                    'ajax' : {
                        url : config.denchApiUrl + "/api/v1/customerfacing/payment/withdrawRequests/transactionspreview",
                        type : 'POST',
                        headers : {
                            "labelEntryPointCode" : config.labelCode
                        },
                        dataSrc : "",
                        contentType : 'application/json; charset=utf-8',
                        data: function(d) {
                            d.amount = $('#amountToWithdraw').val() * 100;
                            d.withdrawMethod = method;
                            return JSON.stringify(d)
                        }
                    },
                    'columns' : [{
                        'data' : 'paymentMethod',
                        'render' : renderPaymentMethodNamesWithdraw
                    }, {
                        'data' : 'amount',
                        'render' : renderMoney
                    }, {
                        'data' : 'platformTransactionFee',
                        'render' : renderMoney
                    }, {
                        'data' : 'currency'
                    }, {
                        'data' : 'customerPaymentProviderAccount'
                    }, {
                        'data' : 'cardHolderName'
                    }, {
                        'data' : 'cardNumber'
                    }, {
                        'data' : 'cardExpirationDate'
                    }],
                    "language": {
                            "emptyTable" : translations.withdraw_default_no_transaction
                    }
                });
            } else {
                withdrawTransactionsPreview.ajax.reload();
            }
            if (!isMobileDevice) {
                $("#transactionsPreview").show();
            } else {
                $('#transactionsPreview').css('display', 'inline');
                $('#withdrawButton').css('display', 'inline');
            }
        } else if (method == 'BANK_ACCOUNT') {
            if (!isMobileDevice) {
                $("#bankAccountAccordionContainer").show();
            } else {
                $('#bankAccountForm').css('display', 'inline');
                $('#withdrawButton').css('display', 'inline');
            }
        } else if (method == "EASY_PAY") {
            if (!isMobileDevice) {
                $("#epayWithdrawContainer").show();
            } else {
                $('#epayWithdrawContainer').css('display', 'inline');
            }
        }
    }

    function submitWithdrawRequest(data) {
        $.ajax({
            url : config.denchApiUrl + "/api/v1/customerfacing/payment/withdrawRequests",
            type : 'POST',
            dataType : 'json',
            headers : {
                "labelEntryPointCode" : config.labelCode
            },
            contentType : 'application/json; charset=utf-8',
            data : JSON.stringify(data),
            success : function(response) {
                var successMessage = translations.withdraw_success_message;
                if (method == 'BANK_ACCOUNT') {
                    $('#bankAccountForm')[0].reset();
                    $('#amountForm')[0].reset();
                    $('#bankAccountAccordionContainer')
                        .removeClass('accordion-active').css('display','none');
                    $('#paymentType_bankAccount').find('i').removeClass('icon-arrow_up').addClass('icon-arrow_down');
                } else if (method == 'DEFAULT') {
                    $('#amountForm')[0].reset();
                    $('#transactionsPreview')
                        .removeClass('accordion-active').css('display','none');
                    $('#paymentType_default').find('i').removeClass('icon-arrow_up').addClass('icon-arrow_down');

                } else if (method == 'EASY_PAY') {
                     $('#amountForm')[0].reset();
                     $('#epayWithdrawContainer')
                                             .removeClass('accordion-active').css('display','none');
                     $('#paymentType_easyPay').find('i').removeClass('icon-arrow_up').addClass('icon-arrow_down');
                     successMessage = translations.withdraw_easy_pay_success_message;
                }
                method = null;
                amount = null;
                $("#chooseWithdraw").val("");

                showSuccessMessage(successMessage);
            }
        });
        initializeWithdrawValidators();
    }

    function validateWithdrawAmountByLimits(value) {
        if ((parseFloat(limitsAndFees.maxWithdrawAmount) >= parseFloat(value)) &&
            (parseFloat(value) >= parseFloat(limitsAndFees.minWithdrawAmount))) {
            return true;
        } else if (limitsAndFees.maxWithdrawAmount == 0 || limitsAndFees.maxWithdrawAmount == null) {
            if (limitsAndFees.minWithdrawAmount == 0 || limitsAndFees.minWithdrawAmount == null) {
                return true;
            } else if (parseFloat(value) >= parseFloat(limitsAndFees.minWithdrawAmount)) {
                return true;
            }
        } else if (limitsAndFees.minWithdrawAmount == 0 || limitsAndFees.minWithdrawAmount == null) {
            if (limitsAndFees.maxWithdrawAmount == 0 || limitsAndFees.maxWithdrawAmount == null) {
                return true;
            } else if (parseFloat(value) <= parseFloat(limitsAndFees.maxWithdrawAmount)) {
                return true;
            }
        }
        return false;
    }

    function loadLimitsAndFees() {
        $.ajax({
            type : "GET",
            url : config.denchApiUrl + "/api/v1/customerfacing/payment/withdraw/limitsAndFees",
            headers : {
                "labelEntryPointCode" : config.labelCode
            },
            success : function(response) {
                limitsAndFees.minWithdrawAmount = response.minWithdrawAmount / 100;
                $('#min').text(limitsAndFees.minWithdrawAmount.toFixed(2));
                limitsAndFees.maxWithdrawAmount = response.maxWithdrawAmount / 100;
                $('#max').text(limitsAndFees.maxWithdrawAmount.toFixed(2));
                limitsAndFees.bankAccountWithdrawFee = response.bankAccountWithdrawFee / 100;
                $('#fee').text(limitsAndFees.bankAccountWithdrawFee.toFixed(2));
            }
        });
    }

    function loadWithdrawServerData() {
        // initially hide everything
        $("#withdrawPageFraudDetectedError").hide();
        $("#withdrawPageNotKYCVerified").hide();
        $("#withdrawPage").hide();
        if (window.currentUser.kycVerified != 'VERIFIED') {
            $('#withdrawPageNotKYCVerified').show();
        } else{
            $.ajax({
               method: "POST",
               headers : {
                   "labelEntryPointCode" : config.labelCode
               },
               contentType : "application/json",
               url : config.denchApiUrl + "/api/v1/customerfacing/fraudActivities/search",
               data : JSON.stringify({
                  sortBy : "",
                  sortAsc : 1,
                  pageStart : 0,
                  pageSize : 20,
                  globalSearch : "",
                  columnSearches : [ {
                          key : "cleared",
                          operation : "eq",
                          value : false
                      }
                  ]
               }),
               success : function(response) {
                    if (response.content.length > 0){
                        $("#withdrawPageFraudDetectedError").show();
                    } else {
                       if (isMobileDevice) {
                           loadCustomerBalances();
                       }
                       loadLimitsAndFees();
                       $('#withdrawPage').show();
                    }
               }
            });
         }
    }

    function resetTabContent() {
        $("#chooseWithdraw").prop("selectedIndex", 0);
        var validator = $("#amountForm").validate();
        validator.resetForm();
        $('#amountForm')[0].reset();
        $("#transactionsPreview").hide();
        $("#bankAccountAccordionContainer").hide();
        $("#epayWithdrawContainer").hide();
    }

    function renderPaymentProviderNames(paymentProvider) {
        var result;
        switch (paymentProvider) {
            case "SKRILL_WALLET": result = "SKRILL WALLET"; break;
            case "SKRILL_QUICK": result = "SKRILL QUICK"; break;
            case "EPAY": result = "ePay"; break;
            default: result = paymentProvider; break;
        }
        return result;
    }

    function renderPaymentMethodNamesWithdraw(providerName) {
       var result;
       switch (providerName) {
           case "OBT": result = "SKRILL DIRECT"; break;
           case "GIR": result = "GIRO PAY"; break;
           case "DID": result = "DIRECT DEBIT"; break;
           case "SFT": result = "SOFORT"; break;
           case "EBT": result = "NORDEA SOLO"; break;
           case "IDL": result = "iDEAL"; break;
           case "NPY": result = "EPS(Netpay)"; break;
           case "PLI": result = "POLi"; break;
           case "PWY": result = "PRZELEWY24"; break;
           case "EPY": result = "EPAY.BG"; break;
           case "GLU": result = "TRUSTLY"; break;
           case "NTL": result = "NETELLER"; break;
           case "WLT": result = "SKRILL WALLET"; break;
           case "CREDIT_CARD": result = translations.transaction_method_credit_card; break;
           default: result = providerName; break;
       }
       return result;
    }
});
