# WeatherApp
Application that displays the local weather or weather of a requested location

I have deployed the app at http://www.marchmegapool.com/weather_app.html so you can go there directly to run 
the app or download all three files and run them locally from the same directory.

To use the app, on load it will populate with weather for the current location, or the default if location
access is denied.  To fetch data for a new location enter the location in the text input under "Enter your destination" then click
the get weather button.  Once clicked the weather should update.  Some notes, the page will not reload when updating the weather, also
if the data has already been searched for in the past 10 minutes the data will be reused to avoid bombarding the weather service per
their request.

The app uses APIs from http://openweathermap.org 


