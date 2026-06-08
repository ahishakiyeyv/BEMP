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
