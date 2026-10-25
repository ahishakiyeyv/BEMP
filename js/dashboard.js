const forecastElement = document.getElementById("rainfall-forecast");
const forecastPeriodElement = document.getElementById("rainfall-period");
const rainfallChartStatus = document.getElementById("rainfall-chart-status");
const rainfallChartValues = document.getElementById("rainfall-chart-values");
const ndviElement = document.getElementById("ndvi-value");
const ndviObservationElement = document.getElementById("ndvi-observation");
const kibiraAqiElement = document.getElementById("kibira-aqi");
const kibiraAqiCategoryElement = document.getElementById("kibira-aqi-category");
const kibiraAirQualityStatusElement = document.getElementById(
  "kibira-air-quality-status",
);
const kibiraPm25Element = document.getElementById("kibira-pm25");
const kibiraAirQualityUpdateElement = document.getElementById(
  "kibira-air-quality-update",
);
const BURUNDI_TIME_ZONE = "Africa/Bujumbura";
const FORECAST_GRID_SPACING = 0.12;
const FORECAST_BATCH_SIZE = 50;

function renderRainfallChart(days, formatDate) {
  rainfallChartStatus.hidden = true;
  const maxValue = Math.max(...days.map(([, day]) => day.amount / day.weight), 1);
  rainfallChartValues.replaceChildren(
    ...days.map(([date, day]) => {
      const value = day.amount / day.weight;
      const item = document.createElement("li");
      item.className = "rainfall-day";

      const valueLabel = document.createElement("strong");
      valueLabel.className = "rainfall-day-value";
      valueLabel.textContent = value.toFixed(1);
      valueLabel.title = `${value.toFixed(1)} mm`;

      const track = document.createElement("span");
      track.className = "rainfall-day-track";
      const bar = document.createElement("span");
      bar.className = "rainfall-day-bar";
      bar.style.height = `${Math.max((value / maxValue) * 100, 2)}%`;
      track.append(bar);

      const dateLabel = document.createElement("span");
      dateLabel.className = "rainfall-day-date";
      dateLabel.textContent = formatDate(date);

      item.append(valueLabel, track, dateLabel);
      return item;
    }),
  );
}

async function loadNdvi() {
  const parameters = new URLSearchParams({
    geometry: JSON.stringify({
      x: 29.9,
      y: -3.3,
      spatialReference: { wkid: 4326 },
    }),
    geometryType: "esriGeometryPoint",
    sr: "4326",
    returnGeometry: "false",
    returnCatalogItems: "true",
    maxItemCount: "1",
    f: "json",
  });
  const response = await fetch(
    `https://gis.earthdata.nasa.gov/portal/rest/services/GESDISC/PACE_OCI_L3M_LANDVI/ImageServer/identify?${parameters}`,
  );
  if (!response.ok) {
    throw new Error(`NASA PACE NDVI request returned ${response.status}`);
  }

  const data = await response.json();
  const value = Number(data.value);
  if (!Number.isFinite(value) || value < -1 || value > 1) {
    throw new Error("NASA PACE did not return a valid NDVI pixel value");
  }

  const latestItem = data.catalogItems?.features?.[0]?.attributes;
  const compositeMatch = latestItem?.name?.match(
    /\.(\d{8})_(\d{8})\.L3m\./,
  );
  const observedDate = compositeMatch?.[2];
  const observedThrough = compositeMatch
    ? new Intl.DateTimeFormat("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
        timeZone: "UTC",
      }).format(
        new Date(
          `${observedDate.slice(0, 4)}-${observedDate.slice(4, 6)}-${observedDate.slice(6)}T00:00:00Z`,
        ),
      )
    : "latest available composite";

  ndviElement.textContent = value.toFixed(2);
  ndviObservationElement.textContent = `Burundi center sample - through ${observedThrough}`;
}

function getUsAqiDetails(aqi) {
  if (aqi <= 50) {
    return {
      category: "Good",
      level: "good",
      guidance: "Air quality is satisfactory; normal outdoor activities are generally fine.",
    };
  }
  if (aqi <= 100) {
    return {
      category: "Moderate",
      level: "moderate",
      guidance:
        "Most people are unlikely to be affected. People unusually sensitive to pollution may limit prolonged outdoor activity.",
    };
  }
  if (aqi <= 150) {
    return {
      category: "Unhealthy for sensitive groups",
      level: "sensitive",
      guidance:
        "Children, older adults, and people with heart or lung conditions should reduce prolonged outdoor exertion.",
    };
  }
  if (aqi <= 200) {
    return {
      category: "Unhealthy",
      level: "unhealthy",
      guidance:
        "Everyone may begin to feel effects. Sensitive groups should avoid prolonged outdoor exertion.",
    };
  }
  if (aqi <= 300) {
    return {
      category: "Very unhealthy",
      level: "very-unhealthy",
      guidance:
        "Health alert: everyone may experience effects. Reduce outdoor exertion and follow local advice.",
    };
  }
  return {
    category: "Hazardous",
    level: "hazardous",
    guidance:
      "Health warning: everyone should avoid outdoor exertion and follow local authority guidance.",
  };
}

async function loadKibiraAirQuality() {
  const parameters = new URLSearchParams({
    latitude: "-2.9",
    longitude: "29.5",
    current: "pm2_5,pm10,us_aqi",
    timezone: BURUNDI_TIME_ZONE,
  });
  const response = await fetch(
    `https://air-quality-api.open-meteo.com/v1/air-quality?${parameters}`,
  );
  if (!response.ok) {
    throw new Error(`Open-Meteo air quality returned ${response.status}`);
  }

  const data = await response.json();
  const { pm2_5: pm25, us_aqi: aqi, time } = data.current || {};
  if (
    !Number.isFinite(aqi) ||
    aqi < 0 ||
    aqi > 500 ||
    !Number.isFinite(pm25) ||
    pm25 < 0 ||
    !time
  ) {
    throw new Error("Air-quality response is missing current AQI or PM2.5");
  }

  const aqiDetails = getUsAqiDetails(aqi);
  kibiraAqiElement.textContent = String(Math.round(aqi));
  kibiraAqiCategoryElement.textContent = aqiDetails.category;
  kibiraAqiCategoryElement.dataset.level = aqiDetails.level;
  kibiraAirQualityStatusElement.textContent = aqiDetails.guidance;
  kibiraPm25Element.textContent = `PM2.5: ${pm25.toFixed(1)} µg/m³`;
  kibiraAirQualityUpdateElement.textContent =
    `CAMS model estimate · updated ${time} - not a ground-station measurement`;
}

function getCoordinateBounds(coordinates, bounds = [Infinity, Infinity, -Infinity, -Infinity]) {
  if (
    Array.isArray(coordinates) &&
    coordinates.length >= 2 &&
    typeof coordinates[0] === "number" &&
    typeof coordinates[1] === "number"
  ) {
    bounds[0] = Math.min(bounds[0], coordinates[0]);
    bounds[1] = Math.min(bounds[1], coordinates[1]);
    bounds[2] = Math.max(bounds[2], coordinates[0]);
    bounds[3] = Math.max(bounds[3], coordinates[1]);
    return bounds;
  }

  for (const coordinate of coordinates) {
    getCoordinateBounds(coordinate, bounds);
  }
  return bounds;
}

function isPointInRing(longitude, latitude, ring) {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [longitudeI, latitudeI] = ring[i];
    const [longitudeJ, latitudeJ] = ring[j];
    const crossesLatitude = (latitudeI > latitude) !== (latitudeJ > latitude);
    if (
      crossesLatitude &&
      longitude <
        ((longitudeJ - longitudeI) * (latitude - latitudeI)) /
          (latitudeJ - latitudeI) +
          longitudeI
    ) {
      inside = !inside;
    }
  }
  return inside;
}

function isPointInPolygon(longitude, latitude, polygon) {
  return (
    isPointInRing(longitude, latitude, polygon[0]) &&
    !polygon.slice(1).some((hole) => isPointInRing(longitude, latitude, hole))
  );
}

function isPointInGeometry(longitude, latitude, geometry) {
  if (geometry.type === "Polygon") {
    return isPointInPolygon(longitude, latitude, geometry.coordinates);
  }
  if (geometry.type === "MultiPolygon") {
    return geometry.coordinates.some((polygon) =>
      isPointInPolygon(longitude, latitude, polygon),
    );
  }
  throw new Error(`Unsupported country geometry: ${geometry.type}`);
}

function sampleCountryGrid(geometry) {
  const [minLongitude, minLatitude, maxLongitude, maxLatitude] =
    getCoordinateBounds(geometry.coordinates);
  const locations = [];

  for (
    let latitude = minLatitude + FORECAST_GRID_SPACING / 2;
    latitude < maxLatitude;
    latitude += FORECAST_GRID_SPACING
  ) {
    for (
      let longitude = minLongitude + FORECAST_GRID_SPACING / 2;
      longitude < maxLongitude;
      longitude += FORECAST_GRID_SPACING
    ) {
      if (isPointInGeometry(longitude, latitude, geometry)) {
        locations.push({ latitude, longitude });
      }
    }
  }

  if (locations.length === 0) {
    throw new Error("No forecast grid points fall inside the country boundary");
  }
  return locations;
}

async function fetchForecastBatch(locations) {
  const parameters = new URLSearchParams({
    latitude: locations.map(({ latitude }) => latitude.toFixed(4)).join(","),
    longitude: locations.map(({ longitude }) => longitude.toFixed(4)).join(","),
    daily: "precipitation_sum",
    forecast_days: "5",
    timezone: BURUNDI_TIME_ZONE,
  });
  const response = await fetch(
    `https://api.open-meteo.com/v1/forecast?${parameters}`,
  );
  if (!response.ok) {
    throw new Error(`Rainfall forecast returned ${response.status}`);
  }

  const results = await response.json();
  return Array.isArray(results) ? results : [results];
}

async function loadRainfallForecast() {
  const boundaryResponse = await fetch("data/burundi.geojson");
  if (!boundaryResponse.ok) {
    throw new Error(`Country boundary returned ${boundaryResponse.status}`);
  }
  const boundary = await boundaryResponse.json();
  const geometry = boundary.features?.[0]?.geometry;
  if (!geometry) {
    throw new Error("Country boundary GeoJSON has no feature geometry");
  }

  const locations = sampleCountryGrid(geometry);
  const forecastBatches = await Promise.all(
    Array.from(
      { length: Math.ceil(locations.length / FORECAST_BATCH_SIZE) },
      (_, index) =>
        fetchForecastBatch(
          locations.slice(
            index * FORECAST_BATCH_SIZE,
            (index + 1) * FORECAST_BATCH_SIZE,
          ),
        ),
    ),
  );
  const forecasts = forecastBatches.flat();
  const dailyTotals = new Map();

  forecasts.forEach((forecast, index) => {
    const weight = Math.cos((locations[index].latitude * Math.PI) / 180);
    const dates = forecast.daily?.time;
    const precipitation = forecast.daily?.precipitation_sum;
    if (!Array.isArray(dates) || !Array.isArray(precipitation)) {
      throw new Error("Rainfall forecast response is missing daily data");
    }

    dates.forEach((date, dayIndex) => {
      const amount = precipitation[dayIndex];
      if (!Number.isFinite(amount)) return;
      const day = dailyTotals.get(date) || { amount: 0, weight: 0 };
      day.amount += amount * weight;
      day.weight += weight;
      dailyTotals.set(date, day);
    });
  });

  const days = [...dailyTotals.entries()].sort(([dateA], [dateB]) =>
    dateA.localeCompare(dateB),
  );
  if (days.length !== 5 || days.some(([, day]) => day.weight === 0)) {
    throw new Error("A complete five-day rainfall forecast was not returned");
  }

  const fiveDayMean = days.reduce(
    (total, [, day]) => total + day.amount / day.weight,
    0,
  );
  const formatDate = (date) =>
    new Intl.DateTimeFormat("en-GB", {
      day: "numeric",
      month: "short",
      timeZone: BURUNDI_TIME_ZONE,
    }).format(new Date(`${date}T12:00:00Z`));

  forecastElement.textContent = `${fiveDayMean.toFixed(1)} mm`;
  forecastPeriodElement.textContent = `${formatDate(days[0][0])}–${formatDate(days[4][0])} - Burundi average`;
  renderRainfallChart(days, formatDate);
}

loadRainfallForecast().catch((error) => {
  console.error("Unable to load the Burundi rainfall forecast:", error);
  forecastElement.textContent = "Unavailable";
  forecastPeriodElement.textContent = "Forecast data could not be loaded";
  rainfallChartStatus.hidden = false;
  rainfallChartStatus.textContent = "Daily forecast is unavailable";
});

loadNdvi().catch((error) => {
  console.error("Unable to load the Burundi NDVI value:", error);
  ndviElement.textContent = "Unavailable";
  ndviObservationElement.textContent = "NASA PACE data could not be loaded";
});

loadKibiraAirQuality().catch((error) => {
  console.error("Unable to load Kibira air quality:", error);
  kibiraAqiElement.textContent = "Unavailable";
  kibiraAqiCategoryElement.textContent = "Data unavailable";
  kibiraAqiCategoryElement.dataset.level = "unavailable";
  kibiraAirQualityStatusElement.textContent =
    "Current air-quality estimate could not be loaded";
  kibiraPm25Element.textContent = "PM2.5: unavailable";
  kibiraAirQualityUpdateElement.textContent = "Source: Open-Meteo";
});
