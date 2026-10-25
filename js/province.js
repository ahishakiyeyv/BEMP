const communeMap = L.map("map");

const esri = L.tileLayer(
  "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}",
  { attribution: "Tiles © Esri — Esri, DeLorme, NAVTEQ" },
).addTo(communeMap);

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
  .addTo(communeMap);

const communePopulation2024 = {
  BUTAGANZWA: 109813,
  BUTIHINDA: 434166,
  CANKUZO: 161287,
  GISAGARA: 291398,
  GISURU: 337649,
  MUYINGA: 495927,
  RUYIGI: 222021,
  BUBANZA: 242978,
  BUKINANYANA: 269547,
  CIBITOKE: 260776,
  ISARE: 149273,
  MPANDA: 362261,
  MUGERE: 512881,
  MUGINA: 225284,
  MUHUTA: 117061,
  MUKAZA: 168829,
  NTAHANGWA: 927907,
  RWIBAGA: 116758,
  BURURI: 189958,
  MAKAMBA: 370637,
  MATANA: 195269,
  MUSONGATI: 336347,
  NYANZA: 369669,
  RUMONGE: 429237,
  RUTANA: 227434,
  BUSONI: 357991,
  KAYANZA: 332433,
  KIREMBA: 292027,
  KIRUNDO: 478492,
  MATONGO: 265900,
  MUHANGA: 222791,
  NGOZI: 316808,
  TANGARA: 263764,
  BUGENDANA: 229652,
  GISHUBI: 243533,
  GITEGA: 528528,
  KARUSI: 377638,
  KIGANDA: 149522,
  MURAMVYA: 171010,
  MWARO: 149190,
  NYABIHANGA: 175208,
  SHOMBO: 253934,
};
const communePopulationClasses = [
  { label: "Under 200,000", max: 199999, color: "#fff2b2" },
  { label: "200,000–299,999", max: 299999, color: "#fed976" },
  { label: "300,000–399,999", max: 399999, color: "#feb24c" },
  { label: "400,000–599,999", max: 599999, color: "#fd8d3c" },
  { label: "600,000 and over", max: Infinity, color: "#e31a1c" },
];
const noPopulationColor = "#cbd5e1";

function getCommunePopulation(feature) {
  const name = feature?.properties?.COMMUNES?.trim().toUpperCase();
  return name ? (communePopulation2024[name] ?? null) : null;
}

function getCommuneStyle(feature) {
  const population = getCommunePopulation(feature);
  const populationClass = communePopulationClasses.find(
    ({ max }) => population !== null && population <= max,
  );

  return {
    color: "#64748b",
    weight: 1.5,
    opacity: 1,
    fillColor: populationClass?.color || noPopulationColor,
    fillOpacity: 0.72,
  };
}

const communePopulationLegend = L.control({ position: "bottomleft" });
communePopulationLegend.onAdd = function () {
  const div = L.DomUtil.create("div", "commune-population-legend");
  const title = L.DomUtil.create("h3", "", div);
  title.textContent = "Commune population";

  const note = L.DomUtil.create(
    "p",
    "commune-population-legend-note",
    div,
  );
  note.textContent = "Residents · 2024 census";

  const list = L.DomUtil.create("ul", "", div);
  communePopulationClasses.forEach(({ label, color }) => {
    const item = L.DomUtil.create("li", "", list);
    const swatch = L.DomUtil.create(
      "span",
      "commune-population-legend-swatch",
      item,
    );
    swatch.style.backgroundColor = color;
    const text = L.DomUtil.create("span", "", item);
    text.textContent = label;
  });

  const noDataItem = L.DomUtil.create("li", "", list);
  const noDataSwatch = L.DomUtil.create(
    "span",
    "commune-population-legend-swatch",
    noDataItem,
  );
  noDataSwatch.style.backgroundColor = noPopulationColor;
  const noDataLabel = L.DomUtil.create("span", "", noDataItem);
  noDataLabel.textContent = "No population data";

  const source = L.DomUtil.create(
    "a",
    "commune-population-legend-source",
    div,
  );
  source.href = "https://www.insbu.bi/populationAgeResidencePage";
  source.target = "_blank";
  source.rel = "noopener noreferrer";
  source.textContent = "INSBU source";

  L.DomEvent.disableClickPropagation(div);
  L.DomEvent.disableScrollPropagation(div);
  return div;
};
communePopulationLegend.addTo(communeMap);

let communeLayer;
let selectedCommune;
let weatherController;

const communeName = document.getElementById("commune-name");
const communePrompt = document.getElementById("commune-prompt");
const communeProvince = document.getElementById("commune-province");
const communeCode = document.getElementById("commune-code");
const communePopulation = document.getElementById("commune-population");
const weatherRainfall = document.getElementById("weather-rainfall");
const weatherTemperature = document.getElementById("weather-temperature");
const weatherStatus = document.getElementById("weather-status");

function selectCommune(feature, layer) {
  if (selectedCommune) {
    communeLayer.resetStyle(selectedCommune);
  }

  selectedCommune = layer;
  layer.setStyle({
    ...getCommuneStyle(feature),
    color: "#091114",
    weight: 3,
  });

  const properties = feature.properties;
  communeName.textContent = properties.COMMUNES || "Unknown commune";
  communePrompt.textContent = "Commune boundary selected.";
  communeProvince.textContent = properties.PROVINCES || "Not available";
  communeCode.textContent =
    properties.CCODCOMMUN ?? properties.CODCOMMUNE ?? "Not available";
  const population = getCommunePopulation(feature);
  communePopulation.textContent =
    population === null
      ? "Not available"
      : new Intl.NumberFormat().format(population);

  loadCommuneWeather(layer.getBounds().getCenter());
}

async function loadCommuneWeather(location) {
  if (weatherController) {
    weatherController.abort();
  }

  weatherController = new AbortController();
  weatherRainfall.textContent = "Loading...";
  weatherTemperature.textContent = "Loading...";
  weatherStatus.textContent =
    "Fetching conditions for the commune's representative center...";

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
    weatherStatus.textContent = `Commune center estimate · updated ${weather.current?.time || "just now"} · Open-Meteo`;
  } catch (error) {
    if (error.name === "AbortError") {
      return;
    }

    console.error("Error fetching commune weather:", error);
    weatherRainfall.textContent = "Unavailable";
    weatherTemperature.textContent = "Unavailable";
    weatherStatus.textContent = "Weather data could not be loaded.";
  }
}

fetch("data/commune.geojson")
  .then((response) => {
    if (!response.ok) {
      throw new Error(`Commune data returned ${response.status}`);
    }
    return response.json();
  })
  .then((data) => {
    communeLayer = L.geoJSON(data, {
      style: getCommuneStyle,
      onEachFeature(feature, layer) {
        const name = feature.properties.COMMUNES || "Commune";
        const population = getCommunePopulation(feature);
        const populationLabel =
          population === null
            ? "no population data"
            : `${new Intl.NumberFormat().format(population)} residents`;
        layer.bindTooltip(`${name} · ${populationLabel}`, { sticky: true });
        layer.on({
          click: () => selectCommune(feature, layer),
          mouseover: () => {
            if (layer !== selectedCommune) {
              layer.setStyle({ weight: 3, fillOpacity: 0.35 });
            }
          },
          mouseout: () => {
            if (layer !== selectedCommune) {
              communeLayer.resetStyle(layer);
            }
          },
        });
      },
    }).addTo(communeMap);

    communeMap.fitBounds(communeLayer.getBounds(), { padding: [16, 16] });
  })
  .catch((error) => {
    console.error("Error loading commune boundaries:", error);
    communePrompt.textContent = "Commune boundaries could not be loaded.";
  });
