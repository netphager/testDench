$(function () {
    var isMobileDevice = isMobile();

    initializePageOnClicks();

    if (isMobileDevice){
        handleCurrentUser(function (currentUser) {
           if (currentUser == null) {
                window.location.replace(config.hostUrl + "/login");
           }
           $(".history").addClass("modal-show");
           loadPaymentTransactionsTable();
        });
    } else {
        $("#web-tab-history-details").click(function (e) {
            e.preventDefault();
            loadPaymentTransactionsTable();
        });
    }
});

function initializePageOnClicks() {
     $('.transactions_panel').click(function() {
        var transactionType = $(this).attr("transactionType");
        if (transactionType == 'PAYMENT') {
            $('#paymentTransactions').css('display', 'inline');
            $('#gamingTransactions').css('display', 'none');
            $('#bonusTransactions').css('display', 'none');
            loadPaymentTransactionsTable();
        } else if (transactionType == 'GAMING') {
            $('#paymentTransactions').css('display', 'none');
            $('#gamingTransactions').css('display', 'inline');
            $('#bonusTransactions').css('display', 'none');
            loadSportTransactionsTable();
            loadCasinoTransactionsTable();
        } else if (transactionType == 'BONUS') {
            $('#paymentTransactions').css('display', 'none');
            $('#gamingTransactions').css('display', 'none');
            $('#bonusTransactions').css('display', 'inline');
            loadBonusAssetsTable();
        }
    });

    $("#paymentTransactionsTable").on("click", ".cancelWithdrawButton", function(e) {
		e.preventDefault();
        var table = $("#paymentTransactionsTable").DataTable();
        var data = table.row($(this).parents('tr')).data()
        var transactionId = data.id;
        $.ajax({
            type : 'POST',
            url : config.denchApiUrl + '/api/v1/customerfacing/customers/payments/withdraws/' + transactionId + '/cancel',
            headers : {
                "labelEntryPointCode" : config.labelCode
            },
            success : function() {
                table.draw();
                showSuccessMessage(translations.withdraw_cancel_success_message);
            }
        })
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

function loadPaymentTransactionsTable() {
    if ($.fn.DataTable.isDataTable('#paymentTransactionsTable')) {
        table = $('#paymentTransactionsTable').DataTable();
        table.ajax.reload();
        return;
    }
    var table = $('#paymentTransactionsTable').DataTable({
        'processing' : true,
        'serverSide' : true,
        'responsive' : true,
        'lengthChange': false,
        'filter' : false,
        'ajax' : {
            url : config.denchApiUrl + '/api/v1/customerfacing/customers/payments/transactions/search/fordatatable',
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
            'data' : "createdDate",
            'render' : renderTimestamp
        }, {
            'data' : "amount",
             "render": renderMoney
        }, {
            'data' : "paymentType"
        }, {
            'data' : "status",
            'render' : renderTransactionStatus
        }, {
            'data' : "paymentMethod",
            'render' : renderPaymentMethodNames
        }, {
            'data' : "platformTransactionFee",
            'render' : renderMoney
        }, {
            'data' : "id",
            'render' : function(data, type, full, meta){
                return renderCancelWithdrawButton(data, type, full, meta);
           }
        }],
        "columnDefs": [ { "defaultContent": "-", "targets": "_all" } ],
        'order': [[0, 'desc']]
    });

    return table;
}

function loadSportTransactionsTable(){
    if ($.fn.DataTable.isDataTable('#sportTransactionsTable')) {
        table = $('#sportTransactionsTable').DataTable();
        table.ajax.reload();
        return;
    }
    var table = $('#sportTransactionsTable').DataTable({
        'processing' : true,
        'serverSide' : true,
        'responsive' : true,
        'lengthChange': false,
        'filter' : false,
        'ajax' : {
            url : config.denchApiUrl + '/api/v1/customerfacing/customers/gaming/transactions/search/fordatatable',
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
                d.columnSearches = [];
                var columnSearchSport = {};
                columnSearchSport.key = 'product';
                columnSearchSport.operation = 'in';
                columnSearchSport.value = ['SPORT', 'LIVE_SPORT', 'SPORTS_MIXED', 'VIRTUALS'] ;
                d.columnSearches.push(columnSearchSport);
                return JSON.stringify(d);
            }
        },
        'columns' : [{
            'data' : 'allBets',
            'render': renderMoney
        }, {
            'data': 'status',
            'render': renderBetStatus
         },{
            'data' : "createdDate",
            'render' : renderTimestamp
        }, {
           'data' : "betDescription"
        }, {
           'data' : "betEventsDescription"
        }],
        'order': [[2, 'desc']],
        "columnDefs": [ { "defaultContent": "-", "targets": "_all" } ]
    });

    return table;
}

function loadCasinoTransactionsTable(){
    if ($.fn.DataTable.isDataTable('#casinoTransactionsTable')) {
        table = $('#casinoTransactionsTable').DataTable();
        table.ajax.reload();
        return;
    }
    var table = $('#casinoTransactionsTable').DataTable({
        'processing' : true,
        'serverSide' : true,
        'responsive' : true,
        'lengthChange': false,
        'filter' : false,
        'ajax' : {
            url : config.denchApiUrl + '/api/v1/customerfacing/customers/gaming/transactions/search/fordatatable',
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
                d.columnSearches = [];
                var columnSearch = {};
                columnSearch.key = 'product';
                columnSearch.operation = 'eq';
                columnSearch.value = 'CASINO';
                d.columnSearches.push(columnSearch);
                return JSON.stringify(d);
            }
        },
        'columns' : [{
            'data' : 'gameName'
        }, {
            'data' : 'allBets',
            'render': renderMoney
        }, {
            'data' : 'allWins',
            'render': renderMoney
        }, {
            'data': 'status',
            'render': renderBetStatus
        }, {
            'data' : 'createdDate',
            'render' : renderTimestamp
        }],
        'order': [[4, 'desc']],
        "columnDefs": [ { "defaultContent": "-", "targets": "_all" } ]
    });
    return table;
}

function loadBonusAssetsTable() {
    if ($.fn.DataTable.isDataTable('#bonusTransactionsTable')) {
        table = $('#bonusTransactionsTable').DataTable();
        table.ajax.reload();
        return;
    }

    var table = $('#bonusTransactionsTable').DataTable({
        'processing' : true,
        'serverSide' : true,
        'responsive' : true,
        'lengthChange': false,
        'filter' : false,
        'ordering': false,
        'ajax' : {
            url : config.denchApiUrl + '/api/v1/customerfacing/customers/bonuses/assets/search/fordatatable',
            type : 'POST',
            headers : {
                "labelEntryPointCode" : config.labelCode
            },
            dataType : 'json',
            contentType : 'application/json',
            data : function(d) {
                var searchText = d.search.value;
                d.sortBy = 'createdDate';
                d.sortAsc = false;
                d.pageStart = d.start;
                d.pageSize = d.length;
                return JSON.stringify(d);
            }
        },
        'columns' : [{
            'data' : 'bonusName'
        }, {
            'data' : 'amount',
            'render': renderMoney
        }, {
            'data' : 'createdDate',
            'render': renderTimestamp
        }, {
            'data' : 'status'
        }, {
            'data' : '',
            'render' : renderProgressBar
        }],
        'drawCallback' : function() {
             $('[data-toggle="tooltip"]').tooltip();
        },
        "columnDefs": [ { "defaultContent": "-", "targets": "_all" } ]
    });

    return table;
}

function renderProgressBar(data, type, full, meta) {
    var ariaValuemin = 0;
    var ariaValuemax;
    var ariaValuenow;
    var progressInPercents;
    var tooltipText;
    if (null != full.bonusWageringSettings) {
        ariaValuemax = full.receivedAmount * full.bonusWageringSettings.wageringMultiplierSport;
        ariaValuenow = ariaValuemax - full.wageringRequirementLeftSettle;
        progressInPercents = ((parseFloat((ariaValuenow - ariaValuemin) / (ariaValuemax - ariaValuemin)).toFixed(2)) * 100).toFixed(0);
        tooltipText = progressInPercents + "% Complete<br/>Multipliers:<br/>Sport - x" + full.bonusWageringSettings.wageringMultiplierSport +
                               (full.bonusWageringSettings.wageringMultiplierCasino != null ? "<br/>Casino - x" + full.bonusWageringSettings.wageringMultiplierCasino  : "" )+
                               (full.bonusWageringSettings.wageringMultiplierLiveCasino != null ? "<br/>LiveCasino - x" + full.bonusWageringSettings.wageringMultiplierLiveCasino : "") +
                               (full.bonusWageringSettings.wageringMultiplierDFS != null ? "<br/>DFS - x" + full.bonusWageringSettings.wageringMultiplierDFS : "");
    } else {
        ariaValuemax = 100;
        ariaValuenow = 100;
        progressInPercents = 100;
        tooltipText = progressInPercents + "% Complete";
    }
    if (progressInPercents == 0) {
        spanStyle = 'style="color: black"';
    }
    return "<a class='bonusTooltip' href='#' data-trigger='manual' data-toggle='tooltip' data-placement='top' " +
           "        data-html='true' data-title='" + tooltipText + "'>" +
           "    <div class='progress bonus-progress'>" +
           "        <div class='progress-bar progress-bar-success bonus-progressbar' role='progressbar' aria-valuenow='" + ariaValuenow + "'" +
           "               aria-valuemin='" + ariaValuemin + "' aria-valuemax='" + ariaValuemax + "' style='width:" + progressInPercents + "%'>" +
           "        </div>" +
           "    </div>" +
           "</a>";
}

function renderCancelWithdrawButton(data, type, full, meta) {
    if(full.status == 'WAIT_CONFIRMATION' && full.paymentType == 'WITHDRAW') {
        return "<a href='#' type='button' class='cancelWithdrawButton'>" + translations.transaction_table_cancelbutton +
            "</a>";
    } else if (full.paymentMethod == 'EPAY_EASY_PAY') {
        return full.externalTransactionId;
    } else {
        return;
    }
}

function renderTransactionStatus(status) {
    var result;
    switch(status) {
        case "WAIT_CONFIRMATION": result = (translations.transaction_status_wait_confirmation).toUpperCase(); break;
        case "PENDING": result = (translations.transaction_status_pending).toUpperCase(); break;
        case "CANCELED": result = (translations.transaction_status_canceled).toUpperCase(); break;
        case "FAILED": result = (translations.transaction_status_failed).toUpperCase(); break;
        case "COMPLETED_SUCCESS": result = (translations.transaction_status_completed_success).toUpperCase(); break;
        case "CONFIRMED": result = (translations.transaction_status_confirmed).toUpperCase(); break;
        case "REJECTED": result = (translations.transaction_status_rejected).toUpperCase(); break;
        case "REQUESTED": result = (translations.transaction_status_requested).toUpperCase(); break;
    }
    return result;
}

function renderPaymentMethodNames(providerName) {
    var result;
    switch(providerName) {
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
        case "BANK_ACCOUNT": result = translations.transaction_method_bank_account; break;
        case "BUDDY_TRANSFER": result = translations.transaction_method_buddy_transfer; break;
        case "EPAY_EASY_PAY" : result = translations.transaction_method_epay_easy_pay; break;
        case "EPAY_CREDIT_CARD" : result = translations.transaction_method_epay_credit_card; break;
        case "EPAY_DEFAULT" : result = translations.transaction_method_epay_default; break;
        default: result = providerName; break;
    }
    return result;
}

function renderBetStatus(status) {
    var statusPreview = status
    switch (status) {
        case "COMPLETED": statusPreview = translations.transaction_bet_status_completed; break;
        case "IN_PROGRESS": statusPreview = relabelText = translations.transaction_bet_status_in_progress; break;
    }
    return statusPreview;
}
