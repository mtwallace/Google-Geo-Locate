$(document).ready(function () {
    //If Zip known
    if (!!$.cookie('Zip')) {
        //Start prepopulate zip test
        window['optimizely'] = window['optimizely'] || [];
        window.optimizely.push(["activate", 7692181162]);
    }

    if ($('body').hasClass('TrackLocation') && !$.cookie('DontTrack')) {
        var AutoLocate = $.cookie('AutoLocated');
        var Overridden = $.cookie('LocationOverridden');
        if (!AutoLocate) {
            // Determine if the user is on a mobile device
            if (navigator.userAgent.match(/Mobi/) && !Overridden) {
                // Set cookie to expire after a day since a mobile user's location change frequently
                $.cookie('AutoLocated', true, { expires: 1, path: '/' });
            } else {
                $.cookie('AutoLocated', true, { expires: 99999, path: '/' });
            }
            findLocation();
        }
        //populate zip fields after 2 seconds
        setTimeout(function () {
            if (!$.cookie('DontTrack')) {
                PopulateZipFields();
            }
        }, 1500);
    }

    // Google GEO API - Automatically locate mobile users and set cookies for city, state, and zip
    function findLocation() {
        var key = "";
        var post = "https://www.googleapis.com/geolocation/v1/geolocate?key=" + key;
        $.post(post, function (data) {
            if (data.accuracy < 3000) {
                var geocoder = new google.maps.Geocoder;
                geocodeLatLng(geocoder, data.location.lat, data.location.lng);
            }
        });
    }

    function geocodeLatLng(geocoder, lat, lng) {
        var latlng = { lat: parseFloat(lat), lng: parseFloat(lng) };
        geocoder.geocode({ 'location': latlng }, function (results, status) {
            if (status === 'OK') {
                var address = results[0].address_components;
                for (i = 0; i < address.length; i++) {
                    if (address[i].types[0] == "locality") {
                        $.cookie('City', address[i].long_name, { expires: 99999, path: '/' });
                    } else if (address[i].types[0] == "administrative_area_level_1") {
                        $.cookie('State', address[i].short_name, { expires: 99999, path: '/' });
                    } else if (address[i].types[0] == "postal_code") {
                        $.cookie('Zip', address[i].short_name, { expires: 99999, path: '/' });
                        PopulateZipFields(address[i].short_name);
                    }
                }
            }
        });
    }
});
