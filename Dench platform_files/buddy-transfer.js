var buddyTransfersConfigs = {};
var transfersToBeReturnedTable;
$(function () {
    var isBuddyTransferFormValid = false;
    initializeBuddyTransferOnClicks();

	var isMobileDevice = isMobile();
	if (isMobileDevice) {
		handleCurrentUser(function (currentUser) {
            if (currentUser == null) {
                 window.location.replace(config.hostUrl + "/login");
                 return;
            }
            if (currentUser.kycVerified != 'VERIFIED') {
                $('#buddyTransferPageNotKYCVerified').show();
				$('#buddyTransferPage').hide();
            } else {
                $.ajax({
                    url: config.denchApiUrl + "/api/v1/customerfacing/config/general",
                    type : "GET",
                     headers : {
                        "labelEntryPointCode" : config.labelCode
                     },
                     xhrFields: {
                         withCredentials: true
                     },
                     success : function(response) {
                         if (response.buddyTransferEnabled == "true") {
                            $('#buddyTransferPage').show();
                         } else {
                            $("#buddyTransferDisabled").show();
                         }
                     }
                });
            }
        });

	 	$("#kyc_button_buddy").click(function() {
           window.location.replace(config.hostUrl + "/kyc");
        });

	    $(".buddy-transfer").addClass("modal-show");

        $.ajax({
            url: config.denchApiUrl + "/api/v1/customerfacing/customers/balances",
            type : "GET",
            headers : {
                "labelEntryPointCode" : config.labelCode
            },
            xhrFields: {
                withCredentials: true
            },
            success : function(response) {
                $("#customerBalance").html((response.totalBalance / 100).toFixed(2) + "<span> " + response.currency + "</span>");
            }
        });

        loadBuddyTransferData();
 	} else {
        $("#web-tab-buddy-transfer").click(function (e) {
            e.preventDefault();
            hideAllBuddyTransferContentContainers();
            if (currentUser.kycVerified != 'VERIFIED') {
                $('#buddyTransferPageNotKYCVerified').show();
			}
			else {
			    $('#buddyTransferPage').show();
			    initializeBuddyTransferCurrencyField();
			    loadBuddyTransferData()
			}

            $("#kyc_button_buddy").click(function() {
                var myProfileTab = $(".profile-details-modal").find(".tabs-menu.main-tabs-bar");
                $(myProfileTab[0]).find(".kyc-details").click();
            });
        });
    }

    function initializeBuddyTransferOnClicks() {
        $("#sendFunds").click(function() {
            if($('#buddyTransferForm').valid() && isBuddyTransferFormValid) {
                $.ajax({
                    type : 'POST',
                    url : config.denchApiUrl + '/api/v1/customerfacing/payment/buddyTransfers?receiver=' + $('#receiverEmail').val()
                            + '&amount=' + $('#amountToBeSent').val() * 100 + '&currency=' + $('#supportedCurrencies').val(),
                    headers : {
                       "labelEntryPointCode" : config.labelCode
                    },
                    xhrFields: {
                       withCredentials: true
                    },
                    success : function(response) {
                        showSuccessMessage(translations.buddytransfer_success);
                        $('#receiverEmail').val('');
                        $('#amountToBeSent').val('');
                        isBuddyTransferFormValid = false;
                    }
                })
            }
        });

        $("#returnFunds").click(function() {
            var data = getAlLSelectedBuddyTransferReturns();
			if (typeof data !== 'undefined' && data.length > 0) {
				$.ajax({
					type : 'POST',
					url : config.denchApiUrl + '/api/v1/customerfacing/payment/buddyTransfers/return',
					headers : {
					   "labelEntryPointCode" : config.labelCode
					},
					xhrFields: {
					   withCredentials: true
					},
					contentType : "application/json",
					data : JSON.stringify(data),
					success : function(response) {
						showSuccessMessage(translations.buddytransfer_return_buddy_transfer_success);
						$('#web-tab-buddy-transfer').trigger('click');
						transfersToBeReturnedTable.ajax.reload();
					},
					failure : function(response, xhr) {
						showErrorMessage(translations.buddytransfer_return_buddy_transfer_failed)
					}
				})
			} else {
				showErrorMessage(translations.buddytransfer_return_noselection)
			}
        });
    }

    function getAlLSelectedBuddyTransferReturns() {
        var buddyTransfersSelectedForReturn = [];
        $('.transferToReturn:checkbox:checked').each(function () {
            buddyTransfersSelectedForReturn.push(transfersToBeReturnedTable.row($(this).parents('tr')).data().id);
        });
        return buddyTransfersSelectedForReturn;
    }

    function loadBuddyTransferData() {
        $.ajax({
            method: "POST",
            headers : {
               "labelEntryPointCode" : config.labelCode
            },
            xhrFields: {
               withCredentials: true
            },
            contentType : "application/json",
            url : config.denchApiUrl + "/api/v1/customerfacing/payment/buddyTransfers/search",
            data : JSON.stringify({
                  sortBy : "",
                  sortAsc : 1,
                  pageStart : 0,
                  pageSize : 20,
                  globalSearch : "",
                  columnSearches : [ {
                          key : "isReturned",
                          operation : "eq",
                          value : false
                      }
                  ]
            }),
            success : function(response) {
                if(response.content.length > 0) {
                    $('#buddyTransferReturn').css('display', 'block');
                    if ($.fn.DataTable.isDataTable('#transfersToBeReturned')) {
                        transfersToBeReturnedTable = $('#transfersToBeReturned').DataTable();
                        transfersToBeReturnedTable.ajax.reload();
                        return;
                    } else {
                       transfersToBeReturnedTable = getBuddyTransfersToBeReturned();
                    }
                } else {
                    $('#buddyTransferSend').css('display', 'block');
                    getBuddyTransferConfigs();
                }
            }
        });
    }

    function initializeBuddyTransferValidators() {
        $.validator.addMethod('validateEmail', function (value, element) {
            if (RegExp('\\s*\\S+@\\s*\\S+\\.\\s*\\S+').test(value)) {
                $.ajax({
                    method: "GET",
                    headers : {
                       "labelEntryPointCode" : config.labelCode
                    },
                    xhrFields: {
                       withCredentials: true
                    },
                    contentType : "application/json",
                    url : config.denchApiUrl + "/api/v1/customerfacing/customers/findByEmail?receiverEmail=" + getReceiverEmail(),
                    success : function(response) {
                        isBuddyTransferFormValid = true;
                        initializeBuddyTransferCurrencyField(response.currency);
                    },
                    error : function() {
                        var validator = $("#buddyTransferForm").validate();
                        validator.showErrors({
                            "receiverEmail": translations.buddytransfer_user_not_found
                        });
                        $("#receiverEmail").attr("aria-invalid", true);
                        $("#receiverEmail").addClass("error");
                        isBuddyTransferFormValid = false;
                    }
                });
                return true;
            }
            return false;
        }, translations.email_format_error);


        $('#buddyTransferForm').validate({
            errorElement:'div',
            rules : {
                receiverEmail : {
                    required : true,
                    validateEmail : true
                },
                amountToBeSent : {
                    required : true,
                    max : buddyTransfersConfigs.max / 100,
                    min : buddyTransfersConfigs.min / 100,
                }
            },
            messages : {
                receiverEmail : {
                    required : translations.buddytransfer_validation_field_required
                },
                amountToBeSent : {
                    required : translations.buddytransfer_validation_field_required,
                    max : translations.buddytransfer_validation_max_amount + " " + renderMoney(buddyTransfersConfigs.max),
                    min : translations.buddytransfer_validation_min_amount + " " + renderMoney(buddyTransfersConfigs.min)
                }
            }
        });
    }

    function initializeBuddyTransferCurrencyField(newCurrency) {
        $('#supportedCurrencies').empty();
        $('#supportedCurrencies').append("<option value='" +  currentUser.currency + "'>" + currentUser.currency + "</option>");
        if(null != newCurrency && "" != newCurrency && currentUser.currency != newCurrency) {
            $('#supportedCurrencies').append("<option value='" +  newCurrency + "'>" + newCurrency + "</option>");
        }
    }

    function getReceiverEmail() {
        return $("#receiverEmail").val();
    }

    function getBuddyTransfersToBeReturned(){
        var table = $('#transfersToBeReturned').DataTable({
            'processing' : true,
            'serverSide' : false,
            'filter' : false,
            'responsive' : true,
            'lengthChange': false,
            'dom': '<"top">rt<"bottom"fip><"clear">',
            'ajax' : {
                url : config.denchApiUrl + "/api/v1/customerfacing/payment/buddyTransfers/toBeReturned/search",
                type : 'POST',
                headers : {
                    "labelEntryPointCode" : config.labelCode
                },
                 xhrFields: {
                    withCredentials: true
                },
                contentType : 'application/json',
                dataSrc : 'content',
                data : function(d) {
                    d.columnSearches = [];
                    var columnSearch = {};
                    columnSearch.key = 'isReturned';
                    columnSearch.operation = 'eq';
                    columnSearch.value = false;
                    d.columnSearches.push(columnSearch);
                    return JSON.stringify(d);
                }
            },
            'columns' : [{
                'data' : 'id'
            }, {
                'data' : 'username'
            }, {
                'data' : 'amount',
                'render' : renderMoney
            }, {
                'data' : 'currency'
            }, {
                'data' : 'createdDate',
                'render' : renderTimestamp
            }, {
                'data' : '',
                'render' :  function (data, type, full, meta) {
                    return '<input type="checkbox" class="table-radio css-checkbox transferToReturn" id="transferToReturn'+ full['id'] +
                    '"><label for="transferToReturn'+ full['id'] +'" class="css-label"> </label>';
                }
            }],
           "columnDefs": [{
               "targets": 0,
               "visible": false
           }, {
            "targets" : "_all",
            "orderable" : false
           }, {
             "targets": 5,
             "responsivePriority": -1
           }]
        });
        return table;
    }

    function getBuddyTransferConfigs() {
        $.ajax({
            type : "GET",
            url : config.denchApiUrl + "/api/v1/customerfacing/payment/buddyTransfers/configurations",
            headers : {
               "labelEntryPointCode" : config.labelCode
            },
            xhrFields: {
               withCredentials: true
            },
            success : function(response) {
                buddyTransfersConfigs.min = response["buddy.transfer.min.amount"];
                buddyTransfersConfigs.max = response["buddy.transfer.max.amount"];
                buddyTransfersConfigs.feeAmount = response['buddy.transfer.fee.amount'];
                buddyTransfersConfigs.feePercent = response['buddy.transfer.fee.percent'];
                initializeBuddyTransferValidators();
                populateLimitConfigurationFields();
            }
        });
    }

    function populateLimitConfigurationFields() {
        $("#minBuddyTransfer").html(renderMoney(buddyTransfersConfigs.min));
        $("#maxBuddyTransfer").html(renderMoney(buddyTransfersConfigs.max));
        $("#feeBuddyTransfer").html(renderMoney(buddyTransfersConfigs.feeAmount));
    }

    function hideAllBuddyTransferContentContainers() {
        $("#buddyTransferPage").hide();
        $("#buddyTransferReturn").hide();
        $("#buddyTransferSend").hide();
        $("#buddyTransferPageNotKYCVerified").hide();
    }
});