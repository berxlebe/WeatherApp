var weatherApp = angular.module('weatherApp',[]);
weatherApp.controller('weatherCntrl', ['$scope', '$http', 'weatherLocale', 'fiveDay', function($scope,$http, weatherLocale, fiveDay) {
  /*arrays to store weather data received*/
  $scope.weatherForecastData = [];
  $scope.weatherIndex = 0;
  $scope.fiveDay=[];
  $scope.currentW={};


/*default values if user refuses location access*/
  $scope.localePretty=""; // location name displayed
  $scope.coord = {"lat":41.8819283, "lon":-87.6445473, };  //Coordinates of current weather

  /*function to return index of already fetched data if data is still valid*/
  $scope.checkDataStore=function(locale){
     while($scope.weatherForecastData.length>0){
         if($scope.weatherForecastData[0].checkFresh()<0){
            $scope.weatherForecastData.shift();
         }
         else{
             break;
         }
     }
     for(var i =0; i<$scope.weatherForecastData.length; i++){
        if($scope.weatherForecastData[i].locale == locale){ /* stored data found for searched location*/
                return i;
        }
    }
         /*no stored data found*/
         return -1;
  }; 
  $scope.getWeather=function(){
      locale="lat="+$scope.coord.lat+"&lon="+$scope.coord.lon;      


      var result=$scope.checkDataStore(locale); // we will only query the api if the data is stale
      if(result>=0){
          $scope.weatherIndex = result;
          return;
      }
      $http({ // get weather forecast for chosen location 
        method: 'GET',
        url: 'http://api.openweathermap.org/data/2.5/forecast?' + locale + '&units=imperial&APPID=18ef13e9cf0755705c69c038cebea935',
    }).then(function(response){
        var weatherObj = new weatherLocale(locale);
        $scope.weatherForecastData.push(weatherObj);
        $scope.weatherIndex = $scope.weatherForecastData.length - 1;
        var index = $scope.weatherIndex;
        $scope.weatherForecastData[index].fiveday = new fiveDay(response.data);
        $http({  // get current weather for chosen location
            method: 'GET',
            url: 'http://api.openweathermap.org/data/2.5/weather?' + locale + '&units=imperial&APPID=18ef13e9cf0755705c69c038cebea935',
        }).then(function(response){
            $scope.weatherForecastData[index].CurrentData = response.data;
        });
    });
  };

  /*function converts user input to latitude/longitude*/
  $scope.updateLocale=function(){
        $http.get('http://maps.googleapis.com/maps/api/geocode/json?address='+$scope.localePretty).then(function(res){
            /*set initial locale to be current zipcode*/
            $scope.localePretty = res.data.results["0"].formatted_address;
            $scope.coord.lon = res.data.results["0"].geometry.location.lng;
            $scope.coord.lat = res.data.results["0"].geometry.location.lat;
            $scope.getWeather();
        });
  };
  
     
    $scope.showLocation = function (pos) {
        /*set longitude and latitude to use for fetching weather*/
        $scope.coord.lon = pos.coords.longitude;
        $scope.coord.lat = pos.coords.latitude;
        /*query google APIs to get displayable address to match coordinates*/
        $http.get('http://maps.googleapis.com/maps/api/geocode/json?latlng='+pos.coords.latitude+','+pos.coords.longitude).then(function(res){
            /*set initial locale to be current address*/
            var str = res.data.results["0"].formatted_address;
            /* pare off street level address data to not look so creepy*/
            $scope.localePretty = str.substring(str.indexOf(",") + 1);
            $scope.getWeather();
        });
    };
    $scope.fallback = function (error) {
        /*query google APIs to get displayable address to match coordinates*/
        $http.get('http://maps.googleapis.com/maps/api/geocode/json?latlng='+$scope.coord.lat+','+$scope.coord.lon).then(function(res){
            //set initial locale to be current address
            var str = res.data.results["0"].formatted_address;
            // pare off street level address data to not look so creepy
            $scope.localePretty = str.substring(str.indexOf(",") + 1);
            $scope.getWeather();
        });
    };
    
    /*function to check users current location */           
    $scope.getLocation = function () {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition($scope.showLocation, $scope.fallback);
        }
        else{
            $scope.localePretty="Chicago,IL 60661";
        }
    };
 
    $scope.getLocation();

}]);		



weatherApp.filter('urlGet', function() {
  return function(input, night) {
    input = input || '';
    var out = '';
    var imgNum;
    var id = parseInt(input);
    if(id<300){
        imgNum = "11";
    }
    else if(id<500){
        imgNum = "09";
    }
    else if(id<=504){
        imgNum = "10";
    }
    else if(id<=531){
        imgNum = "09";
    }
    else if(id<700){
        imgNum = "13";
    }
    else if(id<800){
        imgNum = "50";
    }
    else if(id==800){
            imgNum = "01";
    }
    else if(id==801){
        imgNum = "02";
    }
    else if(id==802){
        imgNum = "03";
    }
    else if(id==803 || id==804){
        imgNum = "04";
    }
    else{
        return null;
    }
    // conditional based on optional argument
    if (night) {
      out = "http://openweathermap.org/img/w/" + imgNum + "n.png";
    }
    else{
      out = "http://openweathermap.org/img/w/" + imgNum + "d.png";
        
    }
    return out;
  };
})

//weatherApp.factory('weatherLocale', ['fiveDayFactory', 'oneDayFactory', function weatherLocaleFactory(fiveDayFactory, oneDayFactory) {
weatherApp.factory('weatherLocale', [ function weatherLocaleFactory() {

  var loc = function(locale){
    this.timeStamp = new Date();
    this.locale=locale;
    this.fiveday = {};
    this.CurrentData = {};
      
  }

  loc.prototype.checkFresh=function(){
      var date = new Date();
      if(date.getTime() > (this.timeStamp.getTime() + 600000)){
          return -1;
      }
      return 1
  }

  return loc;
}]);

weatherApp.factory('fiveDay', [function fiveDayFactory() {

  var parseData = function(data){
      var day = data.list["0"].dt_txt.split(" ")[0].split("-")[2];
      var retArr=[];
      var dayCount = 0;
      var dayHi = data.list["0"].main.temp;
      var dayLo = data.list["0"].main.temp;
      var dayid = []
      for(i=0;i<data.list.length;i++){
          if(day !=data.list[i.toString()].dt_txt.split(" ")[0].split("-")[2]){
              indexMax = 0;
              maxCount = 0;
              for(j=0;j<dayid.length;j++){
                 if(dayid[j].count>maxCount)
                    indexMax=j;
                    maxCount = dayid[j].count
              }
              retArr[dayCount]={
                  "hi":dayHi,
                  "lo":dayLo, 
                  "desc":dayid[indexMax].desc,
                  "id":dayid[indexMax].id,
                  "date": data.list[i.toString()].dt_txt.split(" ")[0]
                  };
              dayHi = data.list[i.toString()].main.temp;
              dayLo = data.list[i.toString()].main.temp;
              dayid = [];
              dayCount++;
              day= data.list[i.toString()].dt_txt.split(" ")[0].split("-")[2];
          }
          else{
              if(dayHi < data.list[i.toString()].main.temp){
                  dayHi=data.list[i.toString()].main.temp;
              }
              if(dayLo > data.list[i.toString()].main.temp){
                  dayLo=data.list[i.toString()].main.temp;
              }
              for(j=0; j<data.list[i.toString()].weather.length;j++){
                  index = dayid.find(function( obj ) { 
                      return obj.id === data.list[i.toString()].weather[j.toString()].id;
                  });
                  if(index){
                      dayid[index.key].count++;
                  }
                  else{
                       dayid.push({
                            "id" : data.list[i.toString()].weather[j.toString()].id,
                            "desc" : data.list[i.toString()].weather[j.toString()].description,
                            "count" : 1
                        });
                        key = dayid.length-1;
                        dayid[key].key = key;
                     
                  }
                  
              }                  
          }
         
      }

    return retArr;  
  };

  var five = function(data){
      this.data=data;
      this.days=parseData(data);
  }

  return five;
}]);

