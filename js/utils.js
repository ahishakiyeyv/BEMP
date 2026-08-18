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

