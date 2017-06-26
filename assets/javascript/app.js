
	var placeSearch, autocomplete;
	var place = {}, lat, lng;
    var mao, infowindow, marker, infowindowContent;

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
                map.setZoom(17);
            }

            marker.setPosition(place.geometry.location);
            marker.setVisible(true);

            lat = place.geometry.location.lat();
            lng = place.geometry.location.lng();
            
            getBOM(lat, lng);
            getProPublica();      
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

            var aqInfo = $("#aq-info");

            var p = $("<p>").text("AQI: " + aqi);
            aqInfo.append(p);

            p = $("<p>").text("Description: " + description);
            aqInfo.append(p);

            console.log("Color: " + color);
           
            var aqRecommendation = $("#aqRecommendation");
            p = $("<p>").text("Childre: " + recoChildren);
            aqRecommendation.append(p);

            p = $("<p>").text("Health: " + recoHealth);
            aqRecommendation.append(p);

            p = $("<p>").text("Inside: " + recInside);
            aqRecommendation.append(p);
            
            p = $("<p>").text("Outside: " + recOutside);
            aqRecommendation.append(p);
            
            p = $("<p>").text("Sport: " + recSport);
            aqRecommendation.append(p);

            

            console.log("Co: " + co);
            console.log("Co Rescription: " + coDesc);
            console.log("No2: " + no2);
            console.log("No2 description: " + no2Desc);
            console.log("o3: " + o3);
            console.log("o3Desc: " + o3Desc);

            infowindowContent.children['aqiValue'].textContent = "AQI: " + aqi;
            infowindowContent.children['aqiDescription'].textContent = description;
            infowindow.open(map, marker);
        });
    };

    function getProPublica(){
        $.ajax({
            url: "https://api.propublica.org/congress/v1/115/senate/members.json",
            type: "GET",
            dataType: 'json',
            headers: {'X-API-Key': 'GGL4y5FC2p9Eea8fAmrR16BZOg90Xott8D8D6NVU'}
        }).done(function(data){
            console.log(data)
        });
    }


$(document).ready(function(){

    //twitter
    $('#twitterButton').on('click', function (){
        var text = "Our air qaulity index is" +aqi+ "this is terrible";
        var twitterName;
        var hashtags = "magaPolution, fixItNow";
        $(this).attr('data-text', text);
        $(this).attr('data-via', twitterName);
        $(this).attr('data-hashtags', hashtags);
    });
})



