window.currentUser = null;

window.onCurrentUserChange = [];
window.registrationType;

window.simpleMessages = [];
window.showNextSimpleMessageIntervalId = null;

// Set default ajax setup
$.ajaxSetup({
    xhrFields: {
        withCredentials: false
    },
    error : function(xhr, textStatus, errorThrown) {
        try {
            var error = JSON.parse(xhr.responseText);

            if (error.errorCode == 1) {
                $(".login-error-message").html("<i class='icon-error2'></i>" + translations.login_bad_credentials);
                $(".login-error-message").show();
                $("#username").val("");
                $("#password").val("");
            } else if (error.errorCode == 2) {
                if (error.data.accountLockStatus == 'FROZEN') {
                    $(".login-error-message").html(translations.login_user_frozen);
                    $(".login-error-message").show();
                } else if (error.data.accountLockStatus == 'INACTIVE') {
                    $(".login-error-message").html(translations.login_user_inactive);
                    $(".login-error-message").show();
                } else {
                    $(".login-error-message").html(translations.login_user_disabled);
                    $(".login-error-message").show();
                }
            } else if (error.errorCode == 49) {
                $(".login-error-message").html(translations.login_ip_forbidden);
                $(".login-error-message").show();
            } else if (error.errorCode == 8) {
                showErrorMessage(translations.buddytransfer_user_wrong_email);
            }  else  if (error.errorCode == 10) {
                showErrorMessage(translations.email_not_sent);
            } else if (error.errorCode == 13) {
                showErrorMessage(translations.duplicate_email);
            } else if (error.errorCode == 14) {
                showErrorMessage(translations.duplicate_username);
            } else if (error.errorCode == 15) {
                showErrorMessage(translations.tac_not_accepted);
            } else if (error.errorCode == 19) {
                showErrorMessage(translations.password_not_match);
            } else if (error.errorCode == 21) {
                showErrorMessage(translations.not_enough_money);
            }else if (error.errorCode == 23) {
                showErrorMessage(translations.withdraw_error_overamount);
            } else if (error.errorCode == 24) {
                showErrorMessage(translations.withdraw_error_lessamount);
            } else if (error.errorCode == 25) {
                showErrorMessage(translations.withdraw_error_emptybalance);
            } else if (error.errorCode == 26) {
                showErrorMessage(translations.withdraw_error_insufficientbalance);
            } else if (error.errorCode == 33) {
                showErrorMessage(translations.withdraw_error_pendingbuddytransfer);
            } else if (error.errorCode == 35){
                showErrorMessage(translations.withdraw_error_nomethodsavailable);
            } else if (error.errorCode == 38) {
                showErrorMessage(translations.buddytransfer_kyc_not_verified);
            } else if (error.errorCode == 39) {
                handleSelfExcludedCustomer(error);
            } else if (error.errorCode == 40) {
                showErrorMessage(handleResponsibleGamingError(error));
            }else if (error.errorCode == 47) {
                showErrorMessage(translations.buddytransfer_send_yourself_email_error);
            }else if (error.errorCode == 53) {
                showErrorMessage(translations.accounttransfer_send_yourself_email_error);
            }else if (error.errorCode == 51) {
                showErrorMessage(translations.accounttransfer_not_allowed);
            }else if (error.errorCode == 52) {
                showErrorMessage(translations.buddytransfer_not_allowed);
            }else if (error.errorCode == 54) {
                showErrorMessage(translations.registration_too_many_registrations_from_same_ip);
            }else if (error.errorCode == 41) {
                showErrorMessage()
            } else {
                showGenericErrorMessage();
            }
        } catch (err) {
            showGenericErrorMessage();
        }

    },
    statusCode : {
        401 : function () {
            handleNotLoggedUser();
        }
    }
});

$(document).ready(function() {
    window.onCurrentUserChange.push(function(currentUser) {
        var cookieLang = $.cookie('language');
        if (isBlank(cookieLang)) {
            cookieLang = 'EN';
        }
        if (null != currentUser && !isBlank(currentUser.lang)
            && cookieLang.toLowerCase() != currentUser.lang.toLowerCase()) {
            // this is the case where site is shown in e.g. English, but user preferences are to show it in e.g. Dutch
            // in this case we have to store the language in the cookie & reload the page (to reload translations)
            setLang(currentUser.lang);
            location.reload();
        }
    })
    $('body').on('click', '.game-link', function() {
        var gameId = $(this).data('game-id');
        var gameName = $(this).data('game-name');
        var gameDescription = $(this).data('game-description');
        var gameThumbnailImage = $(this).data('thumbnail-image');
        var demoModeEnabled = $(this).data('demo-mode-enabled');

        if (null == window.currentUser) {
            // user is 'anonymous' - show modal with game options
            $(".casino-games-modal .game-image-modal").attr('src', gameThumbnailImage);
            $(".casino-games-modal .game-name-modal").html(gameName);
            $(".casino-games-modal .game-description-modal").html(gameDescription);
            var demoPlayUrl = config.hostUrl + '/casino-game-play?gameId=' + gameId + '&real=false';
            if(demoModeEnabled === true) {
                $(".casino-games-modal .demo-play-button").attr('href', demoPlayUrl);
            } else {
                $(".casino-games-modal .demo-play-button").remove();
            }

            openModal($(".casino-games-modal"));
        } else {
            // user is logged-in - directly load the game
            loadGameRealPlay(gameId);
        }
    });

    $('body').on('click', '.modal-close-button', function() {
        closeModal($(this).closest('.modal-popup'));
    });

    $(document).ajaxStart(function() {
        $('#loadingOverlay').show(); // show the gif image when ajax starts
    }).ajaxStop(function() {
        $('#loadingOverlay').hide(); // hide the gif image when ajax completes
    });

    if (jQuery.fn.dataTableExt) {
        $.extend( $.fn.dataTable.defaults, {
            ajax : {
                error : function (xhr, textStatus, errorThrown) {
                    if (xhr.status == '401') {
                        handleNotLoggedUser();
                    }
                }
            }
        });
    }

    if (typeof jQuery.validator != "undefined") {
        jQuery.validator.addMethod('validDate', function (value, element) {
            var day = $(element).closest(".overall-date").find(".date-dropdown.day").val();
            var month = $(element).closest(".overall-date").find(".date-dropdown.month").val();
            var year = $(element).closest(".overall-date").find(".date-dropdown.year").val();
            var date = year + "-" + month + "-" + day;
            if (moment(date, 'YYYY-M-D', true).isValid() || ("" == day && "" == month && "" == year)) {
                return true;
            } else {
                return false;
            }
        });
        jQuery.validator.setDefaults({
            errorElement:'div',
            errorPlacement: function (error, element) {
                var type = $(element).attr("type");
                if (type === "checkbox" || element.hasClass('date-dropdown')) {
                  // custom placement
                  if(element.hasClass('to') || element.hasClass('from')) {
                     error.insertAfter(element.closest('.overall-date'));
                  } else {
                     element.parent().append(error);
                  }
                } else {
                  error.insertAfter(element);
                }
            }
        });
    }

    $('body').on('click', '[data-modal-close]', function() {
        var modalId = $(this).data("modal-close");
        closeModal($(modalId));
    });

    $('body').on('click', '[data-modal-open]', function() {
        var modalId = $(this).data("modal-open");
        openModal($(modalId));
    });

    initializeTabs();

    stompClient = null;

});

function startShowNextSimpleMessageInterval() {
    if (!isMobile()) {
        window.showNextSimpleMessageIntervalId = window.setInterval(showNextSimpleMessage, 1000 * 60 * 2);
    }
}

function stopShowNextSimpleMessageInterval() {
    if (window.showNextSimpleMessageIntervalId != null) {
        window.clearInterval(window.showNextSimpleMessageIntervalId);
    }
}


function showNextSimpleMessage() {
    if ($(".simple-message-main").is(":visible")) {
        hideSimpleMessage();
    }

    if (window.simpleMessages.length > 0) {
        showSimpleMessage(window.simpleMessages.pop());
    } else {
        stopShowNextSimpleMessageInterval();
    }
}

function showSimpleMessage(simpleMessage) {
    $(".simple-message-container").html(simpleMessage.content);
    $(".simple-message-main").attr("style", "display:block");
}

function hideSimpleMessage() {
    $(".simple-message-container").html("");
    $(".simple-message-main").attr("style", "display:none");
}

function processSimpleMessage(simpleMessage) {
    if (isMobile()) {
        return;
    }

    if (simpleMessage.type == 'SIMPLE_MESSAGE') {
        if ($(".simple-message-main").is(":visible")) {
            window.simpleMessages.push(simpleMessage);
        } else {
            stopShowNextSimpleMessageInterval();
            showSimpleMessage(simpleMessage);
            startShowNextSimpleMessageInterval();
        }
    } else if (simpleMessage.type == 'ONSITE_POPUP') {
        if (!$("#onside-popup-messages-modal").is(":visible")) {
            $("#onside-popup-messages-content").attr('src','data:text/html;charset=utf-8,' + encodeURIComponent(simpleMessage.content));
            openModal($("#onside-popup-messages-modal"));
        }
    }
}


function handleNotLoggedUser() {
    if (window.location.pathname.indexOf("my-profile") >= 0 ||
    		window.location.pathname.indexOf("my-activity") >= 0 ||
    		window.location.pathname.indexOf("deposit") >= 0 ||
    		window.location.pathname.indexOf("transaction-history") >= 0 ||
    		window.location.pathname.indexOf("buddy-transfer") >= 0 ||
    		window.location.pathname.indexOf("account-transfer") >= 0 ||
    		window.location.pathname.indexOf("kyc") >= 0 ||
    		window.location.pathname.indexOf("change-password") >= 0 ||
    		window.location.pathname.indexOf("profile-menu") >= 0 ||
    		window.location.pathname.indexOf("settings") >= 0 ||
    		window.location.pathname.indexOf("withdraw") >= 0) {
    	window.location.replace(config.hostUrl + "/login");
    }
}

function initializeTabs() {
    $(".tabs-menu a").click(function (event) {
        event.preventDefault();
        $(this).parent().addClass("current");
        $(this).parent().siblings().removeClass("current");
		$.each($(this).closest(".tabs-menu-container .tabs-menu").find('li a'), function(index, el) {
		  var tabContentDivId = $(el).attr('href');
		  $(tabContentDivId).hide();
		});
        var tab = $(this).attr("href");
        $(tab).fadeIn();
    });
}

function openModal(modalDivElement) {
    topScroll = $('body').scrollTop();
    $('body').append('<div class="modal-overlay"></div>');
    $('body').addClass("noscroll");
    modalDivElement.addClass("modal-show");
}

function closeModal(modalDivElement) {
    $('.game-image-modal').attr('src', '');
    $('body').removeClass("noscroll");
    $('.modal-overlay').remove();
    modalDivElement.removeClass('modal-show');
    if (typeof topScroll !== 'undefined') {
        $('body').scrollTop(topScroll);
    }
}

function handleCurrentUser(callback) {
    $.ajax({
        method: "GET",
        url: config.denchApiUrl + "/api/v1/customerfacing/currentCustomer",
        headers : {
         "labelEntryPointCode" : config.labelCode
        },
        success: function (response) {
          window.currentUser = response;
          callback(response);
        },
        error: function(xhr, textStatus, errorThrown) {
          window.currentUser = null;
          callback(null);
        }
    });
}

function isMobile() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(window.navigator.userAgent);
}

function renderTimestamp(data) {
    if (data) {
        return moment(data).format("MM/DD/YYYY HH:mm");
    }
}

function renderMoney(data) {
    if (data) {
        return parseFloat(data / 100).toFixed(2);
    } else {
        return 0;
    }
}

function millisecondsToString(ms) {
    days = Math.floor(ms / (24*60*60*1000));
    daysms=ms % (24*60*60*1000);
    hours = Math.floor((daysms)/(60*60*1000));
    hoursms=ms % (60*60*1000);
    minutes = Math.floor((hoursms)/(60*1000));
    minutesms=ms%(60*1000);
    seconds = Math.floor((minutesms)/1000);
    return getString(days, hours, minutes, seconds);
}

function getString(days, hours, minutes, seconds){
    var result = "";
    if (days != 0) {
       if (days == 1) {
           result += days + translations.day + " ";
       } else {
           result += days + translations.days + " ";
       }
    }
    if (hours != 0) {
        if (hours == 1) {
            result += hours + translations.hour + " ";
        } else {
            result += hours + translations.hours + " ";
        }
    }
    if (minutes != 0) {
        if (minutes == 1) {
            result += minutes + translations.minute + " ";
        } else {
            result += minutes + translations.minutes + " ";
        }
    }
    if (seconds != 0) {
        if (seconds == 1) {
            result += seconds + translations.second + " ";
        } else {
            result += seconds + translations.seconds + " ";
        }
    }
    return result;
}

function showGenericErrorMessage() {
    showErrorMessage(translations.internal_server_error);
}

function showErrorMessage(message) {
    noty({
        text: message,
        type: 'error',
        dismissQueue: true,
        timeout: 3000,
        layout: 'bottom'
    });
}

function showPermanentErrorMessageOnTop(message, divToPrependTo) {
    if (typeof divToPrependTo === 'undefined') {
        divToPrependTo = $(".main-body-container");
    }
    if (divToPrependTo.length == 0) {
        return;
    }
    if (divToPrependTo.find(".error-message-container-top").length == 0) {
        // error element is not present => prepend it
        divToPrependTo.prepend(
            "<div class='error-message-container-top'><label class='error-message'><i class='icon-error2'></i>" +
                message + "</label></div>");
    } else {
        // error element is present => change only the message
        divToPrependTo.find(".error-message").html("<i class='icon-error2'></i>" + message);
    }
}

function showSuccessMessage(message) {
    noty({
        text: message,
        type: 'success',
        dismissQueue: true,
        timeout: 3000,
        layout: 'bottom'
    });
}

function showInfoMessage(message) {
    noty({
        text: message,
        type: 'information',
        dismissQueue: true,
        timeout: 3000,
        layout: 'bottom'
    });
}

function getUrlParams() {
    var params = {};
    window.location.search.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(str,key,value){
        params[key] = value;
    });
    return params;
}

function getGameHtmlAttributes(game, isMobileDevice) {
    var thumbnailUrl = game.squareImageUrl;
    thumbnailUrl = config.denchApiUrl + "/api/v1/customerfacing" + thumbnailUrl;

    var description = "";
    var currentLang = getCurrentLang().toLowerCase();
    if (game.descriptionTranslations) {
        var defaultTranslation = "";
        for (var i = 0; i < game.descriptionTranslations.length; i++) {
            if (currentLang == game.descriptionTranslations[i].lang) {
                description = game.descriptionTranslations[i].description;
                break;
            } else if (game.descriptionTranslations[i].lang.toLowerCase() == "en") {
                defaultTranslation = game.descriptionTranslations[i].description;
            }
        }
        if ("" == description) {
            description = defaultTranslation;
        }
    }

    var result =
        'data-thumbnail-image="' + thumbnailUrl + '" ' +
        'data-game-id="' + game.id + '" ' +
        'data-game-name="' + game.gameName + '" ' +
        'data-game-description="' + description + '" ' +
        'data-demo-mode-enabled="' + game.demoModeEnabled + '"';
    return result;
}

function getGameHtml(game, isMobileDevice) {
    var result = '';
    if (isMobileDevice) {
        var imageUrl = game.squareImageUrl;
        imageUrl = config.denchApiUrl + "/api/v1/customerfacing" + imageUrl;
        result =
            '<a href="javascript:void(0);" class="game-link" ' + getGameHtmlAttributes(game) + '>' +
                getGameHotOrNewHtml(game) +
                '<img src="' + imageUrl + '" alt="" ' + 'class="game-image"/>' + game.gameName +
            '</a>';
    } else {
        var imageUrl = game.horizontalImageUrl;
        imageUrl = config.denchApiUrl + "/api/v1/customerfacing" + imageUrl;
        var isFavourite = window.favouriteGameIds.indexOf(game.id) > -1;
        result =
            '<div class="casino-single-game-container" data-game-id="' + game.id + '">' +
                '<img src="' + imageUrl + '" alt="" class="game-image"/>' +
                '<div class="game-name-container">' +
                    '<div class="favourite-container">' + getGameWebFavouriteHtml(game, isFavourite) + '</div>' +
                    '<span>' + game.gameName + '</span>' +
                '</div>' +
                '<div class="overlay">' +
                    getGameWebOverlayHtml(game);
                '</div>' +
            '</div>';
    }
    return result;
}

function getGameWebOverlayHtml(game) {
    var isLoggedIn = window.currentUser != null;
    var realPlayUrl = config.hostUrl + '/casino-game-play?gameId=' + game.id + '&real=true';
    var demoPlayUrl = config.hostUrl + '/casino-game-play?gameId=' + game.id + '&real=false';
    var result = '';
    if (isLoggedIn && game.realMoneyEnabled) {
        result +=
            '<a class="button" href="' + realPlayUrl + '">' + translations.playReal + '</a>';
    }
    if (game.demoModeEnabled) {
        result +=
            '<a class="button blue" href="' + demoPlayUrl + '">' + translations.playDemo + '</a>';
    }
    if (!isLoggedIn) {
        result +=
            '<a class="button" href="javascript:void(0);" data-modal-open="#login-modal">' +
                translations.login + '</a>' +
            '<a class="button green" href="javascript:void(0);" data-modal-open=".register-modal">' +
                translations.register + '</a>';
    }
    return result;
}

function getGameWebFavouriteHtml(game, isFavourite) {
    var isLoggedIn = window.currentUser != null;
    var result = '';
    if (isLoggedIn) {
        var favouriteIcon = '<i class="icon-favourites icon-favourites-active"></i>';
        var favouriteActiveClass = '';
        if (isFavourite) {
            favouriteIcon = '<i class="icon-favourites-active"></i>';
            favouriteActiveClass = 'favourites-active';
        }
        result +=
            '<a href="javascript:void(0);" data-game-id="' + game.id + '" class="toggle-favourite favourites ' +
            favouriteActiveClass + '">' + favouriteIcon + '</a>';
    }
    return result;
}

function getGameHotOrNewHtml(game) {
    var hotAndNewLabelDivs = "";
    if (game.hot == true) {
        hotAndNewLabelDivs += "<div><div class='hot'>" + translations.hotGame + "</div></div>"
    }
    if (game.new == true) {
        hotAndNewLabelDivs += "<div><div class='new'>" + translations.newGame + "</div></div>"
    }
    return hotAndNewLabelDivs;
}

function loadGameRealPlay(gameId) {
    var playUrl = config.hostUrl + '/casino-game-play?gameId=' + gameId + '&real=true';
    window.location = playUrl;
}

function showConfirmationModal(message, callback) {
    $(".confirmation-text").html(message);
    $("#confirmation-modal").show();

    $("#confirmation-no-button").off('click').click(function () {
        $("#confirmation-modal").hide();
    });

    $("#confirmation-yes-button").off('click').click(function () {
        $("#confirmation-modal").hide();
        callback();
    });
}

function handleSelfExcludedCustomer(error) {
    if (error.data == "PERMANENT") {
        if($(".login-error-message").length){
            $(".login-error-message").html(translations.user_selfexcluded_permanent);
            $(".login-error-message").show();
        } else {
            showErrorMessage(translations.user_selfexcluded_permanent)
        }
    } else {
        if($(".login-error-message").length){
            $(".login-error-message").html(translations.user_selfexcluded_until + error.data);
            $(".login-error-message").show();
        } else {
            showErrorMessage(translations.user_selfexcluded_until + error.data)
        }
    }
}

function isCustomerSelfExcluded(product) {
    if (window.currentUser != null && window.currentUser.selfExclusions != null) {
        for (var i = 0; i < window.currentUser.selfExclusions.length; i++) {
            selfExclusion = window.currentUser.selfExclusions[i];
            var currentDate = new Date().getTime();
            if((selfExclusion.startDate == null && selfExclusion.endDate == null) ||
                ((selfExclusion.startDate != null && selfExclusion.startDate < currentDate) && selfExclusion.endDate == null) ||
                ((selfExclusion.endDate != null && selfExclusion.endDate > currentDate) && selfExclusion.startDate == null) ||
                (selfExclusion.startDate < currentDate && selfExclusion.endDate > currentDate)) {
                if (selfExclusion.exclusionProduct == product) {
                    return true;
                }
            }
        }
    }
    return false;
}

function getCurrentLang() {
    if (window.currentUser != null && !isBlank(window.currentUser.lang)) {
        return window.currentUser.lang.toUpperCase();
    }
    var cookieLang = $.cookie('language');
    if (!isBlank(cookieLang)) {
        return cookieLang.toUpperCase();
    }
    return 'EN';
}

function setLang(lang) {
    $.cookie('language', lang.toLowerCase(), {
    	  path    : '/'
    });
}

if (typeof String.prototype.contains === 'undefined') {
    String.prototype.contains = function(it) {
        return this.indexOf(it) != -1;
    };
}

function initializeDateFields(dayElement, monthElement, yearElement, purpose) {
    var dayField = '<option value="">' + translations.dateOfBirth_day + '</option>';
    var monthField = '<option value="">' + translations.dateOfBirth_month + '</option>';
    var yearField = '<option value="">' + translations.dateOfBirth_year + '</option>';
    var currentYear = new Date().getFullYear();
    var year;
    var limit;
    switch(purpose) {
        case "BIRTH_DATE": year = 1900; limit = currentYear - 18;break;
        case "FUTURE_DATE": year = currentYear; limit = currentYear + 20;
        case "PAST_DATE" : year = currentYear - 20; limit = currentYear;
    }

    for (limit; year <= limit; limit--) {
        yearField += '<option value=' + limit + '>' + limit + '</option>';
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
    for (var i = 1; i < 32; i++) {
         dayField += '<option value=' + i + '>' + i + '</option>';
    }
    $(dayElement).html(dayField);
    $(monthElement).html(monthField);
    $(yearElement).html(yearField);
}

const SUBSCRIPTIONS = {
    GAMING : "GAMING",
    BALANCE_UPDATE : "BALANCE_UPDATE",
    CRITICAL_EVENT : "CRITICAL_EVENT"
}

function connectAndSubscribeForPushMessages(token) {
    var customerId = window.currentUser.id;
    diffusion.connect({
        host   : config.pushHostname,
        port   : config.pushPort,
        secure : false,
        principal : customerId,
        credentials : token
    }).then(function(session) {
        console.log('Connected to push server: ' + session.isConnected());

        var topicName = "private/" + window.currentUser.labelId + "/" + customerId + "/messages";

		  session.messages.addHandler(topicName, {
				onActive : function() {
					console.log('Push Handler registered');
				},
				onClose : function() {
					console.log('Push Handler closed');
				},
				onMessage : function(msg) {
					var message = JSON.parse(msg.content);
					console.log('Received message: ' + message.content);
					processSimpleMessage(message);
				}
			}).then(function() {
				console.log('Registered push handler');
			}, function(e) {
				console.log('Failed to register push handler: ', e);
			});

    });
}


/**
 * Subscribe for push messages of various types. Push message types are described in "SUBSCRIPTIONS" json above. If
 * you pass null or undefined, all subscriptions available will be used.
 */
function subscribeForPushMessages(subscriptions) {
    if (null != stompClient) {
        // we do not want more than 1 client per page
        return;
    }

    // if no subscriptions provided => subscribe 'em all
    var allSubscriptions = [];
    for (var key in SUBSCRIPTIONS) {
        if (SUBSCRIPTIONS.hasOwnProperty(key)) {
            allSubscriptions.push(SUBSCRIPTIONS[key]);
        }
    }
    if (typeof subscriptions === 'undefined' || null == subscriptions || 0 == subscriptions.length) {
        subscriptions = allSubscriptions;
    }

    $.ajax({
        url: config.denchApiUrl + "/api/v1/customerfacing/customers/websocket/token",
        type : "GET",
        headers : {
            "labelEntryPointCode" : config.labelCode
        },
        success : function(response) {
            var token = response.token;

            connectAndSubscribeForPushMessages(token);

            var socket = new SockJS(config.denchApiNotificationsUrl + '/customerfacing/websocket/connect?token=' + token,  {transports: ["xhr-streaming", "xhr-polling"]});
            stompClient = Stomp.over(socket);
            stompClient.connect({}, function(frame) {
                var functionToShowErrorMessage = showErrorMessage;
                // below code shows how to change the function that is executed for showing the error message
//                if (isSportsPage()) {
//                    functionToShowErrorMessage = showPermanentErrorMessageOnTop;
//                }
                if (subscriptions.indexOf(SUBSCRIPTIONS.GAMING) > -1 && (isSportsPage() || isCasinoPage())) {
                    stompClient.subscribe('/customerfacing/gaming/customer-' + token, function(data){
                        var message = JSON.parse(data.body);
                        var item = message.message;

                        if (item.notificationType == 'SELF_EXCLUSION') {
                            functionToShowErrorMessage(translations.gaming_error_selfexcluded);
                        } else if (item.notificationType == 'SESSION_LENGTH_EXCEEDED' ||
                                    item.notificationType == 'PERMANENT_SE_BY_CUSTOMER' ||
                                    item.notificationType == 'PERMANENT_SE_BY_OPERATOR') {
                            if (typeof handleLogout === 'function') {
                                handleLogout();
                            }
                            $("#login-modal #login_process_message").html(getErrorMessagePerSessionBreakEvent(item.notificationType)).show();
                            openModal($("#login-modal"));
                        } else if (item.notificationType == 'RESPONSIBLE_GAMING_ERROR') {
                            if (item.responsibleGamingType == 'PLACE_BET') {
                                if (item.responsibleGamingPeriod == 'DAILY') {
                                    functionToShowErrorMessage(translations.gaming_error_responsiblegaming_daily_placebet);
                                } else if (item.responsibleGamingPeriod == 'WEEKLY') {
                                    functionToShowErrorMessage(translations.gaming_error_responsiblegaming_weekly_placebet);
                                } else if (item.responsibleGamingPeriod == 'MONTHLY') {
                                    functionToShowErrorMessage(translations.gaming_error_responsiblegaming_monthly_placebet);
                                }
                            } else if (item.responsibleGamingType == 'LOSS') {
                                if (item.responsibleGamingPeriod == 'DAILY') {
                                    functionToShowErrorMessage(translations.gaming_error_responsiblegaming_daily_loss);
                                } else if (item.responsibleGamingPeriod == 'WEEKLY') {
                                    functionToShowErrorMessage(translations.gaming_error_responsiblegaming_weekly_loss);
                                } else if (item.responsibleGamingPeriod == 'MONTHLY') {
                                    functionToShowErrorMessage(translations.gaming_error_responsiblegaming_monthly_loss);
                                }
                            }
                        } else if (item.notificationType == 'REAL_MONEY_DISABLED') {
                            functionToShowErrorMessage(translations.errorRealMoneyModeNotSupported);
                        } else if (item.notificationType == 'GAME_EXCLUDED') {
                            functionToShowErrorMessage(translations.errorGameExcluded);
                        }
                    });
                }
                if (subscriptions.indexOf(SUBSCRIPTIONS.BALANCE_UPDATE) > -1) {
                    stompClient.subscribe('/customerfacing/balanceUpdate/customer-' + token, function(data){
                        var message = JSON.parse(data.body);
                        var item = message.message;

                        var newBalance = item.newBalance;
                        window.currentUser.realMoneyAccount.cashBalance = newBalance;
                        $(".customerBalance").html((newBalance/100).toFixed(2) + "<span> " +
                                                    window.currentUser.currency + "</span>");
                    });
                }
                if (subscriptions.indexOf(SUBSCRIPTIONS.CRITICAL_EVENT) > -1) {
                    stompClient.subscribe('/customerfacing/criticalEvents/customer-' + token, function(data){
                        var message = JSON.parse(data.body);
                        var item = message.message;

                        if (item.type == 'SESSION_LENGTH_EXCEEDED' ||
                                item.type == 'PERMANENT_SE_BY_CUSTOMER' ||
                                item.type == 'PERMANENT_SE_BY_OPERATOR') {
                            if (typeof handleLogout === 'function') {
                                handleLogout();
                            }
                            $("#login-modal #login_process_message").html(getErrorMessagePerSessionBreakEvent(item.type)).show();
                            openModal($("#login-modal"));
                       }
                    })
                }
            });
        },
        error: function(xhr, textStatus, errorThrown) {
           showGenericErrorMessage();
        }
    });
}

function isSportsPage() {
    return window.location.pathname.indexOf("/sport-betting") >= 0;
}

function isCasinoPage() {
    return window.location.pathname.indexOf("/casino-") >= 0;
}

function disconnectFromPushMessages() {
    if (null != stompClient) {
        stompClient.disconnect();
        stompClient = null;
    }
}

function handleResponsibleGamingError(error) {
    var errorMessage = translations.error_exceeded_responsible_gaming_limit;
    switch (error.responsibleGamingType) {
        case 'DEPOSIT' : errorMessage += " " + (translations.error_responsiblegaming_on_deposit).toLowerCase(); break;
        case 'WITHDRAW' : errorMessage += " " + (translations.error_responsiblegaming_on_withdraw).toLowerCase(); break;
        case 'PLACE_BET' : errorMessage += " " + (translations.error_responsiblegaming_on_placebets).toLowerCase(); break;
        case 'LOSS' : errorMessage += " " + (translations.error_responsiblegaming_on_loss).toLowerCase(); break;
        default:break;
    }
    switch (error.responsibleGamingPeriod) {
        case 'ONCE' : errorMessage += ". (" + (translations.error_responsiblegaming_once).toLowerCase() + ")"; break;
        case 'DAILY' : errorMessage += ". (" + (translations.error_responsiblegaming_daily).toLowerCase() + ")"; break;
        case 'WEEKLY' : errorMessage += ". (" + (translations.error_responsiblegaming_weekly).toLowerCase() + ")"; break;
        case 'MONTHLY' : errorMessage += ". (" + (translations.error_responsiblegaming_monthly).toLowerCase() + ")"; break;
        default:break;
    }
    return errorMessage;
}

function getGameDescription(game) {
    var result = "";
    if (typeof game.gameDescriptionTranslations !== 'undefined' && null != game.gameDescriptionTranslations) {
        var currentLang = getCurrentLang().toLowerCase();
        var defaultTranslation = "";
        for (var j = 0; j < game.gameDescriptionTranslations.length; j++) {
            var translation = game.gameDescriptionTranslations[j];
            if (currentLang == translation.lang.toLowerCase()) {
                result = translation.description;
                break;
            } else if (translation.lang.toLowerCase() == "en") {
                defaultTranslation = translation.description;
            }
        }
        if ("" == result) {
            result = defaultTranslation;
        }
    }
    return result;
}

function getGameCategoryName(category) {
    var result = "";
    if (typeof category.gameCategoryNameTranslations !== 'undefined' && null != category.gameCategoryNameTranslations) {
        var currentLang = getCurrentLang().toLowerCase();
        var defaultTranslation = "";
        for (var j = 0; j < category.gameCategoryNameTranslations.length; j++) {
            var translation = category.gameCategoryNameTranslations[j];
            if (currentLang == translation.lang.toLowerCase()) {
                result = translation.name;
                break;
            } else if (translation.lang.toLowerCase() == "en") {
                defaultTranslation = translation.name;
            }
        }
        if ("" == result) {
            result = defaultTranslation;
        }
    }
    return result;
}

if (typeof String.prototype.endsWith !== 'function') {
    String.prototype.endsWith = function(suffix) {
        return this.indexOf(suffix, this.length - suffix.length) !== -1;
    };
}

function sortByGameNameAsc(a, b){
  var aName = a.gameName.toLowerCase();
  var bName = b.gameName.toLowerCase();
  return ((aName < bName) ? -1 : ((aName > bName) ? 1 : 0));
}

function sortByGameNameDesc(a, b){
  var aName = a.gameName.toLowerCase();
  var bName = b.gameName.toLowerCase();
  return ((aName < bName) ? 1 : ((aName > bName) ? -1 : 0));
}

function doReloadFavouritesAndLastPlayedGamesFromServer(callback, isMobileDevice) {
    $.ajax({
        type : 'GET',
        url : config.denchApiUrl + "/api/v1/customerfacing/gaming/games/favouriteAndLastPlayed?mobile=" + isMobileDevice,
        headers : {
           "labelEntryPointCode" : config.labelCode
        },
        success : function(response) {
            callback(response);
        },
        complete : function() {
            $("#loadingImage").remove();
        }
    });
}

function isBlank (str) {
    return (!str || /^\s*$/.test(str));
}

$.fn.serializeObject = function() {
    var o = {};
    var a = this.serializeArray();
    $.each(a, function() {
        if (o[this.name] !== undefined) {
            if (!o[this.name].push) {
                o[this.name] = [o[this.name]];
            }
            o[this.name].push(this.value || null);
        } else {
            o[this.name] = this.value || null;
        }
    });
    return o;
};

function populateCountryPhoneCodes(element) {
    var html = element.html();
    $.each(countryPhoneCodes, function (k, v) {
        html += "<option value='" + v + "'>+" + v + "</option>";
    })
    element.html(html);
}

function getSupportRegisterCurrencies(element) {
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

              $(element).html(html);
          }
    });
}
function getSupportRegisterCountries(element) {
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

              $(element).html(html);
          }
    });
}

function getErrorMessagePerSessionBreakEvent(notificationType) {
    var result = '';
    switch (notificationType) {
        case 'SESSION_LENGTH_EXCEEDED' : result = translations.session_expired_error; break;
        case 'PERMANENT_SE_BY_CUSTOMER' : result = translations.customer_selfexcluded_by_customer; break;
        case 'PERMANENT_SE_BY_OPERATOR' : result = translations.customer_selfexcluded_by_operator; break;
    }
    return result;
}