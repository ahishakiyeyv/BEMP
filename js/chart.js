// 1. Generate 30 days labels (Day 1 to Day 30)
const labels = Array.from({ length: 30 }, (_, i) => `Day ${i + 1}`);

// 2. Generate simple sample water level data (in meters/feet)
const waterData = [
  4.2, 4.3, 4.1, 4.5, 4.8, 5.0, 4.9, 4.7, 4.6, 4.4, 4.3, 4.5, 4.9, 5.2, 5.5,
  5.3, 5.1, 4.8, 4.6, 4.5, 4.4, 4.7, 5.0, 5.2, 5.1, 4.9, 4.8, 4.6, 4.5, 4.7,
];

// 3. Get the canvas element context
const ctx = document.getElementById("waterLevelChart").getContext("2d");

// 4. Create simple line chart
new Chart(ctx, {
  type: "line",
  data: {
    labels: labels,
    datasets: [
      {
        label: "Water Level (m)",
        data: waterData,
        borderColor: "#0284c7",
        backgroundColor: "rgba(2, 132, 199, 0.1)",
        borderWidth: 2,
        tension: 0.3, // Adds a slight smooth curve
        pointRadius: 0, // Hides points by default for clean look
        pointHoverRadius: 4, // Shows point on hover
        fill: true,
      },
    ],
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false, // Hide legend to keep sidebar uncluttered
      },
    },
    scales: {
      x: {
        display: false, // Hide X axis for simple minimal look
      },
      y: {
        grid: {
          color: "#f1f5f9",
        },
        ticks: {
          font: {
            size: 10,
          },
        },
      },
    },
  },
});

// Sample 30-day precipitation data (in mm)
const rainfallData = [
  0, 2.5, 12.0, 18.4, 4.2, 0, 0, 1.1, 0, 8.5, 15.2, 22.0, 6.4, 0, 0, 0, 3.1,
  11.8, 28.5, 14.2, 2.0, 0, 0, 5.4, 9.8, 0, 0, 1.2, 4.0, 0,
];

const ctxRain = document.getElementById("rainfallChart").getContext("2d");
new Chart(ctxRain, {
  type: "line",
  data: {
    labels: labels,
    datasets: [
      {
        label: "Rainfall (mm)",
        data: rainfallData,
        borderColor: "#2563eb",
        backgroundColor: "rgba(37, 99, 235, 0.12)",
        borderWidth: 2,
        tension: 0.2, // Slightly sharper line curve for precipitation spikes
        pointRadius: 0,
        pointHoverRadius: 5,
        fill: true,
      },
    ],
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (context) => ` Rainfall: ${context.parsed.y} mm`,
        },
      },
    },
    scales: {
      x: { display: false },
      y: {
        beginAtZero: true,
        grid: { color: "#f1f5f9" },
        ticks: { font: { size: 10 }, color: "#64748b" },
      },
    },
  },
});
