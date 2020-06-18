var queryURL = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";
var platesURL = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_plates.json";

var markerSize = 0.0;

// Perform a GET request to the query URL to get the earthquake data
d3.json(queryURL, function(data) {
  //Get the tectonic plate data
  d3.json(platesURL, function(data2) {
    createFeatures(data.features, data2.features);
  })
});


//return color based on value
function getColor(x) {
  return x > 5 ? "#f40202" :
          x > 4 ? "#f45f02" :
          x > 3 ? "#f49702" :
          x > 2 ? "#F4bc02" :
          x > 1 ? "#d8f402" :
          x > 0 ? "#93f402" :
                  "#FFEDA0";
  }


function createFeatures(earthquakeData, plateData) {

  // style function
  function style(feature) {
  	return {
      color: "black",
      fillColor: getColor(feature.properties.mag),
      fillOpacity: 0.85,
      opacity: 1,
      weight: 1,
  		stroke: true,
      radius: +feature.properties.mag*4.5
  	};
  }

// Create a GeoJSON layer containing the features array on the earthquakeData object
// Run the onEachFeature function once for each piece of data in the array
var earthquakes = L.geoJson(earthquakeData, {

  pointToLayer: function(feature, latlng) {
    
    //console.log("markersize: "+markerSize);
    //return L.circleMarker(latlng,  geojsonMarkerOptions );
    return L.circleMarker(latlng,  style(feature) );

    },
    
  onEachFeature: function (feature, layer) {
    //console.log("place: " + feature.properties.place);
    layer.bindPopup("<h3>" + feature.properties.place + "<hr>Magnitude: "
    + +feature.properties.mag + "</h3><hr><p>" + new Date(feature.properties.time) + "</p>");
    
  }

  //console.log(earthquakes);

});

var plates = L.geoJson(plateData, {
  onEachFeature: function (feature, layer) {
  layer.bindPopup("<h3>" + feature.properties.PlateName + "</h3>");
  }
});


// Sending the earthquakes layer to the createMap function
createMap(earthquakes, plates);

}

// Defining createMap function
function createMap(earthquakes, plates) {

  // Define Satellite, Grayscale and Outdoor map layers
  var satellite = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"http://openstreetmap.org\">OpenStreetMap</a> contributors, <a href=\"http://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"http://mapbox.com\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox/satellite-v9",  
    accessToken: API_KEY
  });

  var lightmap = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"http://openstreetmap.org\">OpenStreetMap</a> contributors, <a href=\"http://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"http://mapbox.com\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox/light-v10",  
    accessToken: API_KEY
  });

  var outdoor = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"http://openstreetmap.org\">OpenStreetMap</a> contributors, <a href=\"http://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"http://mapbox.com\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox/outdoors-v11",  
    accessToken: API_KEY
  });

  // Define a baseMaps object to hold the base layers
  var baseMaps = {
    "Satellite": satellite,
    "Grayscale": lightmap,
    "Outdoors": outdoor,
  };

  // Create an overlays object to add to the layer control
  var overlays = {
    "Fault Lines": plates,
    "Earthquakes": earthquakes,
  };


  // Creating default map with default layers
  var map = L.map("map-id", {
    center: [37.09, -95.71],
    zoom: 5,
    layers: [
      satellite,
      plates,
      earthquakes
    ]
  });

  // Create a layer control, pass in the baseMaps and overlayMaps and add the layer control to the map
  L.control.layers(baseMaps, overlays, {
    collapsed: false
  }).addTo(map);

  // Create a legend to display information about our map
  var legend = L.control({
    position: "bottomright"
  });

  // When the layer control is added, insert a div with the class of "legend"
  legend.onAdd = function(){
    var div = L.DomUtil.create("div","legend");
    return div;
  };

  // Adding legend to the Map
  legend.addTo(map);

  // Calling function to display legend
  document.querySelector(".legend").innerHTML=displayLegend();

  function displayLegend(){

    var legendInfo = [{
      limit: "Mag: 0-1",
      color: "#93f402"
      },{
      limit: "Mag: 1-2",
      color: "#d8f402"
      },{
      limit:"Mag: 2-3",
      color:"#F4bc02"
      },{
      limit:"Mag: 3-4",
      color:"#f49702"
      },{
      limit:"Mag: 4-5",
      color:"#f45f02"
      },{
      limit:"Mag: 5+",
      color:"#f40202"
      }];

    var header = "<h3>Magnitude</h3><hr>";
    var string = "";

    // Loop through our magnitude intervals and generate a label with a colored square for each interval
    for (var i = 0; i < legendInfo.length; i++) {
      string += "<p style = \"background-color: "+legendInfo[i].color+"\">"+legendInfo[i].limit+"</p> ";
    }

    return header+string;
  };

};