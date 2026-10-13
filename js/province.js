const provinceMap = L.map("map");

const esri = L.tileLayer(
  "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}",
  { attribution: "Tiles © Esri — Esri, DeLorme, NAVTEQ" },
).addTo(provinceMap);

const osmLayer = L.tileLayer(
  "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
  {
    attribution: "&copy; OpenStreetMap contributors",
  },
);
const satelliteLayer = L.tileLayer(
  "https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}",
  {
    maxZoom: 20,
    attribution: "&copy; Google",
  },
);
const topoLayer = L.tileLayer(
  "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
  {
    maxZoom: 17,
    attribution:
      "Map data: &copy; OpenStreetMap contributors, SRTM | Map style: &copy; OpenTopoMap (CC-BY-SA)",
  },
);

L.control
  .layers({
    "Esri Light Gray": esri,
    OpenStreetMap: osmLayer,
    "Google Satellite": satelliteLayer,
    "Topo Map": topoLayer,
  })
  .addTo(provinceMap);

const defaultProvinceStyle = {
  color: "#3388ff",
  weight: 2,
  opacity: 1,
  fillColor: "#3388ff",
  fillOpacity: 0.2,
};
const selectedProvinceStyle = {
  ...defaultProvinceStyle,
  color: "#f08c28",
  weight: 3,
  fillColor: "#f08c28",
  fillOpacity: 0.4,
};
let provinceLayer;
let selectedProvince;
let weatherController;

const provinceName = document.getElementById("province-name");
const provincePrompt = document.getElementById("province-prompt");
const provinceType = document.getElementById("province-type");
const provinceId = document.getElementById("province-id");
const weatherRainfall = document.getElementById("weather-rainfall");
const weatherTemperature = document.getElementById("weather-temperature");
const weatherStatus = document.getElementById("weather-status");

function selectProvince(feature, layer) {
  if (selectedProvince) {
    provinceLayer.resetStyle(selectedProvince);
  }

  selectedProvince = layer;
  layer.setStyle(selectedProvinceStyle);

  const properties = feature.properties;
  provinceName.textContent = properties.NAME_1 || "Unknown province";
  provincePrompt.textContent = "Province boundary selected.";
  provinceType.textContent =
    properties.ENGTYPE_1 || properties.TYPE_1 || "Not available";
  provinceId.textContent = properties.ID_1 ?? "Not available";

  loadProvinceWeather(layer.getBounds().getCenter());
}

async function loadProvinceWeather(location) {
  if (weatherController) {
    weatherController.abort();
  }

  weatherController = new AbortController();
  weatherRainfall.textContent = "Loading...";
  weatherTemperature.textContent = "Loading...";
  weatherStatus.textContent = "Fetching forecast from Open-Meteo...";

  const parameters = new URLSearchParams({
    latitude: location.lat.toFixed(4),
    longitude: location.lng.toFixed(4),
    current: "temperature_2m",
    daily: "precipitation_sum",
    timezone: "auto",
    forecast_days: "1",
  });

  try {
    const response = await fetch(
      `https://api.open-meteo.com/v1/forecast?${parameters}`,
      { signal: weatherController.signal },
    );
    if (!response.ok) {
      throw new Error(`Open-Meteo returned ${response.status}`);
    }

    const weather = await response.json();
    const temperature = weather.current?.temperature_2m;
    const rainfall = weather.daily?.precipitation_sum?.[0];

    weatherTemperature.textContent =
      typeof temperature === "number" ? `${temperature} °C` : "Unavailable";
    weatherRainfall.textContent =
      typeof rainfall === "number" ? `${rainfall} mm` : "Unavailable";
    weatherStatus.textContent = `Updated ${weather.current?.time || "just now"} · Open-Meteo`;
  } catch (error) {
    if (error.name === "AbortError") {
      return;
    }

    console.error("Error fetching province weather:", error);
    weatherRainfall.textContent = "Unavailable";
    weatherTemperature.textContent = "Unavailable";
    weatherStatus.textContent = "Weather data could not be loaded.";
  }
}

fetch("data/country.geojson")
  .then((response) => {
    if (!response.ok) {
      throw new Error(`Province data returned ${response.status}`);
    }
    return response.json();
  })
  .then((data) => {
    provinceLayer = L.geoJSON(data, {
      style: defaultProvinceStyle,
      onEachFeature(feature, layer) {
        layer.bindTooltip(feature.properties.NAME_1 || "Province", {
          sticky: true,
        });
        layer.on({
          click: () => selectProvince(feature, layer),
          mouseover: () => {
            if (layer !== selectedProvince) {
              layer.setStyle({ weight: 3, fillOpacity: 0.35 });
            }
          },
          mouseout: () => {
            if (layer !== selectedProvince) {
              provinceLayer.resetStyle(layer);
            }
          },
        });
      },
    }).addTo(provinceMap);

    provinceMap.fitBounds(provinceLayer.getBounds(), { padding: [16, 16] });
  })
  .catch((error) => {
    console.error("Error loading province boundaries:", error);
    provincePrompt.textContent = "Province boundaries could not be loaded.";
  });
