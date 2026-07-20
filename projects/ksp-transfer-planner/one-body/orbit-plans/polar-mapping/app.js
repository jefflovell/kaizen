const bodies = {
  kerbin: { name: "Kerbin", radius: 600, mu: 3531.6, rotation: 21549.4251830898, soi: 84159.286, atmosphere: 70, min: 80, max: 2500, step: 5, initial: 250 },
  mun: { name: "Mun", radius: 200, mu: 65.138, rotation: 138984.376574476, soi: 2429.559, atmosphere: 0, min: 10, max: 1200, step: 5, initial: 100 },
  minmus: { name: "Minmus", radius: 60, mu: 1.7658, rotation: 40400, soi: 2247.428, atmosphere: 0, min: 8, max: 800, step: 2, initial: 80 },
  duna: { name: "Duna", radius: 320, mu: 301.363, rotation: 65517.859375, soi: 47921.949, atmosphere: 50, min: 60, max: 2500, step: 5, initial: 200 },
  eve: { name: "Eve", radius: 700, mu: 8171.73, rotation: 80500, soi: 85109.365, atmosphere: 90, min: 100, max: 4000, step: 10, initial: 300 },
  moho: { name: "Moho", radius: 250, mu: 168.609, rotation: 1210000, soi: 9646.663, atmosphere: 0, min: 12, max: 3000, step: 5, initial: 150 },
  ike: { name: "Ike", radius: 130, mu: 18.568, rotation: 65517.8621348081, soi: 1049.599, atmosphere: 0, min: 8, max: 600, step: 2, initial: 80 },
  jool: { name: "Jool", radius: 6000, mu: 282528, rotation: 36000, soi: 2455985.185, atmosphere: 200, min: 220, max: 15000, step: 20, initial: 1000 },
};

const colors = {
  track: "#5bd7eb",
  swath: "#77d7ff",
  tail: "#d8f36a",
  gap: "#ff18b0",
  amber: "#f5b447",
  craft: "#ff704d",
  craftOutline: "#ffd7cc",
  grid: "rgba(91, 215, 235, 0.12)",
  gridStrong: "rgba(91, 215, 235, 0.28)",
  text: "#edf7f8",
  muted: "#9bb0b8",
  unsafe: "#ff6f4c",
};

const els = {
  body: document.querySelector("#body-select"),
  altitude: document.querySelector("#orbit-altitude"),
  altitudeOut: document.querySelector("#altitude-output"),
  altitudeMin: document.querySelector("#altitude-min"),
  altitudeMid: document.querySelector("#altitude-mid"),
  altitudeMax: document.querySelector("#altitude-max"),
  inclination: document.querySelector("#inclination"),
  inclinationOut: document.querySelector("#inclination-output"),
  swath: document.querySelector("#scanner-swath"),
  swathOut: document.querySelector("#swath-output"),
  note: document.querySelector("#mapping-note"),
  title: document.querySelector("#diagram-title"),
  bodyPeriod: document.querySelector("#body-period"),
  passFooter: document.querySelector("#pass-footer"),
  statusMetric: document.querySelector("#status-metric"),
  status: document.querySelector("#coverage-status"),
  latitude: document.querySelector("#latitude-reach"),
  mappingTime: document.querySelector("#mapping-time"),
  passes: document.querySelector("#required-passes"),
  peel: document.querySelector("#longitude-peel"),
  orbitalPeriod: document.querySelector("#orbital-period"),
  speed: document.querySelector("#orbital-speed"),
  swathWidth: document.querySelector("#swath-width"),
  gap: document.querySelector("#open-gap"),
  direction: document.querySelector("#orbit-direction"),
  canvas: document.querySelector("#mapping-canvas"),
};

const ctx = els.canvas.getContext("2d");

function wrapRadians(angle) {
  return ((angle + Math.PI) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI) - Math.PI;
}

function wrapDegrees(angle) {
  return ((angle % 360) + 360) % 360;
}

function formatVelocity(value) {
  return `${Math.round(value * 1000).toLocaleString()} m/s`;
}

function formatKm(value) {
  return `${Math.round(value).toLocaleString()} km`;
}

function formatDuration(seconds) {
  const total = Math.max(0, Math.round(seconds));
  const days = Math.floor(total / 86400);
  const hours = Math.floor((total % 86400) / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const secs = total % 60;
  const clock = `${hours}h ${String(minutes).padStart(2, "0")}m ${String(secs).padStart(2, "0")}s`;
  return days ? `${days}d ${clock}` : clock;
}

function circularGap(longitudes) {
  const sorted = [...longitudes].map(wrapDegrees).sort((a, b) => a - b);
  const unique = sorted.filter((value, index) => index === 0 || value - sorted[index - 1] > 0.0001);
  if (unique.length === 0) return { width: 360, start: 0, end: 0 };
  if (unique.length === 1) return { width: 360, start: unique[0], end: unique[0] };
  let largest = { width: -1, start: unique[0], end: unique[0] };
  for (let index = 0; index < unique.length; index += 1) {
    const start = unique[index];
    const end = index === unique.length - 1 ? unique[0] + 360 : unique[index + 1];
    const width = end - start;
    if (width > largest.width) largest = { width, start, end: wrapDegrees(end) };
  }
  return largest;
}

function equatorCrossingLongitude(result, crossingIndex) {
  const time = crossingIndex * result.orbitalPeriod / 2;
  const inertialLongitude = crossingIndex % 2 === 0 ? 0 : 180;
  return wrapDegrees(inertialLongitude - 360 * time / result.body.rotation);
}

function solveCoverage(result, maxCrossings = 1440) {
  const longitudes = [];
  let gap = { width: 360, start: 0, end: 0 };
  let completionCrossings = null;
  for (let index = 0; index < maxCrossings; index += 1) {
    longitudes.push(equatorCrossingLongitude(result, index));
    gap = circularGap(longitudes);
    if (longitudes.length >= 2 && gap.width <= result.swath + 0.0001) {
      completionCrossings = longitudes.length;
      break;
    }
  }
  return {
    crossings: completionCrossings,
    elapsed: completionCrossings ? (completionCrossings - 1) * result.orbitalPeriod / 2 : null,
    gap,
    openGap: Math.max(0, gap.width - result.swath),
  };
}

function calculate() {
  const body = bodies[els.body.value];
  const altitude = Number(els.altitude.value);
  const inclination = Number(els.inclination.value);
  const swath = Number(els.swath.value);
  const orbitRadius = body.radius + altitude;
  const orbitalPeriod = 2 * Math.PI * Math.sqrt(orbitRadius ** 3 / body.mu);
  const orbitalSpeed = Math.sqrt(body.mu / orbitRadius);
  const longitudePeel = wrapDegrees(360 * orbitalPeriod / body.rotation);
  const latitudeLimit = Math.min(inclination, 180 - inclination);
  const mappedLatitude = Math.min(90, latitudeLimit + swath / 2);
  const capsCovered = mappedLatitude >= 90 - 0.0001;
  const swathKm = 2 * Math.PI * body.radius * swath / 360;
  const direction = inclination < 90 ? "Prograde" : inclination > 90 ? "Retrograde" : "Polar";
  const aboveSurface = orbitRadius > body.radius;
  const aboveAtmosphere = altitude > body.atmosphere;
  const insideSoi = orbitRadius < body.soi;
  const orbitValid = aboveSurface && aboveAtmosphere && insideSoi;
  let failure = "";
  if (!aboveSurface) failure = "INTERSECTS BODY";
  else if (!aboveAtmosphere) failure = "INSIDE ATMOSPHERE";
  else if (!insideSoi) failure = "OUTSIDE SOI";
  const result = {
    body,
    altitude,
    inclination,
    swath,
    orbitRadius,
    orbitalPeriod,
    orbitalSpeed,
    longitudePeel,
    latitudeLimit,
    mappedLatitude,
    capsCovered,
    swathKm,
    direction,
    orbitValid,
    failure,
  };
  result.coverage = solveCoverage(result);
  result.coverageValid = orbitValid && capsCovered && Boolean(result.coverage.crossings);
  result.status = !orbitValid
    ? failure
    : !capsCovered
      ? "POLAR CAPS MISSED"
      : !result.coverage.crossings
        ? "COVERAGE STALLS"
        : "GLOBAL COVERAGE";
  result.displayOrbits = Math.min(12, Math.max(4, Math.ceil((result.coverage.crossings || 24) / 2)));
  return result;
}

function groundState(result, time) {
  const orbitalAngle = 2 * Math.PI * time / result.orbitalPeriod;
  const inclination = result.inclination * Math.PI / 180;
  const x = Math.cos(orbitalAngle);
  const y = Math.sin(orbitalAngle) * Math.cos(inclination);
  const z = Math.sin(orbitalAngle) * Math.sin(inclination);
  const inertialLongitude = Math.atan2(y, x);
  const rotationAngle = 2 * Math.PI * time / result.body.rotation;
  return {
    longitude: wrapRadians(inertialLongitude - rotationAngle),
    latitude: Math.asin(Math.max(-1, Math.min(1, z))),
  };
}

function mapPoint(map, state) {
  return {
    x: map.x + (state.longitude + Math.PI) / (2 * Math.PI) * map.width,
    y: map.y + (Math.PI / 2 - state.latitude) / Math.PI * map.height,
  };
}

function drawLabel(x, y, text, color, align = "left", size = 10, alpha = 1) {
  ctx.save();
  ctx.fillStyle = color;
  ctx.globalAlpha = alpha;
  ctx.font = `700 ${size}px 'Courier Prime', monospace`;
  ctx.textAlign = align;
  ctx.fillText(text, x, y);
  ctx.restore();
}

function drawMapFrame(map, result) {
  ctx.save();
  ctx.fillStyle = "rgba(4, 12, 17, 0.72)";
  ctx.strokeStyle = "rgba(91, 215, 235, 0.24)";
  ctx.lineWidth = 1;
  ctx.fillRect(map.x, map.y, map.width, map.height);
  ctx.strokeRect(map.x, map.y, map.width, map.height);

  const northReach = map.y + (90 - result.mappedLatitude) / 180 * map.height;
  const southReach = map.y + (90 + result.mappedLatitude) / 180 * map.height;
  ctx.fillStyle = "rgba(119, 215, 255, 0.04)";
  ctx.fillRect(map.x, northReach, map.width, southReach - northReach);

  if (!result.capsCovered) {
    ctx.fillStyle = "rgba(255, 111, 76, 0.09)";
    ctx.fillRect(map.x, map.y, map.width, northReach - map.y);
    ctx.fillRect(map.x, southReach, map.width, map.y + map.height - southReach);
  }

  for (let longitude = -150; longitude <= 150; longitude += 30) {
    const x = map.x + (longitude + 180) / 360 * map.width;
    ctx.strokeStyle = longitude === 0 ? colors.gridStrong : colors.grid;
    ctx.setLineDash(longitude === 0 ? [] : [2, 7]);
    ctx.beginPath();
    ctx.moveTo(x, map.y);
    ctx.lineTo(x, map.y + map.height);
    ctx.stroke();
    if (longitude % 60 === 0) {
      drawLabel(x, map.y + map.height + 17, `${Math.abs(longitude)}°${longitude < 0 ? "W" : longitude > 0 ? "E" : ""}`, colors.muted, "center", 8, 0.62);
    }
  }

  for (let latitude = -60; latitude <= 60; latitude += 30) {
    const y = map.y + (90 - latitude) / 180 * map.height;
    ctx.strokeStyle = latitude === 0 ? colors.gridStrong : colors.grid;
    ctx.setLineDash(latitude === 0 ? [] : [2, 7]);
    ctx.beginPath();
    ctx.moveTo(map.x, y);
    ctx.lineTo(map.x + map.width, y);
    ctx.stroke();
    drawLabel(map.x - 8, y + 3, `${Math.abs(latitude)}°${latitude < 0 ? "S" : latitude > 0 ? "N" : ""}`, colors.muted, "right", 8, 0.62);
  }
  ctx.restore();

  drawLabel(map.x + map.width / 2, map.y + map.height / 2 + 6, result.body.name.toUpperCase(), colors.text, "center", Math.max(12, Math.min(20, map.width / 36)), 0.1);
  drawLabel(map.x, map.y - 14, `POLAR SURVEY // ${result.swath}° FULL SWATH // ±${result.mappedLatitude.toFixed(result.mappedLatitude % 1 ? 1 : 0)}° MAPPED`, result.coverageValid ? colors.track : colors.unsafe, "left", 9, 0.8);

  if (!result.capsCovered) {
    const missed = 90 - result.mappedLatitude;
    drawLabel(map.x + map.width - 6, map.y + 14, `${missed.toFixed(missed % 1 ? 1 : 0)}° CAP MISSED`, colors.unsafe, "right", 8, 0.9);
    drawLabel(map.x + map.width - 6, map.y + map.height - 8, `${missed.toFixed(missed % 1 ? 1 : 0)}° CAP MISSED`, colors.unsafe, "right", 8, 0.9);
  }
}

function strokeTimedPath(map, result, startTime, endTime, options) {
  const steps = options.steps || 180;
  ctx.save();
  ctx.strokeStyle = options.color;
  ctx.globalAlpha = options.alpha;
  ctx.lineWidth = options.width;
  ctx.lineCap = options.lineCap || "round";
  ctx.setLineDash(options.dash || []);
  ctx.beginPath();
  let previous = null;
  for (let index = 0; index <= steps; index += 1) {
    const time = startTime + (endTime - startTime) * index / steps;
    const point = mapPoint(map, groundState(result, time));
    const horizontalJump = previous ? Math.abs(point.x - previous.x) : 0;
    const nearProjectionPole = previous && (
      Math.min(point.y, previous.y) < map.y + map.height * 0.02
      || Math.max(point.y, previous.y) > map.y + map.height * 0.98
    );
    const projectionPoleJump = nearProjectionPole && horizontalJump > map.width * 0.08;
    if (!previous || horizontalJump > map.width * 0.5 || projectionPoleJump) ctx.moveTo(point.x, point.y);
    else ctx.lineTo(point.x, point.y);
    previous = point;
  }
  ctx.stroke();
  ctx.restore();
}

function drawPasses(map, result) {
  const trackColor = result.orbitValid ? colors.track : colors.unsafe;
  const swathWidth = Math.max(3, map.width * result.swath / 360);
  for (let orbit = 0; orbit < result.displayOrbits; orbit += 1) {
    const start = orbit * result.orbitalPeriod;
    const end = (orbit + 1) * result.orbitalPeriod;
    const progress = (orbit + 1) / result.displayOrbits;
    strokeTimedPath(map, result, start, end, {
      color: result.orbitValid ? colors.swath : colors.unsafe,
      alpha: 0.018 + progress * 0.025,
      width: swathWidth,
      steps: 170,
    });
    strokeTimedPath(map, result, start, end, {
      color: trackColor,
      alpha: 0.15 + progress * 0.42,
      width: orbit === result.displayOrbits - 1 ? 1.8 : 1.2,
      dash: [4, 5],
      lineCap: "butt",
      steps: 170,
    });
  }
}

function previewGap(result) {
  const longitudes = [];
  const crossings = result.displayOrbits * 2;
  for (let index = 0; index < crossings; index += 1) longitudes.push(equatorCrossingLongitude(result, index));
  const gap = circularGap(longitudes);
  return { ...gap, open: Math.max(0, gap.width - result.swath) };
}

function longitudeToX(map, longitude) {
  const signed = wrapDegrees(longitude + 180) - 180;
  return map.x + (signed + 180) / 360 * map.width;
}

function drawGapBracket(map, result) {
  const gap = previewGap(result);
  if (gap.open <= 0.01) return;
  const y = map.y + map.height / 2;
  const x1 = longitudeToX(map, gap.start + result.swath / 2);
  const x2 = longitudeToX(map, gap.end - result.swath / 2);
  const span = Math.abs(x2 - x1);
  ctx.save();
  ctx.strokeStyle = colors.gap;
  ctx.fillStyle = colors.gap;
  ctx.globalAlpha = 0.84;
  ctx.lineWidth = 1.5;
  ctx.setLineDash([3, 4]);
  ctx.beginPath();
  ctx.arc(x1, y, 4, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(x2, y, 4, 0, Math.PI * 2);
  ctx.stroke();
  if (span <= map.width * 0.5) {
    ctx.beginPath();
    ctx.moveTo(x1, y - 10);
    ctx.lineTo(x2, y - 10);
    ctx.stroke();
    drawLabel((x1 + x2) / 2, y - 17, `${gap.open.toFixed(1)}° OPEN`, colors.gap, "center", 8, 0.94);
  } else {
    ctx.beginPath();
    ctx.moveTo(map.x, y - 10);
    ctx.lineTo(Math.min(x1, x2), y - 10);
    ctx.moveTo(Math.max(x1, x2), y - 10);
    ctx.lineTo(map.x + map.width, y - 10);
    ctx.stroke();
    drawLabel(map.x + map.width / 2, y - 17, `${gap.open.toFixed(1)}° WRAP GAP`, colors.gap, "center", 8, 0.94);
  }
  ctx.restore();
}

function drawPeelArrow(map, result) {
  const displayedPeel = Math.min(90, result.longitudePeel);
  const start = map.x + map.width * 0.56;
  const end = start - map.width * displayedPeel / 360;
  const y = map.y + map.height - 20;
  ctx.save();
  ctx.strokeStyle = colors.amber;
  ctx.fillStyle = colors.amber;
  ctx.globalAlpha = 0.84;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(start, y);
  ctx.lineTo(end, y);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(end - 6, y);
  ctx.lineTo(end + 3, y - 4);
  ctx.lineTo(end + 3, y + 4);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
  drawLabel((start + end) / 2, y - 8, `${result.longitudePeel.toFixed(1)}° W / ORBIT`, colors.amber, "center", 8, 0.86);
}

const tailWidths = [0.5, 0.65, 0.8, 0.95, 1.1, 1.3, 1.55, 1.8, 2.1, 2.4, 2.75, 3.1, 3.45, 3.8, 4.15, 4.5];

function drawTailAndCraft(map, result) {
  const latestStart = (result.displayOrbits - 1) * result.orbitalPeriod;
  const craftTime = latestStart + result.orbitalPeriod * 0.125;
  const tailStart = craftTime - result.orbitalPeriod * 100 / 360;
  const points = [];
  for (let index = 0; index <= tailWidths.length; index += 1) {
    const time = tailStart + (craftTime - tailStart) * index / tailWidths.length;
    points.push(mapPoint(map, groundState(result, time)));
  }

  ctx.save();
  ctx.strokeStyle = result.orbitValid ? colors.tail : colors.unsafe;
  ctx.lineCap = "butt";
  for (let index = 0; index < tailWidths.length; index += 1) {
    const p0 = points[index];
    const p1 = points[index + 1];
    if (Math.abs(p1.x - p0.x) > map.width * 0.5) continue;
    ctx.globalAlpha = 0.04 + index / (tailWidths.length - 1) * 0.94;
    ctx.lineWidth = tailWidths[index];
    ctx.beginPath();
    ctx.moveTo(p0.x, p0.y);
    ctx.lineTo(p1.x, p1.y);
    ctx.stroke();
  }
  ctx.restore();

  const point = points.at(-1);
  const before = mapPoint(map, groundState(result, craftTime - result.orbitalPeriod / 10000));
  let dx = point.x - before.x;
  if (Math.abs(dx) > map.width * 0.5) dx += dx > 0 ? -map.width : map.width;
  const dy = point.y - before.y;
  const angle = Math.atan2(dy, dx);
  ctx.save();
  ctx.translate(point.x, point.y);
  ctx.rotate(angle);
  ctx.fillStyle = colors.craft;
  ctx.strokeStyle = colors.craftOutline;
  ctx.lineWidth = 1.25;
  ctx.lineJoin = "round";
  ctx.beginPath();
  ctx.moveTo(12, 0);
  ctx.lineTo(-9, -7);
  ctx.lineTo(-5, 0);
  ctx.lineTo(-9, 7);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();
  drawLabel(point.x + 14, point.y - 10, `PASS ${result.displayOrbits}`, colors.tail, "left", 8, 0.9);
}

function drawDiagram(result) {
  const rect = els.canvas.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;
  els.canvas.width = Math.max(1, Math.floor(rect.width * dpr));
  els.canvas.height = Math.max(1, Math.floor(rect.height * dpr));
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  const width = rect.width;
  const height = rect.height;
  const marginX = width < 560 ? 30 : 48;
  const map = {
    x: marginX,
    y: Math.max(70, height * 0.16),
    width: width - marginX * 2,
    height: Math.max(260, height * 0.6),
  };

  ctx.clearRect(0, 0, width, height);
  drawMapFrame(map, result);
  drawPasses(map, result);
  drawGapBracket(map, result);
  drawPeelArrow(map, result);
  drawTailAndCraft(map, result);
}

function updateBodyRange() {
  const body = bodies[els.body.value];
  els.altitude.min = body.min;
  els.altitude.max = body.max;
  els.altitude.step = body.step;
  els.altitude.value = body.initial;
  els.altitudeMin.textContent = `${body.min.toLocaleString()} km`;
  els.altitudeMid.textContent = Math.round((body.min + body.max) / 2).toLocaleString();
  els.altitudeMax.textContent = `${body.max.toLocaleString()} km`;
}

function render() {
  const result = calculate();
  const statusInvalid = !result.coverageValid;
  const latitudeInvalid = !result.capsCovered;
  const theoretical = result.orbitValid ? "" : "*";

  els.altitudeOut.value = formatKm(result.altitude);
  els.inclinationOut.value = `${result.inclination}°`;
  els.swathOut.value = `${result.swath}°`;
  els.title.textContent = `${result.body.name} ${result.direction === "Polar" ? "Polar" : `${result.inclination}°`} Survey`;
  els.bodyPeriod.textContent = `Sidereal day ${formatDuration(result.body.rotation)}`;
  els.passFooter.textContent = `Showing ${result.displayOrbits} survey orbits`;
  els.statusMetric.classList.toggle("is-invalid", statusInvalid);
  els.status.textContent = result.status;
  els.latitude.textContent = `±${result.mappedLatitude.toFixed(result.mappedLatitude % 1 ? 1 : 0)}°`;
  els.latitude.classList.toggle("is-invalid", latitudeInvalid);
  els.mappingTime.textContent = result.coverage.elapsed === null ? "NO CLOSURE" : `${formatDuration(result.coverage.elapsed)}${theoretical}`;
  els.passes.textContent = result.coverage.crossings ? `${result.coverage.crossings} crossings${theoretical}` : `>1,440 crossings`;
  els.peel.textContent = `${result.longitudePeel.toFixed(1)}° west / orbit`;
  els.orbitalPeriod.textContent = formatDuration(result.orbitalPeriod);
  els.speed.textContent = formatVelocity(result.orbitalSpeed);
  els.swathWidth.textContent = formatKm(result.swathKm);
  els.gap.textContent = `${result.coverage.openGap.toFixed(result.coverage.openGap < 10 ? 1 : 0)}°${theoretical}`;
  els.gap.classList.toggle("is-invalid", !result.coverage.crossings);
  els.direction.textContent = result.direction;

  if (!result.orbitValid) {
    els.note.textContent = `This orbit is ${result.failure.toLowerCase()}. Coverage values marked * are theoretical; move the altitude back into usable orbital space before assigning anyone to watch the scanner progress bar.`;
  } else if (!result.capsCovered) {
    const missed = 90 - result.mappedLatitude;
    els.note.textContent = `The orbit and ${result.swath}° swath leave ${missed.toFixed(missed % 1 ? 1 : 0)}° unmapped around each pole. Move closer to 90° inclination or widen the scanner footprint.`;
  } else if (!result.coverage.crossings) {
    els.note.textContent = `These tracks keep reopening the same longitude gaps. Adjust altitude to change the body's rotation beneath each orbit, or widen the swath before the cartography team begins mapping the same crater for the 700th time.`;
  } else {
    const orbits = (result.coverage.crossings / 2).toFixed(result.coverage.crossings % 2 ? 1 : 0);
    els.note.textContent = `${result.coverage.crossings} equator crossings over about ${orbits} orbits close every longitude gap to one ${result.swath}° swath while reaching both poles.`;
  }

  drawDiagram(result);
}

els.body.addEventListener("change", () => {
  updateBodyRange();
  render();
});
els.altitude.addEventListener("input", render);
els.inclination.addEventListener("input", render);
els.swath.addEventListener("input", render);
window.addEventListener("resize", render);

updateBodyRange();
render();
