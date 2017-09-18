$(function() {
    window.openProfilePage = false;

    var isMobileDevice = isMobile();

    $.ajax({
        method: "GET",
        headers : {
            "labelEntryPointCode" : config.labelCode
        },
        contentType : "application/json",
        url: config.denchApiUrl + "/api/v1/customerfacing/config/general",
        dataType: "json",
        success: function (data) {
            if (data.standardRegistrationEnabled == "true" ||
                (data.standardRegistrationEnabled == "true" && data.anonymousRegistrationEnabled == "true")) {
                window.registrationType = "STANDARD";
                if(!isMobileDevice) {
                    $(".register-modal-link").attr("data-modal-open", ".standard-register-modal");
                } else {
                     $(".register-modal-link").attr("href", config.hostUrl + "/register");
                }
            } else if ((data.standardRegistrationEnabled == "false" && data.anonymousRegistrationEnabled == "false") ||
                        (null == data.standardRegistrationEnabled && null == data.anonymousRegistrationEnabled)) {
                 $(".register-modal-link").hide();
            } else {
                window.registrationType = "ANONYMOUS";
                if(!isMobileDevice) {
                     $(".register-modal-link").attr("data-modal-open", ".quick-register-modal");
                } else {
                     $(".register-modal-link").attr("href", config.hostUrl + "/quick-register");
                }
            }
        }
    });

    $('#profile-menu-button').click(function(e) {
        e.preventDefault();
        handleProfileButtonClick();
    });

    $('#depositButton').click(function(e) {
        e.preventDefault();
        var previousPageUrl = window.location.href;
        $.cookie('returnPage', previousPageUrl);
        window.location = $(this).attr('href');
    });

    $("#logoutButton").click(function() {
        $.ajax({
              method: "POST",
              url: config.denchApiUrl + "/api/v1/customerfacing/logout",
              success: function (data) {
                  handleLogout();
              }
        });
    });

    $("#loginButton").click(function() {
        $("#process_message").html();

        var data = {
            username : $("#username").val(),
            password : $("#password").val(),
            rememberme : $("#rememberme").is(':checked'),
        };

        $.ajax({
            method: "POST",
            headers : {
                "labelEntryPointCode" : config.labelCode
            },
            url: config.denchApiUrl + "/api/v1/customerfacing/login?username=" + data.username + "&password=" +
                data.password + "&remember-me=" + data.rememberme,
            success: function () {
                handleProfileButton();
                closeModal($("#login-modal"));
                $('#username').val('');
                $('#password').val('');
            }
        });
    });

    $(document).keyup(function (e) {
     var key = e.which;
     if($("#login-modal").hasClass('modal-show') && key == 13)
      {
        $('#loginButton').click();
        return false;
      }
    });
	
//	$("#profile-menu-button").click( function() {
//		$(".error-message").hide();
//	});
	
	$(document).mouseup(function (e) {
		var container = $(".my-menu");
		var parent = $(e.target).parent();
		var isProfileMenuButton = e.target.nodeName === "I" && parent.length && parent.attr("id") == "profile-menu-button";
		if (!container.is(e.target) && container.has(e.target).length === 0 && !isProfileMenuButton) {
			closeWebProfileMenu();
            showNextSimpleMessage();
		}
	});

	if (!isMobileDevice) {
	    var languageIndicatorElement = $(".change-lang");
	    var currentLang = getCurrentLang();
        $.each(languages, function(index, lang) {
//            if($.inArray(lang.code, supportedLanguages) > 0) {
//                supportedLanguagesContainerHtml += " <li><span class='flags " + lang.country.toLowerCase() +
//                                                        "'></span><a class='change-language-button' data-lang='" + lang.code +
//                                                            "' href='javascript:void(0);'>" + lang.localName + "</a></li>"
//            }
            if (lang.code.toUpperCase() == config.selectedLocale.toUpperCase()) {
                languageIndicatorElement.html('<i class="flags ' + lang.country.toLowerCase() + '"></i>' + lang.code.toUpperCase());
            }
        })
//	     else if ('DE' == currentLang) {
//	        languageIndicatorElement.html('<i class="flags germany"></i>de');
//	    } else if ('ES' == currentLang) {
//	        languageIndicatorElement.html('<i class="flags spain"></i>es');
//        } else if ('IT' == currentLang) {
//	        languageIndicatorElement.html('<i class="flags italy"></i>it');
//        } else if ('FR' == currentLang) {
//	        languageIndicatorElement.html('<i class="flags france"></i>fr');
//        } else if ('NL' == currentLang) {
//	        languageIndicatorElement.html('<i class="flags netherlands"></i>nl');
//        }

	    $("#pd-my-profile").click(function () {
	        var myProfileTab = $(".profile-details-modal").find(".tabs-menu.main-tabs-bar");
	        $(myProfileTab[0]).find(".my-profile-details").click();
	        $("#my-profile-details").find(".personal-details").click();
	        openModal($(".profile-details-modal"));
	    });
	    $("#pd-change-password").click(function () {
            var myProfileTab = $(".profile-details-modal").find(".tabs-menu.main-tabs-bar");
            $(myProfileTab[0]).find(".my-profile-details").click();
            $("#my-profile-details").find(".change-password-details").click();
            openModal($(".profile-details-modal"));
        });
		$("#pd-deposit").click(function () {
            var myProfileTab = $(".profile-details-modal").find(".tabs-menu.main-tabs-bar");
            $(myProfileTab[0]).find(".deposit-details").click();
            openModal($(".profile-details-modal"));
         });
		 $("#pd-deposit-menu").click(function () {
            var myProfileTab = $(".profile-details-modal").find(".tabs-menu.main-tabs-bar");
            $(myProfileTab[0]).find(".deposit-details").click();
            openModal($(".profile-details-modal"));
         });
         $("#pd-withdraw").click(function () {
            var myProfileTab = $(".profile-details-modal").find(".tabs-menu.main-tabs-bar");
            $(myProfileTab[0]).find(".withdraw-details").click();
            openModal($(".profile-details-modal"));
         });
		 $("#pd-kyc").click(function () {
            var myProfileTab = $(".profile-details-modal").find(".tabs-menu.main-tabs-bar");
            $(myProfileTab[0]).find(".kyc-details").click();
            openModal($(".profile-details-modal"));
         });
		  $("#pd-history").click(function () {
            var myProfileTab = $(".profile-details-modal").find(".tabs-menu.main-tabs-bar");
            $(myProfileTab[0]).find(".history-details").click();
            openModal($(".profile-details-modal"));
         });
		 $("#pd-buddy-transfer").click(function () {
            var myProfileTab = $(".profile-details-modal").find(".tabs-menu.main-tabs-bar");
            $(myProfileTab[0]).find(".buddy-transfers-details").click();
            openModal($(".profile-details-modal"));
         });
         $("#pd-account-transfer").click(function () {
            var myProfileTab = $(".profile-details-modal").find(".tabs-menu.main-tabs-bar");
            $(myProfileTab[0]).find(".account-transfers-details").click();
            openModal($(".profile-details-modal"));
         });
		 $("#pd-settings").click(function () {
            var myProfileTab = $(".profile-details-modal").find(".tabs-menu.main-tabs-bar");
            $(myProfileTab[0]).find(".settings-details").click();
            openModal($(".profile-details-modal"));
         });
		 $("#pd-messages").click(function () {
            var myProfileTab = $(".profile-details-modal").find(".tabs-menu.main-tabs-bar");
            $(myProfileTab[0]).find(".messages-details").click();
            openModal($(".profile-details-modal"));
         });
		 $("#pd-messages-menu").click(function () {
            var myProfileTab = $(".profile-details-modal").find(".tabs-menu.main-tabs-bar");
            $(myProfileTab[0]).find(".messages-details").click();
            openModal($(".profile-details-modal"));
         });
		 $("#loginLink").click( function() {
			$(".login-error-message").hide();
		});
		$("#forgot-pass-link").click( function() {
			$(".error").html('');
			$('#forgot-password-email').val('');
		});
		$("#refresh-balance").click(function () {
            getBalance();
         });
	}

    handleProfileButton();

    loadAndApplyGeneralConfig();

	function handleProfileButton() {
        handleCurrentUser(function(currentUser) {
            if (window.onCurrentUserChange.length > 0) {
               $.each(window.onCurrentUserChange, function (index, func) {
                    func(currentUser);
               });
            }
            if (null == currentUser) {
                window.openProfilePage = false;
                $("#forgot_password").show();
                $(".login-section").show();
                $(".logged-info").hide();
                disconnectFromPushMessages();
            } else {
                window.openProfilePage = true;
                $(".login-section").hide();
                $(".logged-info").show();
                $("#forgot_password").hide();
                checkCustomerSelfExclusions();
                $("#current_user_details").html(translations.login_user_greeting + " " + currentUser.username);
                getBalance();
                subscribeForPushMessages();

                if (window.location.pathname.indexOf("/kyc") >= 0) {
                    $("#pd-kyc").trigger('click');
                } else if (window.location.pathname.indexOf("/my-profile") >= 0) {
                    $("#pd-my-profile").trigger('click');
                }
            }

            if ((window.location.pathname.contains("profile-menu") && window.openProfilePage) ||
                (window.location.pathname.contains("login") && !window.openProfilePage)) {
                handleProfileButtonClick();
            }
        });
    }
});

function loadAndApplyGeneralConfig() {
    $.ajax({
        url: config.denchApiUrl + "/api/v1/customerfacing/config/general",
        type : "GET",
         headers : {
            "labelEntryPointCode" : config.labelCode
         },
         success : function(response) {
             if (response.accountTransferEnabled == "true"){
                $(".accountTransferLink").show();
                $("#web-tab-account-transfer").show();
                $("#pd-account-transfer").show();
             } else {
                $(".accountTransferLink").hide();
                $("#web-tab-account-transfer").hide();
                $("#pd-account-transfer").hide();
             }

             if (response.buddyTransferEnabled == "true") {
                $(".buddyTransferLink").show();
                $("#web-tab-buddy-transfer").show();
                $("#pd-buddy-transfer").show();
             } else {
                $(".buddyTransferLink").hide();
                $("#web-tab-buddy-transfer").hide();
                $("#pd-buddy-transfer").hide();
             }

             if (response.sportsbookEnabled != "true") {
                $(".sportsLink").hide();
                $(".sportsLiveLink").hide();
                $(".virtualsLink").hide();
             } else {
                $(".sportsLink").show();
                $(".sportsLiveLink").show();
                $(".virtualsLink").show();
             }
         }
    });
}

function handleProfileButtonClick() {
    if (window.openProfilePage) {
        if (isMobile()) {
            openModal($("#profile-menu-modal"));
        } else {
            if (isWebProfileMenuOpen()) {
                closeWebProfileMenu();
            } else {
                openWebProfileMenu();
            }
        }
    } else {
        openModal($("#login-modal"));
    }
}

function checkCustomerSelfExclusions () {
    if (isCustomerSelfExcluded('CASINO')) {
        $("#casinoGamesMenuLink").hide();
        $("#casinoGamesHomeLink").hide();
        $("#casinoGamesHomeIconLink").hide();
    }
    if (isCustomerSelfExcluded('SPORT')) {
        $("#sportBettingMenuLink").hide();
        $("#sportBettingHomeLink").hide();
        $("#sportBettingHomeIconLink").hide();
    }
}

function handleLogout() {
    window.openProfilePage = false;
    $("#forgot_password").show();
    if (isMobile()) {
        closeModal($("#profile-menu-modal"));
    } else {
        closeWebProfileMenu();
        closeModal($(".profile-details-modal"));
        $(".login-section").show();
        $(".logged-info").hide();
    }

    window.currentUser = null;
    if (window.onCurrentUserChange.length > 0) {
       $.each(window.onCurrentUserChange, function (index, func) {
            func(currentUser);
       });
    }
    disconnectFromPushMessages();
}

function openWebProfileMenu() {
    if (!$(".my-menu").hasClass("show")) {
        $(".my-menu").addClass("show");
        $('body').append('<div class="profile-menu-overlay"></div>');
    }
}

function closeWebProfileMenu() {
    $(".my-menu").removeClass("show");
    $('.profile-menu-overlay').remove();
}

function isWebProfileMenuOpen() {
    return $(".my-menu").hasClass("show");
}

function getBalance(){
	$.ajax({
			url: config.denchApiUrl + "/api/v1/customerfacing/customers/balances",
			type : "GET",
			 headers : {
				"labelEntryPointCode" : config.labelCode
			 },
			 success : function(response) {
				 $("#customerBalance").html((response.totalBalance/100).toFixed(2) + "<span> " +
					response.currency + "</span>");
				 $("#customerBalanceMenu").html((response.totalBalance/100).toFixed(2) + "<span> " +
					response.currency + "</span>");						 
			 }					
		});
}