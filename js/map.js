var map = L.map("map").setView([-3.3731, 29.9189], 9);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "&copy; OpenStreetMap contributors",
}).addTo(map);

L.marker([-3.3731, 29.9189]).addTo(map).bindPopup("Burundi").openPopup();
