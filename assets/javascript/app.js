
	var autocomplete;
	var place = {}, lat, lng, latlng;
    var map, infowindow, marker, infowindowContent;
    var city, state, aqi;
    
    //get city and state from address
    function getLocalidad(array){
        var localidad = {};
        for (var i = 0; i < array.length; i++) {
            if (array[i].types[0] === 'locality') {
                localidad.city = array[i].short_name;
            }
            if (array[i].types[0] === "administrative_area_level_1") {
                localidad.state = array[i].short_name;
            }
        }
        return localidad;
    }

	function initAutocomplete() {
            // Create the map
        map = new google.maps.Map(document.getElementById('googleMap'),{
            center: {lat: 37.1, lng: -95.7},
            zoom: 3,
            mapTypeControl: false,
            panControl: false,
            zoomControl: false,
            streetViewControl: false
        });

        //change the map size when window resize
        google.maps.event.addDomListener(window, "resize", function() {
            var center = map.getCenter();
            google.maps.event.trigger(map, "resize");
            map.setCenter(center);
        });

    	// Create the autocomplete object, restricting the search to geographical
        // location types.
        autocomplete = new google.maps.places.Autocomplete(
        	(document.getElementById("location")),
            {types: ['geocode'],
            country: 'us'
        });

        infowindow = new google.maps.InfoWindow();
        infowindowContent = document.getElementById('infowindow-content');
        infowindow.setContent(infowindowContent);
        marker = new google.maps.Marker({
            map: map,
            anchorPoint: new google.maps.Point(0, -29)
        });

        // When the user selects an location from the dropdown, get de geometry location (lat,lng).
        autocomplete.addListener('place_changed', function(){
            infowindow.close();
            marker.setVisible(false);
            $(".text-danger").remove();
            // Get the location from the autocomplete object.
            place = autocomplete.getPlace();
            var location = $("#location");
            
            if(!place.geometry){
                location.after('<p class= text-danger>Please enter a valid location.</p>');
                return;
            }

            if(place.geometry.viewport){
                map.fitBounds(place.geometry.viewport);
            }else{
                map.setCenter(place.geometry.location);
                map.setZoom(14);
            }

            marker.setPosition(place.geometry.location);
            marker.setVisible(true);

            lat = place.geometry.location.lat();
            lng = place.geometry.location.lng();
            
            //Get the state from the location
            var localidad = getLocalidad(place.address_components);

            getBOM(lat, lng);
            getProPublica(localidad.state);  
            getWeatherInfo(localidad.city);   
        });
    }


    //get breezeOmeter data
    function getBOM (lat, lng) {   
        var fields = "&fields=breezometer_aqi,random_recommendations,breezometer_color,breezometer_description,pollutants"           
        var queryURL = 'https://api.breezometer.com/baqi/?lat='+lat+'&lon='+lng+'&key=de4fef0f7fb349f29f3f21c275018069' + fields;
        $.ajax({
            url: queryURL, 
            method: 'GET',
        }).done(function(response) {
            aqi = parseInt(response.breezometer_aqi);
          
            var recoChildren = response.random_recommendations.children;
            var recoHealth = response.random_recommendations.health;
            var recInside = response.random_recommendations.inside;
            var recOutside = response.random_recommendations.outside;
            var recSport = response.random_recommendations.sport;

            var co = response.pollutants.co.concentration;
            var coDesc = response.pollutants.co.pollutant_description;
            var no2 = response.pollutants.no2.concentration;
            var no2Desc = response.pollutants.no2.pollutant_description;
            var o3 = response.pollutants.o3.concentration;
            var o3Desc = response.pollutants.o3.pollutant_description;

            var description;
            $('#aqi').text(aqi);
            if(aqi < 51)
                description = "Good";
            else if (aqi < 101)
                description = "Moderate";
            else if (aqi < 151)
                description = "Unhealthy for Sensitive Groups"
            else if(aqi < 201)
                description = "Unhealthy"
            else if(aqi < 301)
                description = "Very Unhealthy";
            else description = "Hazardous";

            $('#air').text(description);
            $('#co').text(co);
            $('#no2').text(no2);
            $('#ozone').text(o3);
            $('#aqi-info').show();
                      
            var aqRecommendation = $("#aqRecommendation");
            aqRecommendation.empty();
            
            aqRecommendation.show();
            p = $("<p>").html("<strong>Children: </strong>" + recoChildren);
            aqRecommendation.append(p);

            p = $("<p>").html("<strong>Health: </strong>" + recoHealth);
            aqRecommendation.append(p);

            p = $("<p>").html("<strong>Inside: </strong>" + recInside);
            aqRecommendation.append(p);
            
            p = $("<p>").html("<strong>Outside: </strong>" + recOutside);
            aqRecommendation.append(p);
            
            p = $("<p>").html("<strong>Sport: </strong>" + recSport);
            aqRecommendation.append(p);

            infowindowContent.children['aqiValue'].textContent = "AQI: " + aqi;
            infowindow.open(map, marker);
        });
    };

    function getProPublica(state){
        var senatorOne;
        var senatorTwo;
         $.ajax({
            url: "https://api.propublica.org/congress/v1/members/senate/" + state + "/current.json",
            type: "GET",
            dataType: 'json',
            headers: {'X-API-Key': 'GGL4y5FC2p9Eea8fAmrR16BZOg90Xott8D8D6NVU'}
        }).done(function(data){
            var senators = $("#senators");
            var p = $("<p>").text(data.results[0].name + " | " + data.results[1].name);
            senators.html(p);
            
            senatorOne = data.results[0].twitter_id;
            senatorTwo = data.results[1].twitter_id;

            var dataVia = senatorTwo +" @" + senatorOne;
            var link = document.createElement('a');
            link.setAttribute('href', 'https://twitter.com/share');
            link.setAttribute('class', 'twitter-share-button');
            link.setAttribute('style', 'margin-top:5px;');
            link.setAttribute('data-via', dataVia);

            link.setAttribute("data-text" , "Our Air Quality is at " + aqi + " that's unacceptable" );
            link.setAttribute("data-hashtags" , "megaPollution" + " #fixItNow" );
            $('#twitterB').html(link);
            twttr.widgets.load();  //very important

            $('#senators-panel').show(); 
        });
    }

    // Fetch the user profile data from facebook
    function getFBUserData(){
        FB.api('/me', {locale: 'en_US', fields: 'id,first_name,last_name,email'},
        function (response) {
            document.getElementById('welcome').innerHTML = 'Welcome, ' + response.first_name+' '+response.last_name;
            //document.getElementById('welcome').style.display = 'inline';
        });
    }

    function getWeatherInfo (city){
        if(city){
            var weatherApiKey = "db47186cb076286534ca88481910d2ef";
            $('#weather').html($('<h2 id="weather-city">').html(city));

            $.ajax({
                url: "http://api.openweathermap.org/data/2.5/weather?q=" + city + "&units=imperial&appid=" + weatherApiKey,
                type: "GET",
                dataType :'JSON'

            }).done(function(response) {
                $('#weather').append($('<h1 id="temp">').html(Math.round(response.main.temp) + '&#8457;'));

                var table = $('<table class="table">');
                var tbody = $('<tbody>');
                var tr = $('<tr>');

                tr.append('<td>Wind Speed</td>');
                tr.append('<td>' + response.wind.speed + ' mph</td>');
                tbody.append(tr);

                tr = $('<tr>');
                tr.append('<td>Humidity</td>');
                tr.append('<td>' + response.main.humidity + ' %</td>');
                tbody.append(tr);

                tr = $('<tr>');
                tr.append('<td>Current Weather</td>');
                tr.append('<td>' + response.weather[0].description + '</td>');
                tbody.append(tr);
                
                table.append(tbody);
                $('#weather').append(table);
            });
        } else {
            $('#weather').html('<p class="text-center">No data available for current location</p>')
        }
    }

$(document).ready(function(){
    window.fbAsyncInit = function() {
        // FB JavaScript SDK configuration and setup
        FB.init({
          appId      : '633563123501014', // FB App ID
          cookie     : true,  // enable cookies to allow the server to access the session
          xfbml      : true,  // parse social plugins on this page
          version    : 'v2.8' // use graph api version 2.8
        });
        
        // Check whether the user already logged in
        FB.getLoginStatus(function(response) {
            if (response.status === 'connected') {
                document.getElementById('main').style.display = 'block';
                document.getElementById('logout').style.display = 'inline';
                //display user data
                getFBUserData();
            } else {
                window.location.replace('index.html');
            }
        });
    };

    // Load the JavaScript SDK asynchronously
    (function(d, s, id) {
        var js, fjs = d.getElementsByTagName(s)[0];
        if (d.getElementById(id)) return;
        js = d.createElement(s); js.id = id;
        js.src = "//connect.facebook.net/en_US/sdk.js";
        fjs.parentNode.insertBefore(js, fjs);
    }(document, 'script', 'facebook-jssdk'));
    
    
    $("#cur-location").on('click', function(event){
        event.preventDefault();
        $('#aqi-info').hide();
        $('#aqRecommendation').hide();
        $('#loading').show();
        $('#location').val('');

        

        navigator.geolocation.getCurrentPosition(function(result){
            
            var geocoder = new google.maps.Geocoder;
            latlng = {lat:result.coords.latitude, lng:result.coords.longitude};
            

            geocoder.geocode({'location': latlng}, function(response){
               
                city = response[0].address_components[2].short_name;
                state = response[0].address_components[4].short_name;
               
                getBOM(result.coords.latitude, result.coords.longitude);
                getProPublica(state);
                getWeatherInfo(city); 
                marker.setPosition(latlng);
                map.setZoom(14);
                $('#loading').hide();
            });  
        });
    });

    $('#logout').on('click', function(){
        // Logout from facebook
        FB.logout(function() {
            window.location.replace('index.html');
        });
    });
    
    $("#share").jsSocials({
        showLabel: false,
        showCount: false,
        shares: ["facebook", "email", "twitter", "googleplus", "linkedin", "stumbleupon"]
    });
})