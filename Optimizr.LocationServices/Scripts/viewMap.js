/// <reference path="jquery-1.10.2.js" />
var map = null, marker = null;
var lat = 0, lon = 0, WeatherContent = 0;
var timestamp = 0, isLocal = false;

function ShowCurrentPosition(currPos) {
    var latLon = new google.maps.LatLng(currPos.coords.latitude, currPos.coords.longitude);
    var mapProp = {
        center: latLon,
        zoom: 3,
        draggable: true
    };
    map = new google.maps.Map(document.getElementById("mapDiv"), mapProp);
    marker = new google.maps.Marker({ position: latLon, map: map, title: "You are here!" });
    map.addListener('click', OnMapClick);
    GetWeatherData(latLon);
}

function OnMapClick(mouseEvent) {
    marker.setMap(null);
    marker = new google.maps.Marker({ position: mouseEvent.latLng, map: map, title: "You clicked here!" });
    GetWeatherData(mouseEvent.latLng);
}

function GetWeatherData(latLng) {
    lat = latLng.lat();
    lon = latLng.lng();
    var url = "http://api.openweathermap.org/data/2.5/weather?lat=" + latLng.lat() + "&lon=" + latLng.lng() + "&appid=" + weatherAPIKey + "&units=metric";
    $.get(url, OnWeatherReceived, "json");
}

function OnWeatherReceived(weatherContent) {
    WeatherContent = weatherContent;
    GetLocalTime();
}

function GetLocalTime() {
    var llString = lat + "," + lon;
    var date = new Date();
    timestamp = date.getTime() / 1000 + date.getTimezoneOffset() * 60;
    var url = "https://maps.googleapis.com/maps/api/timezone/json?location=" + llString + "&timestamp=" + timestamp + "&key=" + timeZoneKey;
    $.get(url, OnLocalTimeReceived, "json");
}

function OnLocalTimeReceived(timeInfo) {
    var destDate = new Date();
    if (timeInfo.status != null && timeInfo.status.indexOf("OK") >= 0) {
        var sumOfOffsets = timeInfo.dstOffset * 1000 + timeInfo.rawOffset * 1000;
        destDate = new Date(timestamp * 1000 + sumOfOffsets);
        isLocal = true;
    }
    var infoWindow = new google.maps.InfoWindow({
        content: infoWindowDiv(WeatherContent, destDate)
    });
    infoWindow.open(map, marker);
    marker.addListener('click', function () {
        infoWindow.open(map, marker);
    });
}

function ShowError(error) {
    switch (error.code) {
        case error.PERMISSION_DENIED:
            alert("User denied the request for location services");
            break;
        case error.POSITION_UNAVAILABLE:
            alert("Location info is unavailable");
            break;
        case error.TIMEOUT:
            alert("The request for location timed out");
            break;
        case error.UNKNOWN_ERROR:
            alert("Unknown error occurred");
            break;
    }
}

function infoWindowDiv(weatherContent, localDate) {
    var body = "";
    if (isLocal) {
        body = "<p>Current Date Time: " + localDate.toLocaleString() + "</p>";
    } else {
        body = "<p>UTC Date Time: " + localDate.toUTCString() + "</p>";
    }
    body += "<p>Weather: " + weatherContent.weather[0].main + " (" + weatherContent.weather[0].description + ")</p>";
    body += "<p>Humidity: " + weatherContent.main.humidity + "% </p>";
    body += "<p>Temp: " + weatherContent.main.temp + " deg C</p>";
    body += "<p>Wind Speed: " + weatherContent.wind.speed + " m/sec </p>";
    return '<div id="content"><h3 id="firstHeading" class="firstHeading">' + weatherContent.name + '</h3><div id="bodyContent">' + body + '</div></div>';
}
