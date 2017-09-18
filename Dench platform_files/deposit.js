var wirecardStorageId;
var orderIdent;
var amount;
var limitsAndFees = {};
$(function() {
    var isMobileDevice = isMobile();
	
	initializeDepositValidators();
	initializeDepositOnClicks();
	initializeDateFields();
	
	if (isMobileDevice) {
        handleCurrentUser(function (currentUser) {
            if (currentUser == null) {
                 window.location.replace(config.hostUrl + "/login");
            }
        });

        $(".deposit").addClass("modal-show");

		$('#accordion').collapsible({
			contentOpen: 0,
			accordion: true,
		});
	
		$('#collapse').collapsible({
			contentOpen: 0
		});

		loadDepositPage();
    } else {
		 $("#web-tab-deposit").click(function (e) {
            e.preventDefault();
			loadDepositPage()
		});
	}

	function loadDepositPage() {
	    $('form').each(function() {
	        this.reset();
	        var validator = $(this).validate();
            validator.resetForm();
            $(this).find('.error,.valid').css('border-color', '').removeClass('error').removeClass('valid');
            $(this).find('.form-error').remove();
	    });
	    $("#choosePayment").val('wirecardForm').trigger('change');
		$('#cc_deposit_code').val('');
	    $('#providers').show();
        $('#3d-pt-content').hide();
		$.ajax({
			method: "GET",
			headers : {
				"labelEntryPointCode" : config.labelCode
			},
			contentType : "application/json",
			url : config.denchApiUrl + "/api/v1/customerfacing/payment/deposit/provider/settings",
			dataType : 'json',
			success : function(response) {
				if (response.wirecardEnabled != "true") {
					if(isMobileDevice) {					
						$("#wirecard").remove();						
					} else { 
						$("#wirecard").hide();
					}
					$("#wirecardForm").remove();
				} else {
					$("#creditCardMin").html(parseFloat(response.wirecardMinAmount/100).toFixed(2) + " " + response.customerCurrency);
					$("#creditCardMax").html(parseFloat(response.wirecardMaxAmount/100).toFixed(2) + " " + response.customerCurrency);
					$("#creditCardFee").html(parseFloat(response.wirecardDepositFeeAmount/100).toFixed(2) + " " + response.customerCurrency);
				}
				if (response.bank_accountEnabled != "true") {
					if(isMobileDevice) {					
						$("#bank-transfer").remove();						
					} else { 
						$("#bank-transfer").hide();
					}					
					$("#bank-transfer-form").remove();
				} else {
					$("#bankAccountIban").html(response.bank_accountIban);
					$("#bankAccountBic").html(response.bank_accountBic);
					$("#bankAccountAccountHolder").html(response.bank_accountAccountHolder);
					$("#bankAccountBankName").html(response.bank_accountBankName);
					$("#bankAccountBankAddress").html(response.bank_accountBankAddress);
					$("#bankAccountInstructions").html(response.bank_accountInstructions);
					$("#bankAccountFee").html((response.bank_accountDepositFeeAmount/100).toFixed(2));
					$("#bankAccountMax").html((response.bank_accountMaxAmount/100).toFixed(2));
					$("#bankAccountMin").html((response.bank_accountMinAmount/100).toFixed(2));
				}
				if (response.skrill_walletEnabled != "true") {
					if(isMobileDevice) {					
						$("#skrill_wallet").remove();						
					} else { 
						$("#skrill_wallet").hide();
					}	
					$("#skrill_walletForm").remove();
				} else {
					$("#skrill_walletMin").html(parseFloat(response.skrill_walletMinAmount/100).toFixed(2) + " " + response.customerCurrency);
					$("#skrill_walletMax").html(parseFloat(response.skrill_walletMaxAmount/100).toFixed(2) + " " + response.customerCurrency);
					$("#skrill_walletFee").html(parseFloat(response.skrill_walletDepositFeeAmount/100).toFixed(2) + " " + response.customerCurrency);
				}
				if (response.skrill_quickEnabled != "true") {
					removeSkrillQuickOptions()
				} else {
				    if (response.skrill_quickNTL == null) {
				        if(isMobileDevice) {
                            $("#skrill_quick_NTL").remove();
                        } else {
                            $("#skrill_quick_NTL").hide();
                        }
                        $("#skrill_quick_NTL_Form").remove();
				    } else {
                        $("#skrill_quick_NTL_Min").html(parseFloat(response.skrill_quickMinAmount/100).toFixed(2) + " " + response.customerCurrency);
                        $("#skrill_quick_NTL_Max").html(parseFloat(response.skrill_quickMaxAmount/100).toFixed(2) + " " + response.customerCurrency);
                        $("#skrill_quick_NTL_Fee").html(parseFloat(response.skrill_quickDepositFeeAmount/100).toFixed(2) + " " + response.customerCurrency);
                    }
					if(response.skrill_quickOBT == null){
						if(isMobileDevice) {					
							$("#skrill_quick_OBT").remove();						
						} else { 
							$("#skrill_quick_OBT").hide();
						}
						$("#skrill_quick_OBT_Form").remove();
					}else {
						$("#skrill_quick_OBT_Min").html(parseFloat(response.skrill_quickMinAmount/100).toFixed(2) + " " + response.customerCurrency);
						$("#skrill_quick_OBT_Max").html(parseFloat(response.skrill_quickMaxAmount/100).toFixed(2) + " " + response.customerCurrency);
						$("#skrill_quick_OBT_Fee").html(parseFloat(response.skrill_quickDepositFeeAmount/100).toFixed(2) + " " + response.customerCurrency);
					}
					if(response.skrill_quickGIR == null){
						if(isMobileDevice) {					
							$("#skrill_quick_GIR").remove();						
						} else { 
							$("#skrill_quick_GIR").hide();
						}
						$("#skrill_quick_GIR_Form").remove();
					}else {
						$("#skrill_quick_GIR_Min").html(parseFloat(response.skrill_quickMinAmount/100).toFixed(2) + " " + response.customerCurrency);
						$("#skrill_quick_GIR_Max").html(parseFloat(response.skrill_quickMaxAmount/100).toFixed(2) + " " + response.customerCurrency);
						$("#skrill_quick_GIR_Fee").html(parseFloat(response.skrill_quickDepositFeeAmount/100).toFixed(2) + " " + response.customerCurrency);
					}
					if(response.skrill_quickDID == null){
						if(isMobileDevice) {					
							$("#skrill_quick_DID").remove();						
						} else { 
							$("#skrill_quick_DID").hide();
						}						
						$("#skrill_quick_DID_Form").remove();
					}else {
						$("#skrill_quick_DID_Min").html(parseFloat(response.skrill_quickMinAmount/100).toFixed(2) + " " + response.customerCurrency);
						$("#skrill_quick_DID_Max").html(parseFloat(response.skrill_quickMaxAmount/100).toFixed(2) + " " + response.customerCurrency);
						$("#skrill_quick_DID_Fee").html(parseFloat(response.skrill_quickDepositFeeAmount/100).toFixed(2) + " " + response.customerCurrency);
					}
					if(response.skrill_quickSFT == null){
						if(isMobileDevice) {					
							$("#skrill_quick_SFT").remove();						
						} else { 
							$("#skrill_quick_SFT").hide();
						}	
						$("#skrill_quick_SFT_Form").remove();
					}else {
						$("#skrill_quick_SFT_Min").html(parseFloat(response.skrill_quickMinAmount/100).toFixed(2) + " " + response.customerCurrency);
						$("#skrill_quick_SFT_Max").html(parseFloat(response.skrill_quickMaxAmount/100).toFixed(2) + " " + response.customerCurrency);
						$("#skrill_quick_SFT_Fee").html(parseFloat(response.skrill_quickDepositFeeAmount/100).toFixed(2) + " " + response.customerCurrency);
					}
					if(response.skrill_quickEBT == null){
						if(isMobileDevice) {					
							$("#skrill_quick_EBT").remove();						
						} else { 
							$("#skrill_quick_EBT").hide();
						}	
						$("#skrill_quick_EBT_Form").remove();
					}else {
						$("#skrill_quick_EBT_Min").html(parseFloat(response.skrill_quickMinAmount/100).toFixed(2) + " " + response.customerCurrency);
						$("#skrill_quick_EBT_Max").html(parseFloat(response.skrill_quickMaxAmount/100).toFixed(2) + " " + response.customerCurrency);
						$("#skrill_quick_EBT_Fee").html(parseFloat(response.skrill_quickDepositFeeAmount/100).toFixed(2) + " " + response.customerCurrency);
					}
					if(response.skrill_quickIDL == null){
						if(isMobileDevice) {					
							$("#skrill_quick_IDL").remove();						
						} else { 
							$("#skrill_quick_IDL").hide();
						}	
						$("#skrill_quick_IDL_Form").remove();
					}else {
						$("#skrill_quick_IDL_Min").html(parseFloat(response.skrill_quickMinAmount/100).toFixed(2) + " " + response.customerCurrency);
						$("#skrill_quick_IDL_Max").html(parseFloat(response.skrill_quickMaxAmount/100).toFixed(2) + " " + response.customerCurrency);
						$("#skrill_quick_IDL_Fee").html(parseFloat(response.skrill_quickDepositFeeAmount/100).toFixed(2) + " " + response.customerCurrency);
					}
					if(response.skrill_quickPLI == null){
						if(isMobileDevice) {					
							$("#skrill_quick_PLI").remove();						
						} else { 
							$("#skrill_quick_PLI").hide();
						}	
						$("#skrill_quick_PLI_Form").remove();
					}else {
						$("#skrill_quick_PLI_Min").html(parseFloat(response.skrill_quickMinAmount/100).toFixed(2) + " " + response.customerCurrency);
						$("#skrill_quick_PLI_Max").html(parseFloat(response.skrill_quickMaxAmount/100).toFixed(2) + " " + response.customerCurrency);
						$("#skrill_quick_PLI_Fee").html(parseFloat(response.skrill_quickDepositFeeAmount/100).toFixed(2) + " " + response.customerCurrency);
					}
					if(response.skrill_quickPWY == null){
						if(isMobileDevice) {					
							$("#skrill_quick_PWY").remove();						
						} else { 
							$("#skrill_quick_PWY").hide();
						}	
						$("#skrill_quick_PWY_Form").remove();
					}else {
						$("#skrill_quick_PWY_Min").html(parseFloat(response.skrill_quickMinAmount/100).toFixed(2) + " " + response.customerCurrency);
						$("#skrill_quick_PWY_Max").html(parseFloat(response.skrill_quickMaxAmount/100).toFixed(2) + " " + response.customerCurrency);
						$("#skrill_quick_PWY_Fee").html(parseFloat(response.skrill_quickDepositFeeAmount/100).toFixed(2) + " " + response.customerCurrency);
					}
					if(response.skrill_quickEPY == null){
						if(isMobileDevice) {					
							$("#skrill_quick_EPY").remove();						
						} else { 
							$("#skrill_quick_EPY").hide();
						}	
						$("#skrill_quick_EPY_Form").remove();
					}else {
						$("#skrill_quick_EPY_Min").html(parseFloat(response.skrill_quickMinAmount/100).toFixed(2) + " " + response.customerCurrency);
						$("#skrill_quick_EPY_Max").html(parseFloat(response.skrill_quickMaxAmount/100).toFixed(2) + " " + response.customerCurrency);
						$("#skrill_quick_EPY_Fee").html(parseFloat(response.skrill_quickDepositFeeAmount/100).toFixed(2) + " " + response.customerCurrency);
					}
					if(response.skrill_quickNPY == null){
						if(isMobileDevice) {					
							$("#skrill_quick_NPY").remove();						
						} else { 
							$("#skrill_quick_NPY").hide();
						}	
						$("#skrill_quick_NPY_Form").remove();
					}else {
						$("#skrill_quick_NPY_Min").html(parseFloat(response.skrill_quickMinAmount/100).toFixed(2) + " " + response.customerCurrency);
						$("#skrill_quick_NPY_Max").html(parseFloat(response.skrill_quickMaxAmount/100).toFixed(2) + " " + response.customerCurrency);
						$("#skrill_quick_NPY_Fee").html(parseFloat(response.skrill_quickDepositFeeAmount/100).toFixed(2) + " " + response.customerCurrency);
					}
					if(response.skrill_quickNPY == null){
						if(isMobileDevice) {					
							$("#skrill_quick_GLU").remove();						
						} else { 
							$("#skrill_quick_GLU").hide();
						}	
						$("#skrill_quick_GLU_Form").remove();
					}else {
						$("#skrill_quick_GLU_Min").html(parseFloat(response.skrill_quickMinAmount/100).toFixed(2) + " " + response.customerCurrency);
						$("#skrill_quick_GLU_Max").html(parseFloat(response.skrill_quickMaxAmount/100).toFixed(2) + " " + response.customerCurrency);
						$("#skrill_quick_GLU_Fee").html(parseFloat(response.skrill_quickDepositFeeAmount/100).toFixed(2) + " " + response.customerCurrency);
					}
				}
				if (response.epayEnabled != "true") {
				    if (isMobileDevice) {
				        $("#epay_credit_card").remove();
				        $("#epay_default").remove();
				        $("#epay_easy_pay").remove();
				    } else {
				        $("#epay_credit_card").hide();
                        $("#epay_default").hide;
                        $("#epay_easy_pay").hide;
				    }
				    $("#epay_credit_cardForm").remove();
				    $("#epay_defaultForm").remove();
				    $("#epay_easy_payForm").remove();
				} else {
				    $("#epay_defaultMin").html(parseFloat(response.epayMinAmount/100).toFixed(2) + " " + response.customerCurrency);
                    $("#epay_defaultMax").html(parseFloat(response.epayMaxAmount/100).toFixed(2) + " " + response.customerCurrency);
                    $("#epay_defaultFee").html(parseFloat(response.epayDepositFeeAmount/100).toFixed(2) + " " + response.customerCurrency);
				    $("#epay_credit_cardMin").html(parseFloat(response.epayMinAmount/100).toFixed(2) + " " + response.customerCurrency);
                    $("#epay_credit_cardMax").html(parseFloat(response.epayMaxAmount/100).toFixed(2) + " " + response.customerCurrency);
                    $("#epay_credit_cardFee").html(parseFloat(response.epayDepositFeeAmount/100).toFixed(2) + " " + response.customerCurrency);
                    $("#epay_easy_payMin").html(parseFloat(response.epayMinAmount/100).toFixed(2) + " " + response.customerCurrency);
                    $("#epay_easy_payMax").html(parseFloat(response.epayMaxAmount/100).toFixed(2) + " " + response.customerCurrency);
                    $("#epay_easy_payFee").html(parseFloat(response.epayDepositFeeAmount/100).toFixed(2) + " " + response.customerCurrency);
				}
				limitsAndFees = response;
				initializeDepositValidators();
			}
		});
	}
	
	function loadProviderSettings(provider) {
		var isValidDepositForm = $('#depositForm').valid();
		var isValidCreditCardAmountForm = $('#creditCardAmountForm').valid();
		if(isValidDepositForm && isValidCreditCardAmountForm){
			if (provider == "WIRECARD") {
                $.ajax({
                    method: "GET",
                    headers : {
                        "labelEntryPointCode" : config.labelCode
                    },
                    contentType : "application/json",
                    url : config.denchApiUrl + "/api/v1/customerfacing/payment/deposit/wirecard/datastorage/init",
                    dataType : 'json',
                    success : function(response) {
                        wirecardStorageId = response.storageId;
                        orderIdent = response.orderIdent;
                        var s = document.createElement("script");
                        s.type = "text/javascript";
                        s.src = response.javascriptUrl;
                        $("head").append(s);
                        $.getScript(response.javascriptUrl)
                            .done(function(script) {
                                if($('#creditCardAmountForm').valid()) {
                                    sendDataStorageInfoToWirecard();
                                }
                            })
                            .fail(function (jqxhr, settings, exception) {
                                console.log(exception);
                            });
                    }
                });
            }
		}
	}
	
	function sendDataStorageInfoToWirecard() {
		var dataStorage = new WirecardCEE_DataStorage();
		var paymentInformation = {};
		paymentInformation.pan = $('#cc_pan').val();
		paymentInformation.expirationMonth = $('#cc_expirationMonth').val();
		paymentInformation.expirationYear = $('#cc_expirationYear').val();
		paymentInformation.cardholdername = $('#cc_cardholdername').val();
		paymentInformation.cardverifycode = $('#cc_cardverifycode').val();
		amount = ($('#wirecardAmountToDeposit').val()*100);
		dataStorage.storeCreditCardInformation(paymentInformation, checkSaveIntoDataStorageResult);
	}
	
	function checkSaveIntoDataStorageResult(response) {
		if(0 == response.getStatus()) {
			 $.ajax({
				method: "POST",
				headers : {
					"labelEntryPointCode" : config.labelCode
				},
				contentType : "application/json",
				url : config.denchApiUrl + "/api/v1/customerfacing/payment/deposit/wirecard/seamless?amount=" + amount + "&storageId=" +
						wirecardStorageId + "&orderIdent=" + orderIdent,
				dataType : 'json',
				success : function(response) {
					if(null != response.redirectUrl) {
//					    $('#depositForm')[0].reset();
					    $('#providers').hide();
					    $('#3d-pt-content').show();
                        $("#3d-pt-content").html("<iframe src=" + response.redirectUrl + "><iframe>");
					} else {
						showErrorMessage(translations.deposit_failed)
	//                    var errors = response;
	//                    for (e in errors) {
	//                      s += "Error " + e + ": " + errors[e].message + " (Error Code: " + errors[e].errorCode + ")\n";
	//                    }
					}
				}
			});
		} else  {
			var errors = response;
			for (var i = 0; i < errors.response.error.length; i++ ) {
				var errorCode = (errors.response.error[i].errorCode).toString();
				if (errorCode != "" && errorCode != null) {
					if (errorCode.substring(0, 2) == 11 ||
						errorCode.substring(0, 2) == 12 ||
						errorCode.substring(0, 2) == 13 ||
						errorCode.substring(0, 2) == 14 ||
						errorCode.substring(0, 2) == 15 ||
						errorCode.substring(0, 2) == 16 ||
						errorCode.substring(0, 2) == 17 ||
						errorCode.substring(0, 2) == 18 ||
						errorCode.substring(0, 2) == 19 ||
						errorCode.substring(0, 2) == 31) {
							showErrorMessage( translations[errorCode.substring(2)] + " " +
								translations[errorCode.substring(0, 2)]);
					} else {
						showErrorMessage(translations[errorCode]);
					}
				} else {
					showErrorMessage(translations.deposit_failed);
				}
			}
		}
	}
	
	function doSkrillDeposit(skrillMethod) {
		var amount
		var url = config.denchApiUrl + '/api/v1/customerfacing/payment/deposit/skrill?amount=';
		if(null != skrillMethod) {
			amount = ($('#skrill_quick_' + skrillMethod + '_AmountToDeposit').val()*100);
			url += amount + "&method=" + skrillMethod;
		} else {
			amount = ($('#skrill_walletAmountToDeposit').val()*100);
			url += amount;
		}

		// on mobile - we get previous URL from cookie since deposit is a new page & we want to redirect user to previous page
		// on web - redirect to current page since deposit is in popup
		if (isMobileDevice) {
		    url += "&returnPage=" + $.cookie('returnPage');
		} else {
		    url += "&returnPage=" + window.location.href;
		}

		$.ajax({
			type : 'POST',
			url : url,
			headers : {
				"labelEntryPointCode" : config.labelCode
			},
			success : function(response) {
			    $('#providers').hide();
                $('#3d-pt-content').show();
				$("#3d-pt-content").html("<iframe src=" + response.skrillUrl + '?sid=' + response
				.sessionId + "><iframe>");
			}
		})
	}

	function doEpayDeposit(method) {
		var amount
		var url = config.denchApiUrl + '/api/v1/customerfacing/payment/deposit/epay?amount=';
		if ("EPAY_CREDIT_CARD" == method) {
			amount = ($('#epay_credit_card_AmountToDeposit').val()*100);
			url += amount + "&method=EPAY_CREDIT_CARD";
		} else if ("EPAY_DEFAULT" == method) {
			amount = ($('#epay_default_AmountToDeposit').val()*100);
			url += amount + "&method=EPAY_DEFAULT";
		} else if ("EPAY_EASY_PAY" == method) {
            amount = ($('#epay_easy_pay_AmountToDeposit').val()*100);
            url += amount + "&method=EPAY_EASY_PAY";
        }

        if (isMobileDevice) {
            url += "&returnPage=" + $.cookie('returnPage');
        } else {
            url += "&returnPage=" + window.location.href;
        }


		$.ajax({
			type : 'POST',
			url : url,
			headers : {
				"labelEntryPointCode" : config.labelCode
			},
			success : function(response) {
			    $('#providers').hide();
			    var formHtml;
			    formHtml = generateFormPerEpayMethod(response, method);
                if (method == "EPAY_EASY_PAY") {
                    $("#3d-pt-content").html(formHtml);
                    $("#easyPayCode").html(response.easyPayCode);
                    $("#invoiceNumber").html(response.invoice);
                    $("#expirationDate").html(response.expirationTime);
                } else {
                    $("#3d-pt-content").html(formHtml + "<iframe src='#' name='3rd-pt'><iframe>");
                    $("#epaySessionForm").submit();
                }
				$('#3d-pt-content').show();
			}
		})
	}

	function generateFormPerEpayMethod(data, method) {
        var html;
	    if (method == "EPAY_EASY_PAY") {
             html = '<div class="bank-transfer-content">' +
                '<div class="deposit-gap">' +
                    '<div class="deposit-bank-details">' +
                        '<div><span>'+ translations.deposit_easy_pay_pay_code + '</span><span id="easyPayCode"></span></div>' +
                        '<div><span>'+ translations.deposit_easy_pay_invoice_number + '</span><span id="invoiceNumber"></span></div>' +
                        '<div><span>'+ translations.deposit_easy_pay_expiration_date + '</span><span id="expirationDate"></span></div>' +
                    '</div>' +
                 '</div>' +
             '</div>';
	    } else {
	        html = "<form action='" + data.postUrl + "' style='display:none;' target='3rd-pt' id='epaySessionForm'>" +
              "   <input type='hidden' name='ENCODED' value='" + data.ENCODED + "'>" +
              "   <input type='hidden' name='CHECKSUM' value='" + data.CHECKSUM + "'>" +
              "   <input type='hidden' name='PAGE' value='" + data.PAGE + "'>" +
              "   <input type='hidden' name='URL_OK' value='" + data.URL_OK + "'>" +
              "   <input type='hidden' name='URL_CANCEL' value='" + data.URL_CANCEL + "'>" +
              "</form>";
	    }
        return html;
	}
	
	function initializeDepositValidators() {
		jQuery.validator.addMethod("decimals", function (value, element) {
			return this.optional(element) || /^\d{0,20}(\.\d{0,2})?$/i.test(value);
		}, "No more than two decimal places");
	
		jQuery.validator.addMethod('wirecardLimits', function (value, element) {
			return validateDepositAmountByLimits(value, 'wirecard');
		}, translations.withdraw_validation_amount_limit);
	
		jQuery.validator.addMethod('skrill_walletLimits', function (value, element) {
			return validateDepositAmountByLimits(value, 'skrill_wallet');
		}, translations.withdraw_validation_amount_limit);
	
		jQuery.validator.addMethod('skrill_quickLimits', function (value, element) {
			 return validateDepositAmountByLimits(value, 'skrill_quick');
		}, translations.withdraw_validation_amount_limit);

	    jQuery.validator.addMethod('epayLimits', function (value, element) {
             return validateDepositAmountByLimits(value, 'epay');
        }, translations.withdraw_validation_amount_limit);

		$('#creditCardAmountForm').validate({
			rules : {
				wirecardAmountToDeposit : {
					required : true,
					number : true,
					wirecardLimits : true,
					decimals : true
				}
			},
			messages : {
				wirecardAmountToDeposit : {
					required : translations.deposit_validation_blank_amount,
					number : translations.deposit_validation_amount_invalid_number
				}
			}
		});
	
		$('#depositForm').validate({
				errorElement:'div',
				rules : {
					cc_pan : {
						required : true
					},
					cc_cardholdername : {
						required : true
					},
					cc_expirationMonth : {
						required : true
					},
					cc_expirationYear : {
						 required : true
					},
					cc_cardverifycode : {
						required : true
					}
				},
				messages : {
					cc_pan : {
						required : translations.missing_field
					},
					cc_cardholdername : {
						required : translations.missing_field
					},
					cc_expirationMonth : {
						valueNotEquals : translations.missing_field
					},
					cc_expirationYear : {
						  required : translations.missing_field
					},
					cc_cardverifycode : {
						required : translations.missing_field
					}
				}
			});
	
		$('#skrill_walletAmountForm').validate({
			rules : {
				skrill_walletAmountToDeposit : {
					required : true,
					number : true,
					skrill_walletLimits : true,
					decimals : true
				}
			},
			messages : {
				skrill_walletAmountToDeposit : {
					required : translations.deposit_validation_blank_amount,
                    number : translations.deposit_validation_amount_invalid_number
				}
			}
		});
	
		$('#skrill_quick_NTL_AmountForm').validate({
				rules : {
				skrill_quick_NTL_AmountToDeposit : {
					required : true,
					number : true,
					skrill_quickLimits : true,
					decimals : true
				}
			},
			messages : {
				skrill_quick_NTL_AmountToDeposit : {
					required : translations.deposit_validation_blank_amount,
					number : translations.deposit_validation_amount_invalid_number
				}
			}
		});
	
		$('#skrill_quick_OBT_AmountForm').validate({
				rules : {
				skrill_quick_OBT_AmountToDeposit : {
					required : true,
					number : true,
					skrill_quickLimits : true,
					decimals : true
				}
			},
			messages : {
				skrill_quick_OBT_AmountToDeposit : {
					required : translations.deposit_validation_blank_amount,
					number : translations.deposit_validation_amount_invalid_number
				}
			}
		});
	
		$('#skrill_quick_GIR_AmountForm').validate({
				rules : {
				skrill_quick_GIR_AmountToDeposit : {
					required : true,
					number : true,
					skrill_quickLimits : true,
					decimals : true
				}
			},
			messages : {
				skrill_quick_GIR_AmountToDeposit : {
					required : translations.deposit_validation_blank_amount,
					number : translations.deposit_validation_amount_invalid_number
				}
			}
		});
	
		$('#skrill_quick_DID_AmountForm').validate({
				rules : {
				skrill_quick_DID_AmountToDeposit : {
					required : true,
					number : true,
					skrill_quickLimits : true,
					decimals : true
				}
			},
			messages : {
				skrill_quick_DID_AmountToDeposit : {
					required : translations.deposit_validation_blank_amount,
					number : translations.deposit_validation_amount_invalid_number
				}
			}
		});
	
		$('#skrill_quick_SFT_AmountForm').validate({
				rules : {
				skrill_quick_SFT_AmountToDeposit : {
					required : true,
					number : true,
					skrill_quickLimits : true,
					decimals : true
				}
			},
			messages : {
				skrill_quick_SFT_AmountToDeposit : {
					required : translations.deposit_validation_blank_amount,
					number : translations.deposit_validation_amount_invalid_number
				}
			}
		});
	
		$('#skrill_quick_EBT_AmountForm').validate({
				rules : {
				skrill_quick_EBT_AmountToDeposit : {
					required : true,
					number : true,
					skrill_quickLimits : true,
					decimals : true
				}
			},
			messages : {
				skrill_quick_EBT_AmountToDeposit : {
					required : translations.deposit_validation_blank_amount,
					number : translations.deposit_validation_amount_invalid_number
				}
			}
		});
	
		$('#skrill_quick_IDL_AmountForm').validate({
				rules : {
				skrill_quick_IDL_AmountToDeposit : {
					required : true,
					number : true,
					skrill_quickLimits : true,
					decimals : true
				}
			},
			messages : {
				skrill_quick_IDL_AmountToDeposit : {
					required : translations.deposit_validation_blank_amount,
					number : translations.deposit_validation_amount_invalid_number
				}
			}
		});
	
		$('#skrill_quick_PLI_AmountForm').validate({
				rules : {
				skrill_quick_PLI_AmountToDeposit : {
					required : true,
					number : true,
					skrill_quickLimits : true,
					decimals : true
				}
			},
			messages : {
				skrill_quick_PLI_AmountToDeposit : {
					required : translations.deposit_validation_blank_amount,
					number : translations.deposit_validation_amount_invalid_number
				}
			}
		});
	
		$('#skrill_quick_PWY_AmountForm').validate({
				rules : {
				skrill_quick_PWY_AmountToDeposit : {
					required : true,
					number : true,
					skrill_quickLimits : true,
					decimals : true
				}
			},
			messages : {
				skrill_quick_PWY_AmountToDeposit : {
					required : translations.deposit_validation_blank_amount,
					number : translations.deposit_validation_amount_invalid_number
				}
			}
		});
	
		$('#skrill_quick_EPY_AmountForm').validate({
				rules : {
				skrill_quick_EPY_AmountToDeposit : {
					required : true,
					number : true,
					skrill_quickLimits : true,
					decimals : true
				}
			},
			messages : {
				skrill_quick_EPY_AmountToDeposit : {
					required : translations.deposit_validation_blank_amount,
					number : translations.deposit_validation_amount_invalid_number
				}
			}
		});
	
		$('#skrill_quick_NPY_AmountForm').validate({
				rules : {
				skrill_quick_NPY_AmountToDeposit : {
					required : true,
					number : true,
					skrill_quickLimits : true,
					decimals : true
				}
			},
			messages : {
				skrill_quick_NPY_AmountToDeposit : {
					required : translations.deposit_validation_blank_amount,
					number : translations.deposit_validation_amount_invalid_number
				}
			}
		});
	
		$('#skrill_quick_GLU_AmountForm').validate({
				rules : {
				skrill_quick_GLU_AmountToDeposit : {
					required : true,
					number : true,
					skrill_quickLimits : true,
					decimals : true
				}
			},
			messages : {
				skrill_quick_GLU_AmountToDeposit : {
					required : translations.deposit_validation_blank_amount,
					number : translations.deposit_validation_amount_invalid_number
				}
			}
		});

		$('#epay_default_AmountForm').validate({
				rules : {
				epay_default_AmountToDeposit : {
					required : true,
					number : true,
					epayLimits : true,
					decimals : true
				}
			},
			messages : {
				epay_default_AmountToDeposit : {
					required : translations.deposit_validation_blank_amount,
					number : translations.deposit_validation_amount_invalid_number
				}
			}
		});

		$('#epay_credit_card_AmountForm').validate({
				rules : {
				epay_credit_card_AmountToDeposit : {
					required : true,
					number : true,
					epayLimits : true,
					decimals : true
				}
			},
			messages : {
				epay_credit_card_AmountToDeposit : {
					required : translations.deposit_validation_blank_amount,
					number : translations.deposit_validation_amount_invalid_number
				}
			}
		});

		$('#epay_easy_pay_AmountForm').validate({
				rules : {
				epay_easy_pay_AmountToDeposit : {
					required : true,
					number : true,
					epayLimits : true,
					decimals : true
				}
			},
			messages : {
				epay_easy_pay_AmountToDeposit : {
					required : translations.deposit_validation_blank_amount,
					number : translations.deposit_validation_amount_invalid_number
				}
			}
		});
	}
	
	function validateDepositAmountByLimits(value, provider) {
		if (provider == 'wirecard') {
			if ((parseFloat(limitsAndFees.wirecardMaxAmount/100) >= parseFloat(value)) &&
				(parseFloat(value) >= parseFloat(limitsAndFees.wirecardMinAmount/100))) {
				return true;
			}  else if (limitsAndFees.wirecardMaxAmount == 0 || limitsAndFees.wirecardMaxAmount == null) {
                if (limitsAndFees.wirecardMinAmount == 0 || limitsAndFees.wirecardMinAmount == null) {
                    return true;
                } else if (parseFloat(value) >= parseFloat(limitsAndFees.wirecardMinAmount)) {
                    return true;
                }
            } else if (limitsAndFees.wirecardMinAmount == 0 || limitsAndFees.wirecardMinAmount == null) {
                if (limitsAndFees.wirecardMaxAmount == 0 || limitsAndFees.wirecardMaxAmount == null) {
                    return true;
                } else if (parseFloat(value) <= parseFloat(limitsAndFees.wirecardMaxAmount)) {
                    return true;
                }
            }
            return false;
		}
		if(provider == 'skrill_wallet') {
			if ((parseFloat(limitsAndFees.skrill_walletMaxAmount/100) >= parseFloat(value)) &&
				(parseFloat(value) >= parseFloat(limitsAndFees.skrill_walletMinAmount/100))) {
				return true;
			}  else if (limitsAndFees.skrill_walletMaxAmount == 0 || limitsAndFees.skrill_walletMaxAmount == null) {
                if (limitsAndFees.skrill_walletMinAmount == 0 || limitsAndFees.skrill_walletMinAmount == null) {
                    return true;
                } else if (parseFloat(value) >= parseFloat(limitsAndFees.skrill_walletMinAmount)) {
                    return true;
                }
            } else if (limitsAndFees.skrill_walletMinAmount == 0 || limitsAndFees.skrill_walletMinAmount == null) {
                if (limitsAndFees.skrill_walletMaxAmount == 0 || limitsAndFees.skrill_walletMaxAmount == null) {
                    return true;
                } else if (parseFloat(value) <= parseFloat(limitsAndFees.skrill_walletMaxAmount)) {
                    return true;
                }
            }
            return false;
		}
		if (provider == 'skrill_quick') {
			if ((parseFloat(limitsAndFees.skrill_quickMaxAmount/100) >= parseFloat(value)) &&
				(parseFloat(value) >= parseFloat(limitsAndFees.skrill_quickMinAmount/100))) {
				return true;
			}  else if (limitsAndFees.skrill_quickMaxAmount == 0 || limitsAndFees.skrill_quickMaxAmount == null) {
                if (limitsAndFees.skrill_quickMinAmount == 0 || limitsAndFees.skrill_quickMinAmount == null) {
                    return true;
                } else if (parseFloat(value) >= parseFloat(limitsAndFees.skrill_quickMinAmount)) {
                    return true;
                }
            } else if (limitsAndFees.skrill_quickMinAmount == 0 || limitsAndFees.skrill_quickMinAmount == null) {
                if (limitsAndFees.skrill_quickMaxAmount == 0 || limitsAndFees.skrill_quickMaxAmount == null) {
                    return true;
                } else if (parseFloat(value) <= parseFloat(limitsAndFees.skrill_quickMaxAmount)) {
                    return true;
                }
            }
            return false;
		}
		if (provider == 'epay') {
            if ((parseFloat(limitsAndFees.epayMaxAmount/100) >= parseFloat(value)) &&
                (parseFloat(value) >= parseFloat(limitsAndFees.epayMinAmount/100))) {
                return true;
            }  else if (limitsAndFees.epayMaxAmount == 0 || limitsAndFees.epayMaxAmount == null) {
                if (limitsAndFees.epayMinAmount == 0 || limitsAndFees.epayMinAmount == null) {
                    return true;
                } else if (parseFloat(value) >= parseFloat(limitsAndFees.epayMinAmount)) {
                    return true;
                }
            } else if (limitsAndFees.epayMinAmount == 0 || limitsAndFees.epayMinAmount == null) {
                if (limitsAndFees.epayMaxAmount == 0 || limitsAndFees.epayMaxAmount == null) {
                    return true;
                } else if (parseFloat(value) <= parseFloat(limitsAndFees.epayMaxAmount)) {
                    return true;
                }
            }
            return false;
        }
	}
	
	function removeSkrillQuickOptions() {
		if (isMobileDevice) {
			$("#skrill_quick_NTL").remove();
			$("#skrill_quick_NTL_Form").remove();
			$("#skrill_quick_OBT").remove();
			$("#skrill_quick_OBT_Form").remove();
			$("#skrill_quick_GIR").remove();
			$("#skrill_quick_GIR_Form").remove();
			$("#skrill_quick_DID").remove();
			$("#skrill_quick_DID_Form").remove();
			$("#skrill_quick_SFT").remove();
			$("#skrill_quick_SFT_Form").remove();
			$("#skrill_quick_EBT").remove();
			$("#skrill_quick_EBT_Form").remove();
			$("#skrill_quick_IDL").remove();
			$("#skrill_quick_IDL_Form").remove();
			$("#skrill_quick_PLI").remove();
			$("#skrill_quick_PLI_Form").remove();
			$("#skrill_quick_PWY").remove();
			$("#skrill_quick_PWY_Form").remove();
			$("#skrill_quick_EPY").remove();
			$("#skrill_quick_EPY_Form").remove();
			$("#skrill_quick_NPY").remove();
			$("#skrill_quick_NPY_Form").remove();
			$("#skrill_quick_GLU").remove();
			$("#skrill_quick_GLU_Form").remove();						
		} else { 
			$("#skrill_quick_NTL").hide();
			$("#skrill_quick_NTL_Form").remove();
			$("#skrill_quick_OBT").hide();
			$("#skrill_quick_OBT_Form").remove();
			$("#skrill_quick_GIR").hide();
			$("#skrill_quick_GIR_Form").remove();
			$("#skrill_quick_DID").hide();
			$("#skrill_quick_DID_Form").remove();
			$("#skrill_quick_SFT").hide();
			$("#skrill_quick_SFT_Form").remove();
			$("#skrill_quick_EBT").hide();
			$("#skrill_quick_EBT_Form").remove();
			$("#skrill_quick_IDL").hide();
			$("#skrill_quick_IDL_Form").remove();
			$("#skrill_quick_PLI").hide();
			$("#skrill_quick_PLI_Form").remove();
			$("#skrill_quick_PWY").hide();
			$("#skrill_quick_PWY_Form").remove();
			$("#skrill_quick_EPY").hide();
			$("#skrill_quick_EPY_Form").remove();
			$("#skrill_quick_NPY").hide();
			$("#skrill_quick_NPY_Form").remove();
			$("#skrill_quick_GLU").hide();
			$("#skrill_quick_GLU_Form").remove();	
		}	
	}

//WIRECARD DEPOSIT PAGE
//function populateWirecardForm(response) {
//    $("#wcustomerId").val(response.customerId);
//    $("#wlanguage").val(response.language);
//    $("#wpaymentType").val(response.paymentType);
//    $("#wamount").val(response.amount);
//    $("#wcurrency").val(response.currency);
//    $("#worderDescription").val(response.orderDescription);
//    $("#wsuccessUrl").val(response.successUrl);
//    $("#wcancelUrl").val(response.cancelUrl);
//    $("#wfailureUrl").val(response.failureUrl);
//    $("#wserviceUrl").val(response.serviceUrl);
//    $("#wconfirmUrl").val(response.confirmUrl);
//    $("#wrequestFingerprintOrder").val(response.requestFingerprintOrder);
//    $("#wrequestFingerprint").val(response.requestFingerprint);
//    $("#wirecardCheckoutPageForm").attr("action", response.invokeCheckoutPage);
//    $("#wdenchCustomerId").val(response.denchCustomerId);
//    $("#wdenchCustomerLabelId").val(response.denchCustomerLabelId);
//    $("#wconsumerBillingFirstname").val(response.consumerBillingFirstname);
//    $("#wconsumerBillingLastname").val(response.consumerBillingLastname);
//    $("#wconsumerBillingAddress1").val(response.consumerBillingAddress1);
//    $("#wconsumerBillingCity").val(response.consumerBillingCity);
//    $("#wconsumerBillingCountry").val(response.consumerBillingCountry);
//    $("#wconsumerBillingZipCode").val(response.consumerBillingZipCode);
//    $("#wconsumerEmail").val(response.consumerEmail);
//    $("#wconsumerBirthDate").val(response.consumerBirthDate);
//    $("#wconsumerBillingPhone").val(response.consumerBillingPhone);
//    $("#wdisplayText").val(response.displayText);
//    $("#wbackgroundColor").val(response.backgroundColor);
//    $("#wuniqueId").val(response.uniqueId);
//    $("#wplatformFee").val(response.platformFee);
//    $("#wip").val(response.ip);
//    $("#wcountry").val(response.country);
////            'imageUrl
//}
//  WIRECARD DEPOSIT PAGE
//	$("#submitDepostiButton").click(function() {
//	        var amount = $("#amountToDeposit").val()*100;
//            var provider = $("input[name=paymentProvider]:checked").val();
//            $.ajax({
//                method: "POST",
//                headers : {
//                    "labelEntryPointCode" : config.labelCode
//                },
//                contentType : "application/json",
//                url : config.denchApiUrl + "/api/v1/customerfacing/payment/deposit/prepareParams?amount=" + amount + "&provider=" + provider,
//                dataType : 'json',
//                success : function(response) {
//                    populateWirecardForm(response);
//                    $("#wirecardCheckoutPageForm").submit();
//                }
//            })
//	});

	function initializeDateFields() {
		var monthField = '<option value="">' + translations.dateOfBirth_month + '</option>';
		var yearField = '<option value="">' + translations.dateOfBirth_year + '</option>';
		var currentYear = new Date().getFullYear();
		for (var year = currentYear; year <= currentYear + 20; year++) {
			yearField += '<option value=' + year + '>' + year + '</option>';
		}
		for (var i = 1; i < 13; i++) {
			switch (i) {
				case 1 :
					monthField += '<option value=' + i + '>' + translations.month_January + '</option>'; break;
				case 2 :
					monthField += '<option value=' + i + '>' + translations.month_February + '</option>'; break;
				case 3 :
					monthField += '<option value=' + i + '>' + translations.month_March + '</option>'; break;
				case 4 :
					monthField += '<option value=' + i + '>' + translations.month_April + '</option>'; break;
				case 5 :
					monthField += '<option value=' + i + '>' + translations.month_May + '</option>'; break;
				case 6 :
					monthField += '<option value=' + i + '>' + translations.month_June + '</option>'; break;
				case 7 :
					monthField += '<option value=' + i + '>' + translations.month_July + '</option>'; break;
				case 8 :
					monthField += '<option value=' + i + '>' + translations.month_August + '</option>'; break;
				case 9 :
					monthField += '<option value=' + i + '>' + translations.month_September + '</option>'; break;
				case 10 :
					monthField += '<option value=' + i + '>' + translations.month_October + '</option>'; break;
				case 11 :
					monthField += '<option value=' + i + '>' + translations.month_November + '</option>'; break;
				case 12 :
					monthField += '<option value=' + i + '>' + translations.month_December + '</option>'; break;
			}
		}
		$("#cc_expirationMonth").html(monthField);
		$("#cc_expirationYear").html(yearField);
	}
	
	var getUrlParameter = function getUrlParameter(sParam) {
		var sPageURL = decodeURIComponent(window.location.search.substring(1)),
			sURLVariables = sPageURL.split('&'),
			sParameterName,
			i;
	
		for (i = 0; i < sURLVariables.length; i++) {
			sParameterName = sURLVariables[i].split('=');
	
			if (sParameterName[0] === sParam) {
				return sParameterName[1] === undefined ? true : sParameterName[1];
			}
		}
	};

	function initializeDepositOnClicks() {
	    $('#wirecardSubmitButton').click(function() {
            loadProviderSettings("WIRECARD");
        });

        $(".amountToDeposit10").click(function() {
            $(".amountToDeposit").val(10)
        });

        $(".amountToDeposit25").click(function() {
            $(".amountToDeposit").val(25)
        });

        $(".amountToDeposit50").click(function() {
            $(".amountToDeposit").val(50)
        });

        $(".amountToDeposit100").click(function() {
            $(".amountToDeposit").val(100)
        });

        $(".amountToDeposit500").click(function() {
            $(".amountToDeposit").val(500)
        });

        $(".amountToDeposit1000").click(function() {
            $(".amountToDeposit").val(1000)
        });

        $('#skrill_walletSubmitButton').click(function () {
            if($('#skrill_walletAmountForm').valid()) {
                doSkrillDeposit();
            }
        });

        $('#skrill_quick_NTL_SubmitButton').click(function () {
            if($('#skrill_quick_NTL_AmountForm').valid()) {
                doSkrillDeposit("NTL");
            }
        });

        $('#skrill_quick_OBT_SubmitButton').click(function () {
            if($('#skrill_quick_OBT_AmountForm').valid()) {
                doSkrillDeposit("OBT");
            }
        });

        $('#skrill_quick_GIR_SubmitButton').click(function () {
            if($('#skrill_quick_GIR_AmountForm').valid()) {
                doSkrillDeposit('GIR');
            }
        });

        $('#skrill_quick_DID_SubmitButton').click(function () {
            if($('#skrill_quick_DID_AmountForm').valid()) {
                doSkrillDeposit("DID");
            }
        });

        $('#skrill_quick_SFT_SubmitButton').click(function () {
            if($('#skrill_quick_SFT_AmountForm').valid()) {
                doSkrillDeposit("SFT");
            }
        });

        $('#skrill_quick_EBT_SubmitButton').click(function () {
            if($('#skrill_quick_EBT_AmountForm').valid()) {
                doSkrillDeposit("EBT");
            }
         });

        $('#skrill_quick_IDL_SubmitButton').click(function () {
            if($('#skrill_quick_IDL_AmountForm').valid()) {
                doSkrillDeposit('IDL');
            }
        });

        $('#skrill_quick_PLI_SubmitButton').click(function () {
            if($('#skrill_quick_PLI_AmountForm').valid()) {
                doSkrillDeposit('PLI');
            }
        });

        $('#skrill_quick_PWY_SubmitButton').click(function () {
            if($('#skrill_quick_PWY_AmountForm').valid()) {
                doSkrillDeposit("PWY");
            }
        });

        $('#skrill_quick_EPY_SubmitButton').click(function () {
            if($('#skrill_quick_EPY_AmountForm').valid()) {
                doSkrillDeposit("EPY");
            }
        });

        $('#skrill_quick_NPY_SubmitButton').click(function () {
            if($('#skrill_quick_NPY_AmountForm').valid()) {
                doSkrillDeposit("NPY");
            }
        });

        $('#skrill_quick_GLU_SubmitButton').click(function () {
            if($('#skrill_quick_GLU_AmountForm').valid()) {
                doSkrillDeposit("GLU");
            }
        });

        $('#epay_default_SubmitButton').click(function () {
            if($('#epay_default_AmountForm').valid()) {
                doEpayDeposit("EPAY_DEFAULT");
            }
        });

        $('#epay_credit_card_SubmitButton').click(function () {
            if($('#epay_credit_card_AmountForm').valid()) {
                doEpayDeposit("EPAY_CREDIT_CARD");
            }
        });

        $('#epay_easy_pay_SubmitButton').click(function () {
            if($('#epay_easy_pay_AmountForm').valid()) {
                doEpayDeposit("EPAY_EASY_PAY");
            }
        });

        $('#choosePayment').change(function () {
            showSelectedOptionHideOthers($(this).val())
        });
	}

    function showSelectedOptionHideOthers(selectedOption) {
        hideAllForms();
        $('#' + selectedOption).show();
    }

    function hideAllForms() {
        $('#wirecardForm').hide();
        $('#skrill_walletForm').hide();
        $('#skrill_quick_NTL_Form').hide();
        $('#skrill_quick_OBT_Form').hide();
        $('#skrill_quick_GIR_Form').hide();
        $('#skrill_quick_DID_Form').hide();
        $('#skrill_quick_SFT_Form').hide();
        $('#skrill_quick_EBT_Form').hide();
        $('#skrill_quick_IDL_Form').hide();
        $('#skrill_quick_PLI_Form').hide();
        $('#skrill_quick_PWY_Form').hide();
        $('#skrill_quick_EPY_Form').hide();
        $('#skrill_quick_NPY_Form').hide();
        $('#skrill_quick_GLU_Form').hide();
        $('#epay_defaultForm').hide();
        $('#epay_credit_cardForm').hide();
        $('#epay_easy_payForm').hide();
        $('#bank-transfer-form').hide();
    }
});