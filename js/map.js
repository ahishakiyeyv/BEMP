//Initialize the map and set its view to the specified coordinates and zoom level
var map = L.map("map").setView([-3.3731, 29.9189], 9);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "&copy; OpenStreetMap contributors",
}).addTo(map);

//Fetching GeoJSON data for Burundi and adding it to the map
fetch("data/country.geojson")
  .then((response) => response.json())
  .then((data) => {
    L.geoJSON(data, {
      style: {
        color: "#7d8b8f",
        weight: 3,
        fillOpacity: 0.3,
      },
    })
      .bindPopup((layer) => {
        return layer.feature.properties.NAME_1;
      })
      .addTo(map);
  })
  .catch((error) => console.error("Error loading GeoJSON data:", error));

// Fecthing Roads GeoJSON data and adding it to the map
fetch("data/RNs.geojson")
  .then((response) => response.json())
  .then((data) => {
    L.geoJSON(data, {
      style: {
        color: "#ff5733",
        weight: 1,
        dashed: true,
      },
    }).addTo(map);
  })
  .catch((error) => console.error("Error loading Roads GeoJSON data:", error));
