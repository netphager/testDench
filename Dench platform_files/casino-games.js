$(function() {
    var DEFAULT_GAMES_COUNT_INITIALLY = 12;

    var timer = 0;

    var isMobileDevice = isMobile();

    // below 2 variables will hold current search (on web version)
    var currentSearch = {};

    // below variables will be used for 'Show All' functionality
    var currentResult = {};
    currentResult.games = [];
    currentResult.casinoGameCount = 0;

    // init favourite game IDs - we will reload them on login/logout
    window.favouriteGameIds = [];


    window.onCurrentUserChange.push(function(currentUser) {
        if (null != currentUser && isCustomerSelfExcluded('CASINO')) {
            // hide entire page & show error
            $("#casinoHome").hide();
            $("#selfExclusionErrorMessage").show();
        } else {
            $("#casinoHome").show();
            $("#selfExclusionErrorMessage").hide();
            if (null == currentUser) {
                $("#lastPlayedTab").hide();
                $("#favouritesTab").hide();
                if (!isMobileDevice) {
                    if (currentSearch.type == 'favourite' || currentSearch.type == 'lastPlayed') {
                        $(".casino-tab-all").trigger('click');
                    } else {
                        reloadOverlayButtons();
                    }
                    reloadFavouriteButtons();
                }
            } else {
                if (!isMobileDevice) {
                    $("#lastPlayedTab").show();
                    $("#favouritesTab").show();
                    reloadOverlayButtons();
                    reloadFavouriteButtons();
                } else {
                    reloadFavouriteOrLastPlayedGames();
                }
            }
        }
    });

    initSlider(isMobileDevice);

    $('body').on('click', '.casino-tab', function(e, params) {
        var el = $(this);
        if (el.hasClass('active')) {
            return;
        } else {
            $(window).scroll().off();
        }

        $(".casino-tab").removeClass("active");
        el.addClass("active");

        // check data-search-type & do the following:
        // if == 'game', search for game
        // if == 'category' - get category
        // if == 'favourite' or 'lastPlayed' - reload favourite & last played games
        // after data is loaded - replace game container
        var searchType = el.data("search-type");
        var searchValue = el.data("search-value");

        currentSearch.type = searchType;
        currentSearch.name = el.text();
        currentSearch.value = searchValue;

        if (currentSearch.type == "game" || currentSearch.type == "category") {
            currentSearch.value = getInitialWebSearch();
            if (currentSearch.type == "category") {
               currentSearch.value.columnSearches = [ {'key' : 'gameCategoryId', 'operation' : 'eq', 'value' : searchValue } ];
            } else  if (typeof searchValue !== 'undefined' && searchValue) {
                currentSearch.value.columnSearches.push(searchValue);
            }
        }

        if (typeof params !== 'undefined' && typeof params.preserveSorting !== 'undefined' && params.preserveSorting) {
            addSortingToCurrentSearch();
        } else {
            resetSorting();
        }
        reloadCurrentSearch();
    });

//    $('body').on('click', '.show-all', function() {
//        // show all games from current category/search
//        var html = '';
//        var shownAll = currentResult.casinoGameCount >= currentResult.games.length;
//        if (!shownAll) {
//            for (var i = currentResult.casinoGameCount; i < currentResult.games.length; i++) {
//                var game = currentResult.games[i];
//                html += '<li>' + getGameHtml(game, isMobileDevice) + '</li>';
//            }
//            currentResult.casinoGameCount = currentResult.games.length;
//            $(".show-all").hide();
//        }
//        $(".games-list").append(html);
//    });

    $('.sort-alphabetically').click(function() {
        var el = $(this);
        if (!el.hasClass("active")) {
            el.addClass("active");
        }
        var oldSortAsc = el.attr("sort-asc") == 'true';
        var newSortAsc = !oldSortAsc;
        el.attr("sort-asc", newSortAsc);

        addSortingToCurrentSearch();

        reorderCurrentGames();

        if (newSortAsc) {
            el.find('i').removeClass("icon-alphabet-reverse").addClass("icon-alphabet");
        } else {
            el.find('i').removeClass("icon-alphabet").addClass("icon-alphabet-reverse");
        }
    });

    $(".game-search").keyup(function(e) {
        var search = $(this).val();
        if ('' == search) {
            $(".casino-tab-all").trigger('click', {preserveSorting : true});
        } else {
			delay(function() {
			    currentSearch.value = getInitialWebSearch();
                currentSearch.value.globalSearch = search;

                addSortingToCurrentSearch();
                currentSearch.name = "'" + search + "'";
                currentSearch.type = 'game';

                reloadCurrentSearch();

                $(".casino-tab").removeClass("active");
			}, 500);
        }
    });

    $('body').on('click', '.toggle-favourite', function() {
        var el = $(this);
        var gameId = el.data('game-id');
        var favouriteIdIndex = window.favouriteGameIds.indexOf(gameId);
        // the new value is the toggled value
        var newFavouriteValue = !(favouriteIdIndex > -1);
        $.ajax({
            type : 'POST',
            url : config.denchApiUrl + "/api/v1/customerfacing/customers/gaming/games/" + gameId +
                "/favourite?isFavourite=" + newFavouriteValue,
            headers : {
                "labelEntryPointCode" : config.labelCode
            },
            success : function() {
                if (newFavouriteValue) {
                    window.favouriteGameIds.push(gameId);
                } else {
                    window.favouriteGameIds.splice(favouriteIdIndex, 1);
                }
                if (currentSearch.type == 'favourite') {
                    // since we are in 'favourites' view - this means we should remove the game from the view
                    el.closest('li').remove();
                    if (0 == window.favouriteGameIds.length) {
                        $(".casino-category-name").remove();
                    } else {
                        $('.games-count').html(window.favouriteGameIds.length);
                    }
                } else {
                    var game = {'id' : gameId};
                    var newHtml = getGameWebFavouriteHtml(game, isGameFavourite(game));
                    el.closest('.favourite-container').html(newHtml);
                }
            }
        });
    });

    if (isMobileDevice) {
        loadFeaturedGamesForMobile();
        loadGameCategoriesForMobile();
        reloadFavouriteOrLastPlayedGames();
    } else {
        loadInitialTab();
        loadGameCategoriesForWeb();
    }

    function reloadOverlayButtons() {
        for (var i = 0; i < currentResult.casinoGameCount && i < currentResult.games.length; i++) {
            var game = currentResult.games[i];
            var newOverlayHtml = getGameWebOverlayHtml(game);
            $(".casino-single-game-container[data-game-id='" + game.id + "'] .overlay").html(newOverlayHtml);
        }
    }

    function reloadFavouriteButtons() {
        if (null == window.currentUser) {
            // this one is easy - remove all favourite toggle buttons (all stars)
            $(".toggle-favourite").remove();
            window.favouriteGameIds = [];
        } else {
            doReloadFavouritesAndLastPlayedGamesFromServer(function(response) {
                var favouriteGames = response.favouriteGames;
                var favouriteIds = [];
                for (var i = 0; i < favouriteGames.length; i++) {
                    favouriteIds.push(favouriteGames[i].game.id);
                }
                window.favouriteGameIds = favouriteIds;

                for (var i = 0; i < currentResult.casinoGameCount && i < currentResult.games.length; i++) {
                    var game = currentResult.games[i];
                    var newFavouriteHtml = getGameWebFavouriteHtml(game, isGameFavourite(game));
                    $(".casino-single-game-container[data-game-id='" + game.id + "'] .favourite-container").html(newFavouriteHtml);
                }
            }, isMobileDevice);
        }
    }

    function reorderCurrentGames() {
        var sortAsc = $(".sort-alphabetically").attr("sort-asc") == 'true';
        var sortFunction = sortByGameNameAsc;
        if (!sortAsc) {
            sortFunction = sortByGameNameDesc;
        }
        currentResult.games.sort(sortFunction);
        updateGameListContainer(currentResult);
    }

    function addSortingToCurrentSearch() {
        var sortElement = $(".sort-alphabetically");
        var sortActive = sortElement.hasClass("active");
        if (sortActive) {
            var sortAsc = sortElement.attr("sort-asc") == 'true';
            var objectToAppendSortTo = currentSearch;
            if (currentSearch.type == 'game') {
                objectToAppendSortTo = currentSearch.value;
            }
            objectToAppendSortTo.sortBy = "gameName";
            objectToAppendSortTo.sortAsc = sortAsc;
        }
    }

    function resetSorting() {
        $(".sort-alphabetically").removeClass("active").attr('sort-asc', 'false')
            .find('i').removeClass('icon-alphabet-reverse').addClass('icon-alphabet');
    }

    function reloadCurrentSearch() {
        $(".game-list-container").html('<div id="loadingImage" class="loading-bg"><img src="' + config.assetsUrl +
            '/images/loading.gif" class="inline-loading-image"></div>');
        if (currentSearch.type == "game" || currentSearch.type == "category") {
            reloadCurrentGameSearch();
        } else if (currentSearch.type == "lastPlayed" || currentSearch.type == "favourite") {
            reloadFavouriteOrLastPlayedGames();
        }

//         else if () {
//                    reloadGameCategoryForWeb(currentSearch.value);
//                }
    }

    function reloadCurrentGameSearch() {
        var data;
        if (currentSearch.type == "game") {
            data = JSON.stringify(currentSearch.value)
        } else if (currentSearch.type == "category") {
            data = JSON.stringify(currentSearch)
        }
        $.ajax({
            type : 'POST',
            url : config.denchApiUrl + "/api/v1/customerfacing/gaming/games/search?mobile=" + isMobileDevice,
            headers : {
                "labelEntryPointCode" : config.labelCode
            },
            contentType : 'application/json; charset=utf-8',
            data: JSON.stringify(currentSearch.value),
            dataType: "json",
            success : function(response) {
                var games = response.content;
                // imitate a category to reuse the logic for updating game list container
                currentResult = {};
                currentResult.casinoGameCount = currentSearch.value.pageStart + games.length;
                currentResult.games = games;
                currentResult.name = currentSearch.name;
                updateGameListContainer(currentResult);

                if (games.length == 48) {
                     initializeScrollLoadEvent()
                     $(".footer").hide();
                } else {
                    $(window).scroll().off();
                    $(".footer").show();
                }
            },
            complete : function() {
                $("#loadingImage").remove();
                $(".load-more-games").hide();
            }
        });
    }

    function updateGameListContainer(category) {
        var html = "";
        if (category.games && category.games.length > 0) {
            var categoryName = category.name;
//            var gameCount = category.games.length;
            html = '<ul class="games-list">';
            for (var i = 0; i < category.casinoGameCount && i < category.games.length; i++) {
                var game = category.games[i];
                html += '<li>' + getGameHtml(game, isMobileDevice) + '</li>';
            }
            html += '</ul>';

//            var categoryInfoHtml = '<h1>' + categoryName + ' </h1>' +
//                    '<span>(<div class="games-count">' + currentResult.casinoGameCount + '</div> ' + translations.games + ')</span>';

        }
        $(".game-list-container").append(html);
//        $(".casino-category-name").html(categoryInfoHtml);
    }

    function getInitialWebSearch() {
        var search = {};
        search.pageStart = 0;
        search.pageSize = 48;
        search.columnSearches = [{'key' : 'supportsDesktop', 'operation' : 'eq', 'value' : true }];
        return search;
    }

    function loadInitialTab() {
        var tab = 'casino-tab-featured';
        var pathname = window.location.pathname;
        if (pathname.endsWith('/hot')) {
            tab = 'casino-tab-hot';
        } else if (pathname.endsWith('/new')) {
            tab = 'casino-tab-new';
        } else if (pathname.endsWith('/featured')) {
            tab = 'casino-tab-featured';
        } else if (pathname.endsWith('/casino-live')) {
            tab = 'casino-tab-live';
        }
        $("." + tab).trigger('click');
    }

    function initSlider(isMobileDevice) {
        var dots = !isMobileDevice;
        $('.banner-slider').slick({
            dots : dots,
            infinite: true,
            speed: 500,
            slidesToShow: 1,
            slidesToScroll: 1,
            autoplay: true,
            autoplaySpeed: 5000,
            arrows: false
        });
    }

    function getCategoryNewGamesHtml(hasNew) {
        if (hasNew) {
            return '<span class="new-games">' + translations.newGames + '</span>';
        } else {
            return "";
        }
    }

    function reloadFavouriteOrLastPlayedGames() {
        if (isMobileDevice) {
            reloadFavouriteOrLastPlayedGamesForMobile();
        } else {
            reloadFavouriteOrLastPlayedGamesForWeb();
        }
    }

    function reloadFavouriteOrLastPlayedGamesForWeb() {
        if (null == window.currentUser) {
            $(".game-list-container").html('');
            return;
        }

        doReloadFavouritesAndLastPlayedGamesFromServer(function(response) {
            var loadFavouriteGames = currentSearch.type == 'favourite';
            var games = response.lastPlayedGames;
            if (loadFavouriteGames) {
                games = response.favouriteGames;
            }
            for (var i = 0; i < games.length; i++) {
                games[i] = games[i].game;
            }
            var totalGameCount = games.length;
            // imitate a category to reuse the logic for updating game list container
            currentResult = {};
            currentResult.casinoGameCount = totalGameCount;
            currentResult.games = games;
            currentResult.name = currentSearch.name;

            updateGameListContainer(currentResult);
        }, isMobileDevice);
    }

    function reloadFavouriteOrLastPlayedGamesForMobile() {
        $(".favourite-and-last-played-games-container").html('');
        if (null == window.currentUser) {
            return;
        }

        // loading of favorite/last played is available to logged-in users only
        doReloadFavouritesAndLastPlayedGamesFromServer(function(response) {
            if (response.favouriteGames.length > 0 || response.lastPlayedGames.length > 0) {
                var title;
                var games;
                if (response.favouriteGames.length > 0) {
                   games = response.favouriteGames;
                   title = translations.favouriteGames;
                } else {
                   games = response.lastPlayedGames;
                   title = translations.lastPlayedGames;;
                }

                var gamesHtml = '';
                $.each(games, function(index, g) {
                   var game = g.game;
                   var imageUrl = game.squareImageUrl;

                   imageUrl = config.denchApiUrl + "/api/v1/customerfacing" + imageUrl;
                   gamesHtml += '<li>' + getGameHtml(game, imageUrl) + '</li>';
                });

                var html =
                   '<div class="casino-lobby-games">' +
                       '<h1 class="category-name">' + title + '</h1>' +
                       '<div class="game-box">' +
                           '<ul>' +
                               gamesHtml +
                           '</ul>' +
                       '</div>' +
                   '</div>';

                $(".favourite-and-last-played-games-container").html(html);
            }
        }, isMobileDevice);
    }

    function loadFeaturedGamesForMobile() {
        var featuredGamesSearch = {};
        featuredGamesSearch.pageSize = 999;
        featuredGamesSearch.columnSearches = [ {'key' : 'isFeatured', 'operation' : 'eq', 'value' : true } ];
        if (isMobileDevice) {
            featuredGamesSearch.columnSearches.push({'key' : 'supportsMobile', 'operation' : 'eq', 'value' : true });
        } else {
            featuredGamesSearch.columnSearches.push({'key' : 'supportsDesktop', 'operation' : 'eq', 'value' : true });
        }

        $.ajax({
            type : 'POST',
            url : config.denchApiUrl + "/api/v1/customerfacing/gaming/games/search?mobile=" + isMobileDevice,
            headers : {
                "labelEntryPointCode" : config.labelCode
            },
            contentType : 'application/json; charset=utf-8',
            data: JSON.stringify(featuredGamesSearch),
            dataType: "json",
            success : function(response) {
                var games = response.content;
                if (games.length == 0) {
                    return;
                }

                var html =
                    '<div class="featured-category">' + translations.featuredGames + '</div>' +
                    '<div class="featured-games-slider regular slider"> ';
                $.each(games, function(index, game) {
                    var imageUrl = game.squareImageUrl;
                    imageUrl = config.denchApiUrl + "/api/v1/customerfacing" + imageUrl;
                    html +=
                        '<div>' +
                            '<a href="javascript:void(0);" class="game-link" ' + getGameHtmlAttributes(game, isMobileDevice) +
                                '>' + getGameHotOrNewHtml(game) +
                                '<img src="' + imageUrl + '" alt="" class="featured-image"/></a>' +
                        '</div>';
                });
                html +=
                    '</div>';

                $(".featured-games-container").html(html);
                $('.featured-games-slider').slick({
                      dots: true,
                      infinite: true,
                      speed: 500,
                      slidesToShow:2,
                      slidesToScroll: 2,
                      autoplay: false,
                      autoplaySpeed: 2000,
                      arrows: false,
                });
            }
        });
    }

    function loadGameCategoriesForMobile() {
        $.ajax({
            type : 'GET',
            url : config.denchApiUrl + "/api/v1/customerfacing/gaming/gameCategories?mobile=" + isMobileDevice,
            headers : {
                "labelEntryPointCode" : config.labelCode
            },
            success : function(response) {
                var categories = response;
                var html = '';
                $.each(categories, function(index, category) {
                    if (category.games && category.games.length > 0 && category.enabled) {
                        var totalGameCount = category.enabledGamesCount;

                        var gamesHtml = '';
                        $.each(category.games, function(index, game) {
                            gamesHtml += '<li>' + getGameHtml(game, isMobileDevice) + '</li>';
                        });

                        var categoryUrl = config.hostUrl + '/casino-category?categoryId=' + category.id;

                        html +=
                            '<div class="casino-lobby-games">' +
                                '<h1 class="category-name">' +
                                    '<a href="' + categoryUrl + '" class="show-all">' + translations.showAll +
                                    '<span> ' +  totalGameCount + '</span> ' +
                                    '<i class="icon-arrow-next"></i></a>' + getGameCategoryName(category) + " " +
                                        getCategoryNewGamesHtml(category.hasNewGameInCategory) +
                                '</h1>' +
                                '<div class="game-box">' +
                                    '<ul>' +
                                        gamesHtml +
                                    '</ul>' +
                                '</div>' +
                            '</div>';
                    }
                });

                $(".categories").html(html);
            }
        });
    }

    function reloadGameCategoryForWeb(categoryId) {
        categoryGames = [];
        $.ajax({
            type : 'GET',
            url : config.denchApiUrl + "/api/v1/customerfacing/gaming/gameCategories/" + categoryId + "?mobile=" +
                isMobileDevice,
            headers : {
                "labelEntryPointCode" : config.labelCode
            },
            success : function(response) {
                var category = response;
                category.name = getGameCategoryName(category);
                category.casinoGameCount = category.games.length;

                currentResult = category;
                updateGameListContainer(currentResult);
            },
            complete : function() {
                $("#loadingImage").remove();
            }
        });
    }

    function loadGameCategoriesForWeb() {
        $.ajax({
            type : 'GET',
            url : config.denchApiUrl + "/api/v1/customerfacing/gaming/gameCategories/names",
            headers : {
                "labelEntryPointCode" : config.labelCode
            },
            success : function(response) {
                var categories = response;
                var html = '';
                $.each(categories, function(index, category) {
                    html += '<li><a href="javascript:void(0);" class="casino-tab" data-search-type="category"' +
                        'data-search-value="' +  category.id + '">' + getGameCategoryName(category) + '</a></li>';
                });

                $(".categories").replaceWith(html);
            }
        });
    }

    function isGameFavourite(game) {
        return window.favouriteGameIds.indexOf(game.id) > -1;
    }

    function delay(callback, ms) {
        clearTimeout(timer);
        timer = setTimeout(callback, ms);
    }

    function initializeScrollLoadEvent() {

//        $(".load-more-games").html('<div id="loadingMoreGamesImage" class="loading-bg"><img src="' + config.assetsUrl +
//                        '/images/loading.gif" class="inline-loading-image"></div>');
        $(window).scrollTop($(window).scrollTop()-1);
        function getDocHeight() {
            var D = document;
            return Math.max(
                D.body.scrollHeight, D.documentElement.scrollHeight,
                D.body.offsetHeight, D.documentElement.offsetHeight,
                D.body.clientHeight, D.documentElement.clientHeight
            );
        }
        if (currentSearch.value.pageStart == 0) {
            $(window).scroll(function() {
                if($(window).scrollTop() + $(window).height() == getDocHeight()) {
                    $(".load-more-games").show();
                    currentSearch.value.pageStart += 48;
                    reloadCurrentGameSearch();
                }
            });
        }
    }
});

