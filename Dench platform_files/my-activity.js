constants = {
    SELF_EXCLUSION : 'SELF_EXCLUSION',
    UNTIL : 'UNTIL',
    SESSION_LENGTH_CHANGED : 'SESSION_LENGTH_CHANGED',
    WEEKLY_CHANGE : 'WEEKLY_CHANGE',
    MONTHLY_CHANGE : 'MONTHLY_CHANGE',
    DAILY_CHANGE : 'DAILY_CHANGE',
    KYC_UPLOAD_NOTE : 'KYC_UPLOAD_NOTE',
    MAX_DEPOSIT_AMOUNT_CHANGE : 'MAX_DEPOSIT_AMOUNT_CHANGE',
    MONEY_PLACEHOLDERS : ['maxDepositAmount','maxDepositDaily','maxDepositWeekly','maxDepositMonthly','maxWithdrawDaily','maxWithdrawWeekly',
                            'maxWithdrawMonthly','maxPlaceBetsDaily','maxPlaceBetsWeekly','maxPlaceBetsMonthly','maxLossDaily','maxLossWeekly',
                            'maxLossMonthly'],
    TIME_PLACEHOLDERS : ['sessionLength']
}

$(function() {
	 var isMobileDevice = isMobile();
	 
     if (isMobileDevice){
        handleCurrentUser(function (currentUser) {
           if (currentUser == null) {
                window.location.replace(config.hostUrl + "/login");
           }
		   $(".my-activity").addClass("modal-show");
		   loadMyActivityTabel()
        });
	 } else {
		 $("#load-my-activities").click(function (e) {
            e.preventDefault();
			loadMyActivityTabel()
       }); 
			
	}
	
});

function loadMyActivityTabel(){
    if ($.fn.DataTable.isDataTable('#activities')) {
        table = $('#activities').DataTable();
        table.ajax.reload();
        return;
    }
	
	var isMobileDevice = isMobile();
	if (isMobileDevice) {
		$.fn.DataTable.ext.pager.numbers_length = 4;
	}
	
	var table = {
        'processing' : true,
        'serverSide' : true,
        'responsive' : true,
        'lengthChange': false,
        'filter' : false,
        'ajax' : {
            url : config.denchApiUrl + '/api/v1/customerfacing/customers/activities/search/fordatatable',
            type : 'POST',
            headers : {
                "labelEntryPointCode" : config.labelCode
            },
            dataType : 'json',
            contentType : 'application/json',
            data : function(d) {
                var searchText = d.search.value;
                d.sortBy = d.columns[d.order[0].column].data;
                d.sortAsc = d.order[0].dir == "asc";
                d.pageStart = d.start;
                d.pageSize = d.length;
                d.globalSearch = searchText;
                return JSON.stringify(d);
            }
        },
        'columns' : [{
            'data' : 'createdDate',
            'render' : renderTimestamp
        }, {
            'data' : 'type',
            'render': function(a, display, item)  {
                var uiPropsPerStatus = {
                  KYC_UPLOAD: {
                    labelText: translations.my_activity_type_kyc_upload
                  },
                  PROFILE_CHANGE: {
                    labelText: translations.my_activity_type_profile_change
                  },
                  ACCOUNT_STATUS_CHANGE: {
                    labelText: translations.my_activity_type_account_status_change
                  },
                  LOGIN: {
                    labelText: translations.my_activity_type_login
                  },
                  LOGOUT: {
                    labelText: translations.my_activity_type_logout
                  },
                  SESSION_STARTED : {
                    labelText: translations.my_activity_session_started
                  },
                  SESSION_ENDED : {
                    labelText: translations.my_activity_session_ended
                  },
                  SELF_EXCLUDE_BY_OPERATOR : {
                      labelText : translations.my_activity_self_exclude_operator
                  },
                  SELF_EXCLUDE_BY_CUSTOMER : {
                       labelText : translations.my_activity_self_exclude_customer
                  },
                  GAMING_LIMITS_CHANGE : {
                      labelText : translations.my_activity_gaming_limits_change
                  },
                  KYC_VERIFIED : {
                      labelText : translations.my_activity_kyc_verified
                  },
                  KYC_NOT_VERIFIED : {
                      labelText : translations.my_activity_kyc_not_verified
                  }
                }
                var uiProps = uiPropsPerStatus[item.type] || {
				   labelText: item.type
			    }

                return `<span>${uiProps.labelText}</span>`
              }

        }, {
            'data' : 'ip'
        }],
        'order': [[0, 'desc']],
        "columnDefs": [ { "defaultContent": "-", "targets": "_all" } ]
    }
	
	if (!isMobileDevice) {
		table['columns'].push({
		    'data' : 'notes',
		    'render': function (data, type, full, meta) {
		        if (full.notes != null) {
		            return translateNotes(full.notes, JSON.parse(full.selfExcludeUntilDatesJSON));
		        } else {
		            return null;
		        }
		    }
        });
	}
	
    $('#activities').DataTable(table);
}

function translateNotes(notes, datesJson) {
    var notesArr = notes.split(',');
    var result = "";
    notesArr.forEach(function (note) {
        if ((note.indexOf(constants.SELF_EXCLUSION) != -1 && note.indexOf(constants.UNTIL) != -1 && datesJson != null) ||
                (note == constants.SESSION_LENGTH_CHANGED || note == constants.MAX_DEPOSIT_AMOUNT_CHANGE) ||
                (note.indexOf(constants.DAILY_CHANGE) != -1) || (note.indexOf(constants.MONTHLY_CHANGE) != -1) ||
                (note.indexOf(constants.WEEKLY_CHANGE) != -1)) {
            var datePlaceholderReplacements = new RegExp(Object.keys(datesJson).join("|"), "gi");
            result += translations[note].replace(datePlaceholderReplacements, function(matched) {
                return postProcessPlaceHolderValues(matched, datesJson[matched]);
            });
            result += "<br>";
            result = result.replace(new RegExp("{|}", "gi"), "");
        } else if (note == constants.KYC_UPLOAD_NOTE) {
            var translatedNote = translations[note];
            result += translatedNote.replace("{documentType}", translations["KYC_DOC_TYPE_" + datesJson.documentType])
                          .replace("{fileName}", datesJson.fileName);
        } else {
            result += translations[note] + "<br>";
        }
    })
    return result;
}

function postProcessPlaceHolderValues(key, value) {
    var result = value;
    if (constants.TIME_PLACEHOLDERS.includes(key)) {
        result = millisecondsToString(value);
    } else if (constants.MONEY_PLACEHOLDERS.includes(key)) {
        result = renderMoney(value);
    }
    return result;
}