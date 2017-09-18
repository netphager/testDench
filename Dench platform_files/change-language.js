$(function () {
    var isMobileDevice = isMobile();
    if (isMobileDevice) {
	    $(".change-language").addClass("modal-show");
	}

    $.ajax({
        method: "GET",
        headers : {
            "labelEntryPointCode" : config.labelCode
        },
        contentType : "application/json",
        url: config.denchApiUrl + "/api/v1/customerfacing/config/general",
        dataType: "json",
        success: function (data) {
            var supportedLanguages = data.supportedLanguages.split(',');
            var supportedLanguagesContainerHtml = ""
            //This object comes from languagesFactory.ftl
            $.each(languages, function(index, lang) {
                if($.inArray(lang.code, supportedLanguages) >= 0) {
                    supportedLanguagesContainerHtml += " <li><span class='flags " + lang.country.toLowerCase() +
                                                            "'></span><a class='change-language-button' data-lang='" + lang.code +
                                                                "' href='javascript:void(0);'>" + lang.localName + "</a></li>"
                }
            })
            $('#language-list-container').html(supportedLanguagesContainerHtml);
        }
    });

    $("body").on('click', '.change-language-button', function() {
        var newLang = $(this).data('lang');
        if (getCurrentLang().toUpperCase() == newLang.toUpperCase()) {
            return;
        }
        if (null != window.currentUser) {
            window.currentUser.lang = newLang;
            $.ajax({
                method: "POST",
                headers : {
                    "labelEntryPointCode" : config.labelCode
                },
                contentType : "application/json",
                url: config.denchApiUrl + "/api/v1/customerfacing/customers/update",
                data: JSON.stringify(window.currentUser),
                dataType: "json",
                complete: function () {
                    setLang(newLang);
                    window.location.href = config.homeUrl + "/" + newLang;
                }
            });
        } else {
            setLang(newLang);
            window.location.href = config.homeUrl + "/" + newLang;
        }
    })
});