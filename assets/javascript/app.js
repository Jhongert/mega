
	var placeSearch, autocomplete;
	var place = {}, lat, lng;

	function initAutocomplete() {
    	// Create the autocomplete object, restricting the search to geographical
        // location types.
        autocomplete = new google.maps.places.Autocomplete(
        	(document.getElementById("location")),
            {types: ['geocode']
        });

        // When the user selects an location from the dropdown, get de geometry location (lat,lng).
        autocomplete.addListener('place_changed', getGeometry);
    }

    function getGeometry() {
   		// Get the location from the autocomplete object.
     	place = autocomplete.getPlace();
    }

//https://api.breezometer.com/baqi/?lat=28.3338002802915&lon=-81.3577900697085&key=de4fef0f7fb349f29f3f21c275018069&fields=breezometer_aqi,random_recommendations,breezometer_color,breezometer_description,pollutants
//f17090c3cf4a448f981b47f391d41295
    //get breezeOmeter data
    function getBOM (lat, lng) {   
        var fields = "&breezometer_aqi,random_recommendations,breezometer_color,breezometer_description,pollutants"           
        var queryURL = 'https://api.breezometer.com/baqi/?lat='+lat+'&lon='+lng+'&key=de4fef0f7fb349f29f3f21c275018069' + fields;
        $.ajax({
            url: queryURL, 
            method: 'GET',
        }).done(function(response) {
            aqi = response.breezometer_aqi;
            color = response.breezometer_color;
            description = response.breezometer_description;
            recoChildren = response.random_recommendations.children;
            recoHealth = response.random_recommendations.health;
            recInside = response.random_recommendations.inside;
            recOutside = response.random_recommendations.outside;
            recSport = response.random_recommendations.sport;

            co = response.pollutants.co.concentration;
            coDesc = response.pollutants.co.pollutant_description;
            no2 = response.pollutants.no2.concentration;
            no2Desc = response.pollutants.no2.pollutant_description;
            o3 = response.pollutants.o3.concentration;
            o3Desc = response.pollutants.o3.pollutant_description;
            console.log("aqi: " + aqi);
            console.log("Color: " + color);
            console.log("Description: " + description);
            console.log("Recommendations for children: " + recoChildren);
            console.log("Recommendations for Helath: " + recoHealth);
            console.log("Recommendations for inside: " + recInside);
            console.log("Recommendations for outside: " + recOutside);
            console.log("Recommendations for sport: " + recSport);

            console.log("Co: " + co);
            console.log("Co Rescription: " + coDesc);
            console.log("No2: " + no2);
            console.log("No2 description: " + no2Desc);
            console.log("o3: " + o3);
            console.log("o3Desc: " + o3Desc);
        })
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
	//Button search click event
	$("#aqSearch").on("click", function () {
		var location = $("#location");
		if(location.val().trim() == ""){
			location.after('<p class= text-danger>Please enter a location: Address, City, Zip code.</p>');
		} else {
			if(!place.geometry){
      			location.after('<p class= text-danger>Please enter a valid location.</p>');
    		}else{
     			lat = place.geometry.location.lat();
     			lng = place.geometry.location.lng();
   
    			getBOM(lat, lng);
                getProPublica();
     		}
     	}
    });
})