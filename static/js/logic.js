// Store our API endpoint inside queryUrl
var url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

function createMap(earthquakes) {

  // Create the tile layer that will be the background of our map
  var lightmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "light-v10",
    accessToken: API_KEY
  });
  var darkmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "dark-v10",
    accessToken: API_KEY
  });
  var satellite = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "satellite-v9",
    accessToken: API_KEY
  });

  // Create a baseMaps object to hold the lightmap layer
  var baseMaps = {
    "Light Map": lightmap,
    "Dark Map": darkmap,
    "Satellite": satellite
  };

  // Create an overlayMaps object to hold the earthquakes layer
  var overlayMaps = {
    "Earthquakes": earthquakes
  };

  // Create the map object with options
  var map = L.map("mapid", {
    center: [40.73, -74.0059],
    zoom: 3,
    layers: [lightmap, earthquakes]
  });

  // Create a layer control, pass in the baseMaps and overlayMaps. Add the layer control to the map
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(map);

  var legend = L.control({ position: 'bottomright' });
  legend.onAdd = function (map) {
    let div = L.DomUtil.create('div', 'info legend');
    labels = ['<strong>Depths:</strong>'],
      mag_categories = ['-10-10', '10-30', '30-50', '50-70', '70-90', '90+'];
    mag_categories_color = [10, 30, 50, 70, 90, 150]

    for (let i = 0; i < mag_categories.length; i++) {
      div.innerHTML +=
        labels.push(
          '<i style="background:' + "getColor(mag_categories_color[i])" + '"></i> ' +
          (mag_categories[i] ? mag_categories[i] : '+'));
    }
    div.innerHTML = labels.join('<br>');
    return div;
  };
  legend.addTo(map);
}

function createMarkers(response) {

  // Pull the "stations" property off of response.data
  var earthquakeReports = response.features;

  // Initialize an array to hold earthquake markers
  var earthquakeMarkers = [];

  // Loop through the  array
  for (var index = 0; index < earthquakeReports.length; index++) {
    var coordinates = earthquakeReports[index].geometry.coordinates;

    // Determine the proper color of the circles based on the depth
    var circleColor;
    var magnitude = earthquakeReports[index].properties.mag;

    if (coordinates[2] > 90) {
      circleColor = "#F01E0C";
    }
    else if (coordinates[2] > 70) {
      circleColor = "#F07A40";
    }
    else if (coordinates[2] > 50) {
      circleColor = "#F07707";
    }
    else if (coordinates[2] > 30) {
      circleColor = "#F0C206";
    }
    else if (coordinates[2] > 10) {
      circleColor = "#D3F024";
    }
    else {
      circleColor = "#69F00D";
    }

    // Determine the proper radius size of the circles based on magnitude
    var circleSize;

    if (magnitude >= 8.0) {
      circleSize = 30;
    }
    else if (magnitude >= 6.0) {
      circleSizer = 20;
    }
    else if (magnitude >= 4.0) {
      circleSize = 15;
    }
    else if (magnitude >= 2.0) {
      circleSize = 10;
    }
    else {
      circleSize = 5;
    }

    // For each station, create a circle marker and bind a popup with the earthquakes location and magnitude
    var earthquakeMarker = L.circleMarker([coordinates[1], coordinates[0]], {
      color: 'black',
      fillColor: circleColor,
      fillOpacity: 0.75,
      radius: circleSize
    })
      .bindPopup("<h3>" + earthquakeReports[index].properties.place +
        "<h3><h3>Magnitude: " + earthquakeReports[index].properties.mag + "</h3>");

    // Add the marker to the earthquakeMarkers array
    earthquakeMarkers.push(earthquakeMarker);
  }

  // Create a layer group made from the earthquake markers array, pass it into the createMap function
  createMap(L.layerGroup(earthquakeMarkers));
}

// Perform an API call to the url for geojson; call createMarkers when complete
d3.json(url, createMarkers);
