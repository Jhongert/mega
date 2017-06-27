
	var autocomplete;
	var place = {}, lat, lng;
    var map, infowindow, marker, infowindowContent;

    function getState(array){
        for (var i = 0; i < array.length; i++) {
            if (array[i].types[0] === "administrative_area_level_1") {
                var state = array[i].short_name;
                return state;
            }
        }
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
                map.setZoom(8);
            }

            marker.setPosition(place.geometry.location);
            marker.setVisible(true);

            lat = place.geometry.location.lat();
            lng = place.geometry.location.lng();
            
            //Get the state from the location
            var state = getState(place.address_components);

            getBOM(lat, lng);
            getProPublica(state);      
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
            var aqi = response.breezometer_aqi;
            var color = response.breezometer_color;
            var description = response.breezometer_description;
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

            $('#aqi').text(aqi);
            $('#air').text(description);
            $('#co').text(co);
            $('#no2').text(no2);
            $('#ozone').text(o3);

            //console.log("Color: " + color);
           
            var aqRecommendation = $("#aqRecommendation");
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
            infowindowContent.children['aqiDescription'].textContent = description;
            infowindow.open(map, marker);
        });
    };

    function getProPublica(state){
        $.ajax({
            url: "https://api.propublica.org/congress/v1/members/senate/" + state + "/current.json",
            type: "GET",
            dataType: 'json',
            headers: {'X-API-Key': 'GGL4y5FC2p9Eea8fAmrR16BZOg90Xott8D8D6NVU'}
        }).done(function(data){
            $.ajax({
                url: data.results[0].api_uri,
                type: "GET",
                dataType: 'json',
                headers: {'X-API-Key': 'GGL4y5FC2p9Eea8fAmrR16BZOg90Xott8D8D6NVU'}
            }).done(function(data){
                var result = data.results[0];
                var firstSenator = $("#first-senator");
                var p = $("<p>").text("Name: " + result.first_name + " " + result.middle_name + " " +result.last_name);
                firstSenator.append(p);

                p = $("<p>").text("Website: ");
                a = $("<a>");
                a.text(result.url).attr({href: result.url, target: "_blank"});
                p.append(a);
                firstSenator.append(p);

            });

            $.ajax({
                url: data.results[1].api_uri,
                type: "GET",
                dataType: 'json',
                headers: {'X-API-Key': 'GGL4y5FC2p9Eea8fAmrR16BZOg90Xott8D8D6NVU'}
            }).done(function(data){
                console.log(data);
                var result = data.results[0];
                var secondSenator = $("#second-senator");
                var p = $("<p>").text("Name: " + result.first_name + " " + result.middle_name + " " +result.last_name);
                secondSenator.append(p);

                p = $("<p>").text("Website: ");
                a = $("<a>");
                a.text(result.url).attr({href: result.url, target: "_blank"});
                p.append(a);
                secondSenator.append(p);
            });
        });
    }

    // Fetch the user profile data from facebook
    function getFBUserData(){
        FB.api('/me', {locale: 'en_US', fields: 'id,first_name,last_name,email'},
        function (response) {
            document.getElementById('welcome').innerHTML = 'Welcome, ' + response.first_name+' '+response.last_name;
            document.getElementById('welcome').style.display = 'inline';
        });
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
                initAutocomplete();
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

    //twitter
    $('#twitterButton').on('click', function (){
        var text = "Our air qaulity index is" +aqi+ "this is terrible";
        var twitterName;
        var hashtags = "magaPolution, fixItNow";
        $(this).attr('data-text', text);
        $(this).attr('data-via', twitterName);
        $(this).attr('data-hashtags', hashtags);
    });

    $("#cur-location").on('click', function(event){
        event.preventDefault();
        navigator.geolocation.getCurrentPosition(function(result){
            getBOM(result.coords.latitude, result.coords.longitude);
            getProPublica(state);
            map.setCenter(result.coords.latitude, result.coords.longitude);
            map.setZoom(17);
        });
    });

    $('#logout').on('click', function(){
        // Logout from facebook
        FB.logout(function() {
            window.location.replace('index.html');
        });

    });
    
})



