// Update date and time dynamically
function updateDateTime() {
  const dateElement = document.querySelector(".topbar-date");
  if (!dateElement) return;

  const now = new Date();
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  const day = String(now.getDate()).padStart(2, "0");
  const month = months[now.getMonth()];
  const year = now.getFullYear();
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");

  dateElement.textContent = `${day} ${month} ${year} · ${hours}:${minutes}`;
}

// Update on page load
document.addEventListener("DOMContentLoaded", updateDateTime);

// Update every minute
setInterval(updateDateTime, 60000);

//add animation on the counting the number of stations from 1-12 and manage the speed of the animation

function animateNumber(element, start, end, duration) {
  var range = end - start;
  var current = start;
  var increment = end > start ? 1 : -1;
  var stepTime = Math.abs(Math.floor(duration / range));
  var obj = element;
  var timer = setInterval(function () {
    current += increment;
    obj.textContent = current;
    if (current == end) {
      clearInterval(timer);
    }
  }, stepTime);
}

// Display the exact location of the user on the map on the location-btn and display the name of the location in the topbar-location element for example if the user is in the United States, it should display "United States" in the topbar-location element. If the user is in Canada, it should display "Canada" in the topbar-location element. If the user is in Mexico, it should display "Mexico" in the topbar-location element. If the user is in any other country, it should display "Other" in the topbar-location element.
function displayUserLocation() {
  const locationElement = document.querySelector(".location-btn");
  if (!locationElement) return;

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      function (position) {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;

        // Use a reverse geocoding API to get the country name
        fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`,
        )
          .then((response) => response.json())
          .then((data) => {
            const country = data.address.country;
            if (country === "Burundi") {
              locationElement.innerHTML =
                '<i class="fas fa-map-marker-alt"></i> Burundi';
            } else if (country === "Kenya") {
              locationElement.innerHTML =
                '<i class="fas fa-map-marker-alt"></i> Kenya';
            } else if (country === "Uganda") {
              locationElement.innerHTML =
                '<i class="fas fa-map-marker-alt"></i> Uganda';
            } else if (country === "Rwanda") {
              locationElement.innerHTML =
                '<i class="fas fa-map-marker-alt"></i> Rwanda';
            } else if (country === "DRC") {
              locationElement.innerHTML =
                '<i class="fas fa-map-marker-alt"></i> DRC';
            } else if (country === "Tanzania") {
              locationElement.innerHTML =
                '<i class="fas fa-map-marker-alt"></i> Tanzania';
            } else {
              locationElement.textContent = "Other";
            }
          })
          .catch((error) => {
            console.error("Error fetching location data:", error);
            locationElement.textContent = "Other";
          });
      },
      function (error) {
        console.error("Error getting geolocation:", error);
        locationElement.textContent = "Other";
      },
    );
  } else {
    console.error("Geolocation is not supported by this browser.");
    locationElement.textContent = "Other";
  }
}

// Call the function to display user location
displayUserLocation();
