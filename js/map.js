// Initialize the map and set its view over Burundi
var map = L.map("map").setView([-3.3731, 29.9189], 9);

// Base Map
var osm = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "&copy; OpenStreetMap contributors",
}).addTo(map);

// 1. Define the Layer Groups FIRST and add them to the map by default
var countryLayer = L.layerGroup().addTo(map);
var roadsLayer = L.layerGroup().addTo(map);
var lakesLayer = L.layerGroup().addTo(map);
var parksLayer = L.layerGroup().addTo(map);
var newAdminLayer = L.layerGroup().addTo(map);

// 2. Fetch GeoJSON data and add them INTO the layer groups (not directly to map)
fetch("data/country.geojson")
  .then((response) => response.json())
  .then((data) => {
    var geojson = L.geoJSON(data, {
      style: { color: "#7d8b8f", weight: 3, fillOpacity: 0.4 },
    }).bindPopup((layer) => layer.feature.properties.NAME_1);

    countryLayer.addLayer(geojson); // Adds to the group
  })
  .catch((error) => console.error("Error loading Country data:", error));

fetch("data/RNs.geojson")
  .then((response) => response.json())
  .then((data) => {
    var geojson = L.geoJSON(data, {
      style: { color: "#ff5733", weight: 2, dashArray: "5, 5" },
    });
    roadsLayer.addLayer(geojson);
  })
  .catch((error) => console.error("Error loading Roads data:", error));

fetch("data/Lakes.geojson")
  .then((response) => response.json())
  .then((data) => {
    var geojson = L.geoJSON(data, {
      style: {
        color: "#3498db",
        weight: 1,
        fillColor: "#3498db",
        fillOpacity: 0.5,
      },
    });
    lakesLayer.addLayer(geojson);
  })
  .catch((error) => console.error("Error loading Lakes data:", error));

fetch("data/National_Parks.geojson")
  .then((response) => response.json())
  .then((data) => {
    var geojson = L.geoJSON(data, {
      style: {
        color: "#2ecc71",
        weight: 1,
        fillColor: "#2ecc71",
        fillOpacity: 0.5,
      },
    });
    parksLayer.addLayer(geojson);
  })
  .catch((error) => console.error("Error loading National Parks data:", error));

//fetching new administrative boundaries data
fetch("data/new_Admin.geojson")
  .then((response) => response.json())
  .then((data) => {
    var geojson = L.geoJSON(data, {
      style: { color: "#333", weight: 3, fillOpacity: 0.4 },
    }).bindPopup((layer) => layer.feature.properties.PROVINCES);

    newAdminLayer.addLayer(geojson); // Adds to the group
  })
  .catch((error) =>
    console.error("Error loading Administrative Boundaries data:", error),
  );

// Scale control
L.control
  .scale({
    imperial: true,
    maxWidth: 200,
    metric: true,
    position: "bottomleft",
  })
  .addTo(map);

// Layer control to toggle visibility of layers
var overlayMaps = {
  "Country Boundaries": countryLayer,
  "New Administrative Boundaries": newAdminLayer,
  "National Roads": roadsLayer,
  Lakes: lakesLayer,
  "National Parks": parksLayer,
};

L.control.layers(null, overlayMaps, { collapsed: false }).addTo(map);

// Add a legend to explain the symbols/colors
var legend = L.control({ position: "bottomright" });

legend.onAdd = function (map) {
  var div = L.DomUtil.create("div", "info legend");

  // Set clean panel styling directly to ensure it has space and background
  div.style.backgroundColor = "white";
  div.style.padding = "12px 16px";
  div.style.borderRadius = "8px";
  div.style.boxShadow = "0 4px 12px rgba(0,0,0,0.15)";
  div.style.fontFamily = "'Montserrat', sans-serif";
  div.style.fontSize = "13px";
  div.style.color = "#333333";
  div.style.lineHeight = "1.8"; // Gives nice breathing room between rows

  // Title for the environmental legend panel
  div.innerHTML =
    '<strong style="display: block; margin-bottom: 8px; font-size: 14px; color: #1e1e2e;"> Legend</strong>';

  // Each item is wrapped in a div with "display: flex" to keep icons and text perfectly aligned
  div.innerHTML += `
    <div style="display: flex; align-items: center; margin-bottom: 5px;">
      <i style="background: #7d8b8f; width: 16px; height: 16px; display: inline-block; margin-right: 10px; border-radius: 3px;"></i> 
      <span>Country Borders</span>
    </div>
    <div style="display: flex; align-items: center; margin-bottom: 5px;">
      <i style="background: #ff5733; width: 16px; height: 3px; display: inline-block; margin-right: 10px;"></i> 
      <span>National Roads</span>
    </div>
    <div style="display: flex; align-items: center; margin-bottom: 5px;">
      <i style="background: #3498db; width: 16px; height: 16px; display: inline-block; margin-right: 10px; border-radius: 3px;"></i> 
      <span>Lakes</span>
    </div>
    <div style="display: flex; align-items: center;">
      <i style="background: #2ecc71; width: 16px; height: 16px; display: inline-block; margin-right: 10px; border-radius: 3px;"></i> 
      <span>National Parks</span>
    </div>
  `;

  return div;
};

legend.addTo(map);
