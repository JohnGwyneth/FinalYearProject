angular.module('LSEInvest.services', [])

// .constant('FIREBASE_URL', 'https://lseinvest-9ab49.firebaseio.com/')

.service('modalService', function($ionicModal) {

  this.openModal = function(id) {

    var _this = this;

    if(id == 1) {
      $ionicModal.fromTemplateUrl('templates/search.html', {
        scope: null,
        controller: 'SearchCtrl'
      }).then(function(modal) {
        _this.modal = modal;
        _this.modal.show();
      });
    }
    else if(id == 2) {
      $ionicModal.fromTemplateUrl('templates/login.html', {
        scope: null,
        controller: 'LoginSearchCtrl'
      }).then(function(modal) {
        _this.modal = modal;
        _this.modal.show();
      });
    }
    else if(id == 3) {
      $ionicModal.fromTemplateUrl('templates/signup.html', {
        scope: null,
        controller: 'LoginSearchCtrl'
      }).then(function(modal) {
        _this.modal = modal;
        _this.modal.show();
      });
    }
  };

  this.closeModal = function() {

    var _this = this;

    if(!_this.modal) return;
    _this.modal.hide();
    _this.modal.remove();
  };

})

.factory('encodeURIService', function(){
  return{
    encode: function(string) {
      console.log(string);
      return encodeURIComponent(string).replace(/\" /g, "22%").replace(/\ /g, "20%").replace(/[!'()]/g, escape);
    }
  };
})


.factory('firebaseDBRef', function() {
  return firebase.database().ref();
})



.factory('firebaseAuthRef', function() {
  return firebase.auth();
})



.factory('firebaseUserRef', function(firebaseDBRef) {
  return firebaseDBRef.child('users');
})


.factory('learningService', function() {

  var getContent = function() {
    var items = [];
    items[0] = {"Title": "What is Ask and Bid?", "Text": "Ask is the price a seller is willing to accept for a security, which is often referred to as the offer price. Along with the price, the ask quote might also stipulate the amount of the security available to be sold at that price. Bid is the price a buyer is willing to pay for a security, and the ask will always be higher than the bid."};
    items[1] = {"Title": "What is Prev. Close?", "Text": "A security's closing price on the preceding day of trading. Previous close can refer to the prior day's value of a stock, bond, commodity, futures or option contract, market index, or any other security. By comparing a security's closing price from one day to the next, investors can see how the security's price has changed over time."};
    items[2] = {"Title": "What is the Open Price?", "Text": "The opening price is the price at which a security first trades upon the opening of an exchange on a given trading day; for example, the New York Stock Exchange opens at precisely 9:30 a.m. Eastern. The price of the first trade for any listed stock is its daily opening price."};
    items[3] = {"Title": "What is Day High and Low?", "Text": "A security's intraday high/low trading price. Today's high is the highest price at which a stock traded during the course of the day. Today's low is the lowest price at which a stock traded during the course of the day."};
    items[4] = {"Title": "What is a 52w High/Low?", "Text": "A 52-week high/low is the highest and lowest price that a stock has traded at during the previous year. Many traders and investors view the 52-week high or low as an important factor in determining a stock's current value and predicting future price movement. Investors may show increased interest as price nears either the high or the low."};
    items[5] = {"Title": "What is Volume?", "Text": "Volume is the number of shares or contracts traded in a security or an entire market during a given period of time. For every buyer, there is a seller, and each transaction contributes to the count of total volume. That is, when buyers and sellers agree to make a transaction at a certain price, it is considered one transaction."};
    items[6] = {"Title": "What is the Avg. Volume?", "Text": "The average daily trading volume is the amount of individual securities traded in a day on average over a specified period of time. Trading activity relates to the liquidity of a security, as a result average daily trading volume can have an effect on the price of the security."};
    items[7] = {"Title": "What is the Market Cap?", "Text": "Market capitalization refers the total dollar market value of a company's outstanding shares. Commonly referred to as 'market cap', it is calculated by multiplying a company's shares outstanding by the current market price of one share. The investment community uses this figure to determine a company's size, as opposed to using sales or total asset figures."};
    items[8] = {"Title": "What is EBITDA?", "Text": "EBITDA stands for earnings before interest, taxes, depreciation and amortization. EBITDA is one indicator of a company's financial performance and is used as a proxy for the earning potential of a business, although doing so has its drawbacks. Further, EBITDA strips out the cost of debt capital and its tax effects by adding back interest and taxes to earnings."};
    items[9] = {"Title": "P/E Ratio: What is It?", "Text": "P/E is short for the ratio of a companys share price to its per-share earnings. As the name implies, to calculate the P/E, you simply take the current stock price of a company and divide by its earnings per share (EPS)."};
    items[10] = {"Title": "What is EPS?", "Text": "Earnings per share (EPS) is the portion of a company's profit allocated to each outstanding share of common stock. Earnings per share serves as an indicator of a company's profitability."};

    return items;
  };

  return {
    getContent: getContent,
  };

})


.factory('tradeService', function($ionicPopup ,userService, firebaseUserRef, stockDataService, openPositionService){

  var showBuyPopup = function(stockPrice, stockName, transactionQuantity) {
    var alertPopup = $ionicPopup.alert({
      title: ' You Bought',
      template: transactionQuantity + ' '+ stockName + ' at ' + stockPrice
    });
    alertPopup.then(function(res) {
      console.log('Pop up');
    });
  };

  showInvalidBuyPopup = function(stockName, transactionQuantity) {
    var alertPopup = $ionicPopup.alert({
      title: 'Sorry!',
      template: 'You do not have enough equity to buy, ' + transactionQuantity +' of '+ stockName
    });
    alertPopup.then(function(res) {
      console.log('Invalid Trade Pop Up');
    });
  };


  var openPosition = function(stockPrice, ticker, stockName, transactionQuantity, todayDate){
    userData = userService.getUser();
    var balance = 0;
    var updatedBalance = 0;

    firebaseUserRef.child(userData.uid).child('balance').once('value', function(snapshot) {
      balance = snapshot.val();

      if (balance > (transactionQuantity * stockPrice)) {
        updatedBalance = balance - (transactionQuantity * stockPrice);

        console.log("Trade Service: Pull Balance");
        console.log("Testing Purchase, Balance = " + balance);
        console.log("Stock Price: " + stockPrice);
        console.log("Updated Balance = " + updatedBalance);

        firebaseUserRef.child(userData.uid).child('balance').set(updatedBalance);
        openPositionService.open(ticker, stockPrice, transactionQuantity, todayDate);
        showBuyPopup(stockPrice, stockName, transactionQuantity);
      }
      else {
        showInvalidBuyPopup(stockName, transactionQuantity);
        console.log("Error. You do not have enough equity to buy this share.");
        return;
      }
    },
    function(error) {
      console.log("Firebase error –> balance" + error);
    });
  };

  var closePosition = function(stockPrice, ticker, quantity){

    userData = userService.getUser();
    var balance = 0;
    var updatedBalance = 0;

    firebaseUserRef.child(userData.uid).child('balance').once('value', function(snapshot) {
      balance = snapshot.val();
      updatedBalance = balance + (quantity * stockPrice);

      console.log("Trade Service: Pull Balance");
      console.log("Testing Sale, Balance = " + balance);
      console.log("Stock Price: " + stockPrice);
      console.log("Stock Quantity: " + quantity);
      console.log("Updated Balance = " + updatedBalance);


      firebaseUserRef.child(userData.uid).child('balance').set(updatedBalance);

    },
    function(error) {
      console.log("Firebase error –> balance" + error);
    });


  };

  return {
    openPosition: openPosition,
    closePosition: closePosition,
  };

})

.factory('userService', function($q, $rootScope, $window, $timeout, firebaseDBRef, firebaseAuthRef, firebaseUserRef, myStocksArrayService, myStocksCacheService, notesCacheService, modalService, openPositionsArrayService, openPositionsCacheService, reportArrayService, reportCacheService) {

  var login = function(user, signup) {
    var email = user.email;
    var password = user.password;

    firebaseAuthRef.signInWithEmailAndPassword(email, password)
      .then(function() {
        $rootScope.currentUser = getUser();

        if(signup) {
          modalService.closeModal();
        }
        else {
          myStocksCacheService.removeAll();
          notesCacheService.removeAll();

          loadUserData(getUser());

          modalService.closeModal();
          $timeout(function() {
            $window.location.reload(true);
          }, 400);
        }
      })
      .catch(function(error) {
        console.log("Login Failed!", error);
        return false;
      });
  };

  var signup = function(user) {

    firebaseAuthRef.createUserWithEmailAndPassword(user.email, user.password)
    .then(function(userData) {
      console.log(userData);
      login(user, true);
      firebaseDBRef.child('emails').push(user.email);
      firebaseUserRef.child(userData.uid).child('balance').set(100000);
      firebaseUserRef.child(userData.uid).child('stocks').set(myStocksArrayService);
      firebaseUserRef.child(userData.uid).child('open-positions').set(openPositionsArrayService);

      var stocksWithNotes = notesCacheService.keys();

      stocksWithNotes.forEach(function(stockWithNotes) {
        var notes = notesCacheService.get(stockWithNotes);

        notes.forEach(function(note) {
          firebaseUserRef.child(userData.uid).child('notes').child(note.ticker).push(note);
        });
      });
    })
    .catch(function(error) {
      console.log("Error creating user:", error);
      return false;
    });
  };

  var logout = function() {
    firebaseAuthRef.signOut();
    notesCacheService.removeAll();
    myStocksCacheService.removeAll();
    openPositionsCacheService.removeAll();
    reportCacheService.removeAll();
    $window.location.reload(true);
    $rootScope.currentUser = '';
  };

  var updateStocks = function(stocks) {
    firebaseUserRef.child(getUser().uid).child('stocks').set(stocks);
  };

  var updatePositions = function(stocks) {
    firebaseUserRef.child(getUser().uid).child('open-positions').set(stocks);
  };

  var updateReport = function(stocks) {
    firebaseUserRef.child(getUser().uid).child('report').set(stocks);
  };

  var updateNotes = function(ticker, notes) {
    firebaseUserRef.child(getUser().uid).child('notes').child(ticker).remove();
    notes.forEach(function(note) {
      firebaseUserRef.child(getUser().uid).child('notes').child(note.ticker).push(note);
    });
  };

  var getAccountBalance = function(authData){
    var deferred = $q.defer();
    var balance = 0;
    if (authData === null){
      balance = 1;
      console.log("We Have No AuthData");
      return deferred.promise;
    }
    firebaseUserRef.child(authData.uid).child('balance').once('value', function(snapshot) {
      balance = snapshot.val();
      console.log("We pulled");
      console.log("User " + authData.email);
      console.log("Balance: " + balance);
      deferred.resolve(balance);
    },
    function(error) {
      console.log("Firebase error –> balance" + error);
      deferred.reject();
    });
    return deferred.promise;
  };

  var loadUserData = function(authData) {

    firebaseUserRef.child(authData.uid).child('stocks').once('value', function(snapshot) {
      var stocksFromDatabase = [];

      snapshot.val().forEach(function(stock) {
        var stockToAdd = {ticker: stock.ticker};
        stocksFromDatabase.push(stockToAdd);
      });

      myStocksCacheService.put('myStocks', stocksFromDatabase);
    },
    function(error) {
      console.log("Firebase error –> stocks" + error);
    });

    firebaseUserRef.child(authData.uid).child('open-positions').once('value', function(snapshot) {
      var positionsFromDatabase = [];

      snapshot.val().forEach(function(stock) {
        var positionToAdd = {ticker: stock.ticker, quantity: stock.quantity, purchase_time: stock.purchase_time, purchase_price: stock.purchase_price};
        positionsFromDatabase.push(positionToAdd);
      });

      openPositionsCacheService.put('openPositions', positionsFromDatabase);
    },
    function(error) {
      console.log("Firebase error –> open positions" + error);
    });

    firebaseUserRef.child(authData.uid).child('report').once('value', function(snapshot) {
      var reportsFromDatabase = [];

      snapshot.val().forEach(function(stock) {
        var reportToAdd = {ticker: stock.ticker, result: stock.result, quantity: stock.quantity, name: stock.name, date: stock.date, close_price: stock.close_price};
        reportsFromDatabase.push(reportToAdd);
      });

      reportCacheService.put('reports', reportsFromDatabase);
    },
    function(error) {
      console.log("Firebase error –> report" + error);
    });



    firebaseUserRef.child(authData.uid).child('notes').once('value', function(snapshot) {

      snapshot.forEach(function(stocksWithNotes) {
        var notesFromDatabase = [];
        stocksWithNotes.forEach(function(note) {
          notesFromDatabase.push(note.val());
          var cacheKey = note.child('ticker').val();
          notesCacheService.put(cacheKey, notesFromDatabase);
        });
      });
    },
    function(error) {
      console.log("Firebase error –> notes: " + error);
    });
  };

  var getUser = function() {
    return firebaseAuthRef.currentUser;
  };

  if(getUser()) {
    $rootScope.currentUser = getUser();
  }

  return {
    login: login,
    signup: signup,
    logout: logout,
    updateStocks: updateStocks,
    updatePositions: updatePositions,
    updateReport: updateReport,
    updateNotes: updateNotes,
    getUser: getUser,
    getAccountBalance: getAccountBalance,
  };
})

.factory('dateService', function($filter){
  var currentDate = function(){
    var d = new Date();
    var date = $filter('date')(d, 'yyyy-MM-dd');
    return date;
  };
  var oneYearAgoDate = function() {
    var d = new Date(new Date().setDate(new Date().getDate() - 365));
    var date = $filter('date')(d, 'yyyy-MM-dd');
    return date;
  };
  return {
    currentDate: currentDate,
    oneYearAgoDate: oneYearAgoDate
  };
})

.factory('chartDataService', function($q, $http, encodeURIService, chartDataCacheService){
  var getHistoricalData = function(ticker, fromDate, todayDate){
    var deferred = $q.defer(),

    cacheKey = ticker,
    chartDataCache = chartDataCacheService.get(cacheKey),

    query = 'select * from yahoo.finance.historicaldata where symbol = "' + ticker + '" and startDate = "' + fromDate + '" and endDate = "' + todayDate + '"';
    url = 'http://query.yahooapis.com/v1/public/yql?q=' + encodeURIService.encode(query) + '&format=json&env=http://datatables.org/alltables.env';
    url2 = "http://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20yahoo.finance.historicaldata%20where%20symbol%20=%20%22" + ticker + "%22%20and%20startDate%20=%20%22" + fromDate + "%22%20and%20endDate%20=%20%22" + todayDate + "%22&format=json&diagnostics=true&env=store://datatables.org/alltableswithkeys";
// added new url value as again encode service was producing an invalid URL request

    if(chartDataCache) {
      deferred.resolve(chartDataCache);
    }
    else {
        $http.get(url2)
          .success(function(json) {
            var jsonData = json.query.results.quote;

            var priceData = [],
            volumeData = [];

            jsonData.forEach(function(dayDataObject) {

              var dateToMillis = dayDataObject.Date,
              date = Date.parse(dateToMillis),
              price = parseFloat(Math.round(dayDataObject.Close * 100) / 100).toFixed(3),
              volume = dayDataObject.Volume,

              volumeDatum = '[' + date + ',' + volume + ']',
              priceDatum = '[' + date + ',' + price + ']';

              volumeData.unshift(volumeDatum);
              priceData.unshift(priceDatum);
            });

            var formattedChartData =
              '[{' +
                '"key":' + '"volume",' +
                '"bar":' + 'true,' +
                '"values":' + '[' + volumeData + ']' +
              '},' +
              '{' +
                '"key":' + '"' + ticker + '",' +
                '"values":' + '[' + priceData + ']' +
              '}]';

            deferred.resolve(formattedChartData);
            chartDataCacheService.put(cacheKey, formattedChartData);
          })
          .error(function(error) {
            console.log("Chart data error: " + error);
            deferred.reject();
          });
      }

      return deferred.promise;
    };

    return {
      getHistoricalData: getHistoricalData
    };
  })

  .factory('stockPriceCacheService', function(CacheFactory) {

    var stockPriceCache;

    if(!CacheFactory.get('stockPriceCache')) {
      stockPriceCache = CacheFactory('stockPriceCache', {
        maxAge: 5 * 1000,
        deleteOnExpire: 'aggressive',
        storageMode: 'localStorage'
      });
    }
    else {
      stockPriceCache = CacheFactory.get('stockPriceCache');
    }

    return stockPriceCache;
  })

//   .factory('stockDetailsCacheService', function(CacheFactory) {
//
//   var stockDetailsCache;
//
//   if(!CacheFactory.get('stockDetailsCache')) {
//     stockDetailsCache = CacheFactory('stockDetailsCache', {
//       maxAge: 60 * 1000,
//       deleteOnExpire: 'aggressive',
//       storageMode: 'localStorage'
//     });
//   }
//   else {
//     stockDetailsCache = CacheFactory.get('stockDetailsCache');
//   }
//
//   return stockDetailsCache;
// })

.factory('chartDataCacheService', function(CacheFactory) {

  var chartDataCache;

  if(!CacheFactory.get('chartDataCache')) {

    chartDataCache = CacheFactory('chartDataCache', {
      maxAge: 60 * 60 * 8 * 1000,
      deleteOnExpire: 'aggressive',
      storageMode: 'localStorage'
    });
  }
  else {
    chartDataCache = CacheFactory.get('chartDataCache');
  }

  return chartDataCache;
})

.factory('followStockService', function(myStocksArrayService, myStocksCacheService, userService) {

  return {

    follow: function(ticker) {
      var stockToAdd = {"ticker": ticker};

      myStocksArrayService.push(stockToAdd);
      myStocksCacheService.put('myStocks', myStocksArrayService);

      if(userService.getUser()) {
        userService.updateStocks(myStocksArrayService);
      }
    },

    unfollow: function(ticker) {
      for (var i = 0; i < myStocksArrayService.length; i++) {
        if(myStocksArrayService[i].ticker == ticker) {

          myStocksArrayService.splice(i, 1);
          myStocksCacheService.remove('myStocks');
          myStocksCacheService.put('myStocks', myStocksArrayService);

          if(userService.getUser()) {
            userService.updateStocks(myStocksArrayService);
          }

          break;
        }
      }

    },

    checkFollowing: function(ticker) {
      for (var i = 0; i < myStocksArrayService.length; i++) {
        if(myStocksArrayService[i].ticker == ticker) {
          return true;
        }
      }
      return false;
    }

  };
})

.factory('openPositionService', function(openPositionsArrayService, openPositionsCacheService, userService) {

  return {

    open: function(ticker, purchasePrice, quantity, timestamp) {
      var stockToAdd = {"ticker": ticker, "purchase_price": purchasePrice, "quantity": quantity, "purchase_time": timestamp};

      openPositionsArrayService.push(stockToAdd);
      openPositionsCacheService.put('openPositions', openPositionsArrayService);

      if(userService.getUser()) {
        userService.updatePositions(openPositionsArrayService);
      }
    },

    close: function(ticker) {
      for (var i = 0; i < openPositionsArrayService.length; i++) {
        if(openPositionsArrayService[i].ticker == ticker) {

          openPositionsArrayService.splice(i, 1);
          openPositionsCacheService.remove('openPositions');
          openPositionsCacheService.put('openPositions', openPositionsArrayService);

          if(userService.getUser()) {
            userService.updatePositions(openPositionsArrayService);
          }

          break;
        }
      }

    },

    // checkFollowing: function(ticker) {
    //   for (var i = 0; i < myStocksArrayService.length; i++) {
    //     if(myStocksArrayService[i].ticker == ticker) {
    //       return true;
    //     }
    //   }
    //   return false;
    // }

  };
})

.factory('reportService', function(reportArrayService, reportCacheService, userService) {

  return {

    new: function(name, quantity, stockPrice, todayDate, ticker, result) {
      var tradeToAdd = {'name': name, 'quantity': quantity, 'close_price': stockPrice, 'date': todayDate, 'ticker': ticker, 'result': result};

      reportArrayService.push(tradeToAdd);
      reportCacheService.put('reports', reportArrayService);

      if(userService.getUser()) {
        console.dir(reportArrayService);
        userService.updateReport(reportArrayService);
      }
    },
  };
})

.factory('fillMyStocksCacheService', function(CacheFactory) {

  var myStocksCache;

  if(!CacheFactory.get('myStocksCache')) {
    myStocksCache = CacheFactory('myStocksCache', {
      storageMode: 'localStorage'
    });
  }
  else {
    myStocksCache = CacheFactory.get('myStocksCache');
  }

  var fillMyStocksCache = function() {

    var myStocksArray = [
      {ticker: "AAPL"},
      {ticker: "JPM"},
      {ticker: "FB"},
      {ticker: "NFLX"},
      {ticker: "TSLA"},
      {ticker: "BRK-A"},
      {ticker: "INTC"},
      {ticker: "MSFT"},
      {ticker: "GS"},
      {ticker: "BAC"},
      {ticker: "C"},
    ];

    myStocksCache.put('myStocks', myStocksArray);
  };

  return {
    fillMyStocksCache: fillMyStocksCache
  };
})

.factory('fillOpenPositionsCacheService', function(CacheFactory) {

  var openPositionsCache;

  if(!CacheFactory.get('openPositionsCache')) {
    openPositionsCache = CacheFactory('openPositionsCache', {
      storageMode: 'localStorage'
    });
  }
  else {
    openPositionsCache = CacheFactory.get('openPositionsCache');
  }

  var fillOpenPositionsCache = function() {

    var openPositionsArray = [];

    openPositionsCache.put('openPositions', openPositionsArray);
  };

  return {
    fillOpenPositionsCache: fillOpenPositionsCache
  };
})

.factory('fillReportCacheService', function(CacheFactory) {

  var reportCache;

  if(!CacheFactory.get('reportCache')) {
    reportCache = CacheFactory('reportCache', {
      storageMode: 'localStorage'
    });
  }
  else {
    reportCache = CacheFactory.get('reporCache');
  }

  var fillReportCache = function() {

    var reportArray = [];

    reportCache.put('reports', reportArray);
  };

  return {
    fillReportCache: fillReportCache
  };
})

.factory('myStocksCacheService', function(CacheFactory) {

  var myStocksCache = CacheFactory.get('myStocksCache');

  return myStocksCache;
})

.factory('openPositionsCacheService', function(CacheFactory) {

  var openPositionsCache = CacheFactory.get('openPositionsCache');

  return openPositionsCache;
})

.factory('reportCacheService', function(CacheFactory) {

  var reportCache = CacheFactory.get('reportCache');

  return reportCache;
})

.factory('openPositionsArrayService', function(fillOpenPositionsCacheService, openPositionsCacheService) {

  if(!openPositionsCacheService.info('openPositions')) {
    fillOpenPositionsCacheService.fillOpenPositionsCache();
  }

  var openPositions = openPositionsCacheService.get('openPositions');

  return openPositions;
})

.factory('reportArrayService', function(fillReportCacheService, reportCacheService) {

  if(!reportCacheService.info('reports')) {
    fillReportCacheService.fillReportCache();
  }

  var reports = reportCacheService.get('reports');

  return reports;
})

.factory('myStocksArrayService', function(fillMyStocksCacheService, myStocksCacheService) {

  if(!myStocksCacheService.info('myStocks')) {
    fillMyStocksCacheService.fillMyStocksCache();
  }

  var myStocks = myStocksCacheService.get('myStocks');

  return myStocks;
})


.factory('notesCacheService', function(CacheFactory) {

  var notesCache;

  if(!CacheFactory.get('notesCache')) {
    notesCache = CacheFactory('notesCache', {
      storageMode: 'localStorage'
    });
  }
  else {
    notesCache = CacheFactory.get('notesCache');
  }

  return notesCache;
})

.factory('newsService', function($q, $http) {

  return {

    getNews: function(ticker) {

      var deferred = $q.defer(),

      x2js = new X2JS(),

      url = "http://finance.yahoo.com/rss/headline?s=" + ticker;

      $http.get(url)
        .success(function(xml) {
          var xmlDoc = x2js.parseXmlString(xml),
          json = x2js.xml2json(xmlDoc),
          jsonData = json.rss.channel.item;
          deferred.resolve(jsonData);
        })
        .error(function(error) {
          deferred.reject();
          console.log("News error: " + error);
        });

      return deferred.promise;
    }
  };
})


.factory('notesService', function(notesCacheService, userService) {

  return {

    getNotes: function(ticker) {
      return notesCacheService.get(ticker);
    },

    addNote: function(ticker, note) {

      var stockNotes = [];

      if(notesCacheService.get(ticker)) {
        stockNotes = notesCacheService.get(ticker);
        stockNotes.push(note);
      }
      else {
        stockNotes.push(note);
      }

      notesCacheService.put(ticker, stockNotes);

      if(userService.getUser()) {
        var notes = notesCacheService.get(ticker);
        userService.updateNotes(ticker, stockNotes);
      }
    },

    deleteNote: function(ticker, index) {

      var stockNotes = [];

      stockNotes = notesCacheService.get(ticker);
      stockNotes.splice(index, 1);
      notesCacheService.put(ticker, stockNotes);

      if(userService.getUser()) {
        var notes = notesCacheService.get(ticker);
        userService.updateNotes(ticker, stockNotes);
      }
    }
  };
})

.factory('stockDataService', function($q, $http, encodeURIService, stockPriceCacheService){

  var getDetailsData = function(ticker) {
    var deferred = $q.defer(),
    query = 'select * from yahoo.finance.quotes where symbol IN ("' + ticker + '")',
    url = 'https://query.yahooapis.com/v1/public/yql?q=' + encodeURIService.encode(query) + '&format=json&env=http://datatables.org/alltables.env';
    url2 = "https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20yahoo.finance.quotes%20where%20symbol%20in%20(%22"+ ticker +"%22)&format=json&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys&callback=";
// added a second url variable after the first one started throwing errors.

    $http.get(url2)
      .success(function(json) {
        var jsonData = json.query.results.quote;
        deferred.resolve(jsonData);
      })
      .error(function(error) {
        console.log("Details data error: " + error);
        deferred.reject();
      });

      return deferred.promise;
  };

  var getPriceData = function(ticker){
    var deferred = $q.defer(),
    cacheKey = ticker,
    url = "http://finance.yahoo.com/webservice/v1/symbols/" + ticker + "/quote?format=json&view=detail";


    $http.get(url)
      .success(function(json) {
        // console.log(jsonData.data.list.resources[0].resource.fields);
        var jsonData = json.list.resources[0].resource.fields;
        deferred.resolve(jsonData);
        stockPriceCacheService.put(cacheKey, jsonData);
      })
      .error(function(error) {
        console.log("Price data error: " + error);
        deferred.reject();
      });

      return deferred.promise;
  };

  return {
    getPriceData: getPriceData,
    getDetailsData: getDetailsData
  };
})

.factory('searchService', function($q, $http) {

    return {

      search: function(query) {

        var deferred = $q.defer(),

          // sometimes I have to copy and repaste the string below into the
          // url variable for it to work. Not sure why that is.
          // https://s.yimg.com/aq/autoc?query=aapl&region=CA&lang=en-CA
          url = 'https://s.yimg.com/aq/autoc?query=' + query + '&region=CA&lang=en-CA&callback=JSON_CALLBACK';

        $http.jsonp(url)
          .success(function(data) {
            var jsonData = data.ResultSet.Result;
            deferred.resolve(jsonData);
          })
          .catch(function(error) {
            console.log(error);
          });

        return deferred.promise;
      }
    };
  })

;
