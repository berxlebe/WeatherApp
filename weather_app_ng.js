var weatherApp = angular.module('weatherApp',[]);
weatherApp.controller('weatherCntrl', ['$scope', '$http', function($scope,$http) {
  /*arrays to store weather data received*/
  $scope.weatherForecastData = [];
  $scope.weatherCurrentData = [];
  $scope.weatherIndex = 0;
  $scope.fiveDay=[];
  $scope.currentW={};


/*default values if user refuses location access*/
  $scope.locale=""; // location name displayed
  $scope.coord = {"lat":41.8819283, "lon":-87.6445473, };  //Coordinates of current weather
  $scope.getURL=function(id){
      var url;
        if(id<300){
            url = "http://openweathermap.org/img/w/11d.png";
        }
        else if(id<500){
            url = "http://openweathermap.org/img/w/09d.png";
        }
        else if(id<=504){
            url = "http://openweathermap.org/img/w/10d.png";
            
        }
         else if(id<=531){
            url = "http://openweathermap.org/img/w/09d.png";
        }
       else if(id<700){
            url = "http://openweathermap.org/img/w/13d.png";
            
        }
        else if(id<800){
            url = "http://openweathermap.org/img/w/50d.png";
            
        }
        else if(id==800){
            url = "http://openweathermap.org/img/w/01d.png";
            
        }
        else if(id==801){
            url = "http://openweathermap.org/img/w/02d.png";
            
        }
        else if(id==802){
            url = "http://openweathermap.org/img/w/03d.png";
            
        }
        else if(id==803 || id==804){
            url = "http://openweathermap.org/img/w/01d.png";
            
        }
        else{
            url=null;
        }
        return url;
    };
  $scope.compile1day=function(){
      $scope.currentW.id = $scope.weatherCurrentData[$scope.weatherIndex.toString()].weather["0"].id;
      $scope.currentW.temp = $scope.weatherCurrentData[$scope.weatherIndex.toString()].main.temp;
      $scope.currentW.humid = $scope.weatherCurrentData[$scope.weatherIndex.toString()].main.humidity;
      $scope.currentW.wind = $scope.weatherCurrentData[$scope.weatherIndex.toString()].wind.speed;
      $scope.currentW.desc = $scope.weatherCurrentData[$scope.weatherIndex.toString()].weather["0"].description;
      $scope.currentW.url = $scope.getURL($scope.currentW.id);
  };

  $scope.compileFiveDay=function(){
      var day = $scope.weatherForecastData[$scope.weatherIndex.toString()].data.list["0"].dt_txt.split(" ")[0].split("-")[2];
      var dayCount = 0;
      var dayHi = $scope.weatherForecastData[$scope.weatherIndex.toString()].data.list["0"].main.temp;
      var dayLo = $scope.weatherForecastData[$scope.weatherIndex.toString()].data.list["0"].main.temp;
      var dayDesc = $scope.weatherForecastData[$scope.weatherIndex.toString()].data.list["0"].weather["0"].description;
      var dayid = $scope.weatherForecastData[$scope.weatherIndex.toString()].data.list["0"].weather["0"].id;
      for(i=0;i<$scope.weatherForecastData[$scope.weatherIndex.toString()].data.list.length;i++){
          if(day !=$scope.weatherForecastData[$scope.weatherIndex.toString()].data.list[i.toString()].dt_txt.split(" ")[0].split("-")[2]){
          $scope.fiveDay[dayCount]={
                  "hi":dayHi,
                  "lo":dayLo, 
                  "desc":dayDesc,
                  "id":dayid,
                  "date": $scope.weatherForecastData[$scope.weatherIndex.toString()].data.list[i.toString()].dt_txt.split(" ")[0],
                  "url":$scope.getURL(dayid)
                  };
              dayHi = $scope.weatherForecastData[$scope.weatherIndex.toString()].data.list[i.toString()].main.temp;
              dayLo = $scope.weatherForecastData[$scope.weatherIndex.toString()].data.list[i.toString()].main.temp;
              dayDesc = $scope.weatherForecastData[$scope.weatherIndex.toString()].data.list[i.toString()].weather["0"].description;
              dayid = $scope.weatherForecastData[$scope.weatherIndex.toString()].data.list[i.toString()].weather["0"].id;
              dayCount++;
              day= $scope.weatherForecastData[$scope.weatherIndex.toString()].data.list[i.toString()].dt_txt.split(" ")[0].split("-")[2];
          }
          else{
              if(dayHi < $scope.weatherForecastData[$scope.weatherIndex.toString()].data.list[i.toString()].main.temp){
                  dayHi=$scope.weatherForecastData[$scope.weatherIndex.toString()].data.list[i.toString()].main.temp;
              }
              if(dayLo > $scope.weatherForecastData[$scope.weatherIndex.toString()].data.list[i.toString()].main.temp){
                  dayLo=$scope.weatherForecastData[$scope.weatherIndex.toString()].data.list[i.toString()].main.temp;
              }
                  
          }
         
      }
  };
  /*function to return index of already fetched data if data is still valid*/
  $scope.checkDataStore=function(locale){
     for(var i =0; i<$scope.weatherForecastData.length; i++){
         if($scope.weatherForecastData[i].locale == locale){ /* stored data found for searched location*/
            var date = new Date();
            if(date.getTime() > ($scope.weatherForecastData[i].timestamp.getTime() + 600000)){
                /* data over 10 minutes old will be considered stale and removed*/
                $scope.weatherForecastData.splice(i,1);
                return -1;
            }
            else{/*valid data found return the index*/
                return i;
            }
         }
         /*no stored data found*/
         return -1;
     } 
     /*no data stored at all*/
     return -1;
  };  
  $scope.getWeather=function(){
      locale="lat="+$scope.coord.lat+"&lon="+$scope.coord.lon;      


      var result=$scope.checkDataStore(locale); // we will only query the api if the data is stale
      if(result>=0){
          $scope.weatherIndex = result;
          $scope.compileFiveDay();
          $scope.compile1day();
          return;
      }
      $http({ // get weather forecast for chosen location 
        method: 'GET',
        url: 'http://api.openweathermap.org/data/2.5/forecast?' + locale + '&units=imperial&APPID=18ef13e9cf0755705c69c038cebea935',
    }).then(function(response){
        var weatherObj = {"locale":"lat="+$scope.coord.lat+"&lon="+$scope.coord.lon, "data":response.data, "timestamp":new Date()};
        $scope.weatherForecastData.push(weatherObj);
        $scope.weatherIndex = $scope.weatherForecastData.length - 1;
        $scope.compileFiveDay();
    });
      $http({  // get current weather for chosen location
        method: 'GET',
        url: 'http://api.openweathermap.org/data/2.5/weather?' + locale + '&units=imperial&APPID=18ef13e9cf0755705c69c038cebea935',
    }).then(function(response){
        $scope.weatherCurrentData.push(response.data);
        $scope.compile1day();
    });
  };

  /*function converts user input to latitude/longitude*/
  $scope.updateLocale=function(){
        $http.get('http://maps.googleapis.com/maps/api/geocode/json?address='+$scope.locale).then(function(res){
            /*set initial locale to be current zipcode*/
            $scope.locale = res.data.results["0"].formatted_address;
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
            $scope.locale = str.substring(str.indexOf(",") + 1);
            $scope.getWeather();
        });
    };
    $scope.fallback = function (error) {
        /*query google APIs to get displayable address to match coordinates*/
        $http.get('http://maps.googleapis.com/maps/api/geocode/json?latlng='+$scope.coord.lat+','+$scope.coord.lon).then(function(res){
            //set initial locale to be current address
            var str = res.data.results["0"].formatted_address;
            // pare off street level address data to not look so creepy
            $scope.locale = str.substring(str.indexOf(",") + 1);
            $scope.getWeather();
        });
    };
    
    /*function to check users current location */           
    $scope.getLocation = function () {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition($scope.showLocation, $scope.fallback);
        }
        else{
            $scope.locale="Chicago,IL 60661";
        }
    };
 
    $scope.getLocation();

}]);		



