angular.module('LSEInvest.filters', [])

// All of the Filters listed below are *externally* sourced.
// They are used to format text and numeric values.

.filter('characters', function () {
  return function (input, chars, breakOnWord, ellipsis) {
    if (isNaN(chars)) return input;
    if (chars <= 0) return '';
    if (input && input.length > chars) {
      input = input.substring(0, chars);

      if (!breakOnWord) {
        var lastspace = input.lastIndexOf(' ');
        //get last space
        if (lastspace !== -1) {
            input = input.substr(0, lastspace);
        }
      }
      else {
        while(input.charAt(input.length-1) === ' '){
            input = input.substr(0, input.length -1);
        }
      }

      if(ellipsis) return input + '…';
      if(!ellipsis) return input;
    }
    return input;
  };
})


.filter("shrinkNumber", function($filter) {
  return function(number, fractionSize) {

    if(number === null) return null;
    if(number === 0) return "0";

    // default number of decimals for values >1000 or <-1000 if not set in view
    if(!fractionSize || fractionSize < 0)
        fractionSize = 1;

    var abs = Math.abs(number);
    var rounder = Math.pow(10,fractionSize);
    var isNegative = number < 0;
    var key = '';
    var powers = [
        {key: "Q", value: Math.pow(10,15)},
        {key: "T", value: Math.pow(10,12)},
        {key: "B", value: Math.pow(10,9)},
        {key: "M", value: Math.pow(10,6)},
        {key: "K", value: 1000}
    ];

    for(var i = 0; i < powers.length; i++) {

        var reduced = abs / powers[i].value;

        reduced = Math.round(reduced * rounder) / rounder;

        if(reduced >= 1){
            abs = reduced;
            key = powers[i].key;
            break;
        }
    }

    if(number >= 1000) {
      return abs + key;
    }
    else if(number <= -1000) {
      return '-' + abs + key;
    }
    else {
      return $filter('number')(((isNegative ? '-' : '') + abs + key), 3);
    }
  };
})

;
