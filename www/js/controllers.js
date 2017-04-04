angular.module('LSEInvest.controllers', [])


.controller('AppCtrl', ['$scope', 'modalService', 'userService', '$cordovaInAppBrowser',
  function($scope, modalService, userService, $cordovaInAppBrowser) {

   $scope.modalService = modalService;

   $scope.societyLink = "http://investmentsociety.co.uk/";

   $scope.openWindow = function(link) {
       var inAppBrowserOptions = {
         location: 'yes',
         clearcache: 'yes',
         toolbar: 'yes'
       };

       $cordovaInAppBrowser.open(link, '_blank', inAppBrowserOptions);
     };

   $scope.logout = function() {
     userService.logout();
   };
}])

.controller('LearningHubCtrl', ['$scope', 'learningService',
  function($scope, learningService) {

    $scope.toggleItem = function(item) {
      if ($scope.isItemShown(item)) {
        $scope.shownItem = null;
      } else {
        $scope.shownItem = item;
      }
    };

    $scope.isItemShown = function(item) {
      return $scope.shownItem === item;
    };

  $scope.items = learningService.getContent();

}])

.controller('AccountCtrl', ['$scope', 'userService', 'reportArrayService',
  function($scope, userService, reportArrayService) {

    $scope.$on("$ionicView.afterEnter", function() {
      $scope.getMyBalanceData();
    });

    $scope.getMyBalanceData = function(){
      if (userService.getUser())
      {
        var user = userService.getUser();
        $scope.user = user.email;
        var promise = userService.getAccountBalance(user);
        $scope.accountBalance = 0;

        promise.then(function(data){
          $scope.accountBalance = data;
          console.log("Collected Data " + data);
        });
      }
      else {
        balance = "No User Found.";
      }

      $scope.totalResult = 0;
      $scope.reportsData = [];
      reportArrayService.forEach(function(trade){
        $scope.totalResult = $scope.totalResult + trade.result;
        console.log("trade result: " + $scope.totalResult);
        console.log("Loading Reports.");
        $scope.reportsData.push(trade);

      });
    };
}])

.controller('OpenPositionsCtrl', ['$scope', '$ionicPopup', 'userService', 'openPositionsArrayService', 'stockDataService', 'stockPriceCacheService', 'openPositionService', 'tradeService', 'dateService', 'reportService',
  function($scope, $ionicPopup, userService, openPositionsArrayService, stockDataService, stockPriceCacheService, openPositionService, tradeService, dateService, reportService) {

    $scope.$on("$ionicView.afterEnter", function() {
      $scope.getOpenStockPositions();
    });

    $scope.getOpenStockPositions = function(){
      openPositionsArrayService.forEach(function(stock) {
        console.log("Testing 2");
        console.dir(stock);
        console.log("Quantity: " + stock.quantity);

        var promise = stockDataService.getStockPriceData(stock.ticker);

        $scope.openPositionsData = [];
        $scope.stocksData = [stock];
        $scope.allData = {};


        promise.then(function(data) {
          var live_data = stockPriceCacheService.get(data.symbol);

          $scope.current = live_data.price*stock.quantity;
          $scope.purchase = stock.purchase_price*stock.quantity;
          $scope.current_result = $scope.current - $scope.purchase;

          var result = {'result': $scope.current_result};

          var merge = Object.assign(live_data, stock, result);
          $scope.openPositionsData.push(merge);
          console.dir($scope.openPositionsData);

        });
      });
      $scope.$broadcast('scroll.refreshComplete');
    };

    $scope.closePosition = function(ticker, stockPrice, quantity, result, name) {

      console.log("STOCK CTRL, Data: " + stockPrice);
      console.log("POP UP LOG: " + quantity);
      tradeService.closePosition(stockPrice, $scope.ticker, quantity);

      $scope.todayDate = dateService.currentDate();

      reportService.new(name, quantity, stockPrice, $scope.todayDate, ticker, result);
      openPositionService.close(ticker);
      $scope.getOpenStockPositions();
    };

    $scope.showSellPopup = function(name, stockPrice, stockQuantity) {
      var alertPopup = $ionicPopup.alert({
        title: ' You Sold',
        template: '' + stockQuantity +  ' '+ name + ' at ' + stockPrice
      });
      alertPopup.then(function(res) {
        console.log('Pop up');
      });
    };

}])

.controller('FavouriteStocksCtrl', ['$scope', 'favouriteStocksArrayService', 'stockDataService','stockPriceCacheService', 'openPositionsArrayService', 'followStockService',
  function($scope, favouriteStocksArrayService, stockDataService, stockPriceCacheService, openPositionsArrayService, followStockService) {

    $scope.$on("$ionicView.afterEnter", function() {
      $scope.getFavouriteStocksData();
    });

    $scope.getFavouriteStocksData = function(){
      favouriteStocksArrayService.forEach(function(stock) {
        console.log("Testing 1");

        var promise = stockDataService.getStockPriceData(stock.ticker);

        $scope.favouriteStocksData = [];

        promise.then(function(data) {
          $scope.favouriteStocksData.push(stockPriceCacheService.get(data.symbol));
        });
      });
      $scope.$broadcast('scroll.refreshComplete');
    };

    $scope.unfollowStock = function(ticker) {
      followStockService.unfollow(ticker);
      $scope.getFavouriteStocksData();
    };
}])

.controller('StockCtrl', ['$scope', '$stateParams', '$window', '$ionicPopup', '$cordovaInAppBrowser', 'stockDataService', 'dateService', 'chartDataRetrievalService','noteService', 'newsfeedService', 'followStockService', 'tradeService',
function($scope, $stateParams, $window, $ionicPopup, $cordovaInAppBrowser, stockDataService, dateService, chartDataRetrievalService, noteService, newsfeedService, followStockService, tradeService) {
  $scope.ticker = $stateParams.stockTicker;
  $scope.chartView = 4;
  $scope.following = followStockService.checkFollowing($scope.ticker);
  $scope.oneYearAgoDate = dateService.oneYearAgoDate();
  $scope.todayDate = dateService.currentDate();

  $scope.userNotes = [];
  $scope.transaction = {};


  console.log(dateService.currentDate());
  console.log(dateService.oneYearAgoDate());

  $scope.$on("$ionicView.afterEnter", function()  {
    getStockPriceData();
    getStockDetailsData();
    getInteractiveChartData();
    getNewsfeed();
    $scope.userNotes = noteService.getNotes($scope.ticker);
  });

  $scope.toggleFollow = function() {
      if($scope.following) {
        followStockService.unfollow($scope.ticker);
        $scope.following = false;
      }
      else {
        followStockService.follow($scope.ticker);
        $scope.following = true;
      }
    };

  $scope.openWindow = function(link) {
      var inAppBrowserOptions = {
        location: 'yes',
        clearcache: 'yes',
        toolbar: 'yes'
      };

      $cordovaInAppBrowser.open(link, '_blank', inAppBrowserOptions);
    };


  $scope.chartViewFunc = function(n){
    $scope.chartView = n;
  };

  $scope.buyStock = function(stockQuantity){

    var transactionQuantity = 1;
    if ($scope.transaction.quantity > 1) {
      transactionQuantity = $scope.transaction.quantity;
    }

    console.log("QUANTITY VALUE: " + transactionQuantity);
    console.log("STOCK CTRL, Data: " + $scope.displayStockDetails.Ask);
    console.log("Using Price Data:" + $scope.displayStockPrice.price);

    var stockPrice = $scope.displayStockPrice.price;
    var stockName = $scope.displayStockDetails.Name;
    tradeService.openPosition(stockPrice, $scope.ticker, stockName, transactionQuantity, $scope.todayDate);

  };


  $scope.addNote = function() {
      $scope.note = {title: 'Note', body: '', date: $scope.todayDate, ticker: $scope.ticker};

      var note = $ionicPopup.show({
        template: '<input type="text" ng-model="note.title" id="stock-note-title"><textarea type="text" ng-model="note.body" id="stock-note-body"></textarea>',
        title: 'New Note for ' + $scope.ticker,
        scope: $scope,
        buttons: [
          {
            text: 'Cancel',
            onTap: function(e) {
              return;
            }
           },
          {
            text: '<b>Save</b>',
            type: 'button-balanced',
            onTap: function(e) {
              noteService.addNote($scope.ticker, $scope.note);
            }
          }
        ]
      });

      note.then(function(res) {
        $scope.userNotes = noteService.getNotes($scope.ticker);
      });
    };

    $scope.openNote = function(index, title, body) {
      $scope.note = {title: title, body: body, date: $scope.todayDate, ticker: $scope.ticker};

      var note = $ionicPopup.show({
        template: '<input type="text" ng-model="note.title" id="stock-note-title"><textarea type="text" ng-model="note.body" id="stock-note-body"></textarea>',
        title: $scope.note.title,
        scope: $scope,
        buttons: [
          {
            text: 'Delete',
            type: 'button-assertive button-small',
            onTap: function(e) {
              noteService.deleteNote($scope.ticker, index);
            }
          },
          {
            text: 'Cancel',
            type: 'button-small',
            onTap: function(e) {
              return;
            }
           },
          {
            text: '<b>Save</b>',
            type: 'button-balanced button-small',
            onTap: function(e) {
              noteService.deleteNote($scope.ticker, index);
              noteService.addNote($scope.ticker, $scope.note);
            }
          }
        ]
      });

      note.then(function(res) {
        $scope.userNotes = noteService.getNotes($scope.ticker);
      });
    };

  function getStockPriceData() {

      var promise = stockDataService.getStockPriceData($scope.ticker);

      promise.then(function(data) {
        $scope.displayStockPrice = data;

        if(data.chg_percent >= 0 && data !== null) {
          $scope.reactiveColor = {'background-color': '#33cd5f', 'border-color': 'rgba(255,255,255,.3)'};
        }
        else if(data.chg_percent < 0 && data !== null) {
          $scope.reactiveColor = {'background-color' : '#ef473a', 'border-color': 'rgba(0,0,0,.2)'};
        }
      });
    }

  function getStockDetailsData() {
    var promise = stockDataService.getStockDetailsData($scope.ticker);

    promise.then(function(data){
      console.log(data);
      $scope.displayStockDetails = data;
    });
  }

  function getNewsfeed() {

        $scope.newsData = [];

        var promise = newsfeedService.getNewsfeed($scope.ticker);

        promise.then(function(data) {
          $scope.newsData = data;
        });
      }


function getInteractiveChartData() {
  var promise = chartDataRetrievalService.getStocksHistoricalData($scope.ticker, $scope.oneYearAgoDate, $scope.todayDate);

  promise.then(function(data) {
    $scope.myData = JSON.parse(data)
    //The map function seen below is externally sourced from the angular-nvd3 website
        .map(function(series) {
          series.values = series.values.map(function(d) { return {x: d[0], y: d[1] }; });
          return series;
        });
    });
}

//The code found below is externally sourced from the angular-nvd3 website
//It defines the charts configuration options
  	var xTickFormat = function(d) {
  		var dx = $scope.myData[0].values[d] && $scope.myData[0].values[d].x || 0;
  		if (dx > 0) {
        return d3.time.format("%b %d")(new Date(dx));
  		}
  		return null;
  	};

    var x2TickFormat = function(d) {
      var dx = $scope.myData[0].values[d] && $scope.myData[0].values[d].x || 0;
      return d3.time.format('%b %Y')(new Date(dx));
    };

    var y1TickFormat = function(d) {
      return d3.format(',f')(d);
    };

    var y2TickFormat = function(d) {
      return d3.format('s')(d);
    };

    var y3TickFormat = function(d) {
      return d3.format(',.2s')(d);
    };

    var y4TickFormat = function(d) {
      return d3.format(',.2s')(d);
    };

    var xValueFunction = function(d, i) {
      return i;
    };

    var marginBottom =($window.innerWidth / 100) * 10;

  	$scope.chartOptions = {
      chartType: 'linePlusBarWithFocusChart',
      data: 'myData',
      margin: {top: 15, right: 0, bottom: marginBottom, left: 0},
      interpolate: "cardinal",
      useInteractiveGuideline: false,
      yShowMaxMin: false,
      tooltips: false,
      showLegend: false,
      useVoronoi: false,
      xShowMaxMin: false,
      xValue: xValueFunction,
      xAxisTickFormat: xTickFormat,
      x2AxisTickFormat: x2TickFormat,
      y1AxisTickFormat: y1TickFormat,
      y2AxisTickFormat: y2TickFormat,
      y3AxisTickFormat: y3TickFormat,
      y4AxisTickFormat: y4TickFormat,
      transitionDuration: 500,
      y1AxisLabel: 'Price',
      y3AxisLabel: 'Volume',
      noData: 'Loading Data...'
  	};

}])


.controller('SearchCtrl', ['$scope', '$state', 'modalService', 'searchService',
  function($scope, $state, modalService, searchService) {

    $scope.closeModal = function() {
      modalService.closeModal();
    };

    $scope.search = function() {
      $scope.searchResults = '';
      searchBuffer($scope.searchQuery);
    };

    var searchBuffer = ionic.debounce(function(query) {
      searchService.search(query)
        .then(function(data) {
          $scope.searchResults = data;
        });
    }, 400);

    $scope.openStock = function(ticker) {
      modalService.closeModal();
      $state.go('app.stock', {stockTicker: ticker});
    };
}])


.controller('UserAuthCtrl', ['$scope', 'modalService', 'userService',
  function($scope, modalService, userService) {

    $scope.user = {email: '', password: ''};

    $scope.closeModal = function() {
      modalService.closeModal();
    };

    $scope.signup = function(user) {
      userService.signup(user);
    };

    $scope.login = function(user) {
      userService.login(user);
    };
}])

;
