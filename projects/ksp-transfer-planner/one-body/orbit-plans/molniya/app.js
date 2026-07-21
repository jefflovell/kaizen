const bodies = {
  kerbin: { name: "Kerbin", radius: 600, mu: 3531.6, rotation: 21549.4251830898, soi: 84159.286, atmosphere: 70, step: 5, defaultPe: 100 },
  mun: { name: "Mun", radius: 200, mu: 65.138, rotation: 138984.376574476, soi: 2429.559, atmosphere: 0, step: 2, defaultPe: 30 },
  minmus: { name: "Minmus", radius: 60, mu: 1.7658, rotation: 40400, soi: 2247.428, atmosphere: 0, step: 1, defaultPe: 20 },
  duna: { name: "Duna", radius: 320, mu: 301.363, rotation: 65517.859375, soi: 47921.949, atmosphere: 50, step: 5, defaultPe: 80 },
  eve: { name: "Eve", radius: 700, mu: 8171.73, rotation: 80500, soi: 85109.365, atmosphere: 90, step: 10, defaultPe: 120 },
  moho: { name: "Moho", radius: 250, mu: 168.609, rotation: 1210000, soi: 9646.663, atmosphere: 0, step: 5, defaultPe: 40 },
  ike: { name: "Ike", radius: 130, mu: 18.568, rotation: 65517.8621348081, soi: 1049.599, atmosphere: 0, step: 2, defaultPe: 20 },
  jool: { name: "Jool", radius: 6000, mu: 282528, rotation: 36000, soi: 2455985.185, atmosphere: 200, step: 20, defaultPe: 300 },
};

const colors = {
  entry: "#5bd7eb",
  orbit: "#f5b447",
  dwell: "#ff18b0",
  maneuver: "#4cff4c",
  craft: "#ff704d",
  craftOutline: "#ffd7cc",
  text: "#edf7f8",
  muted: "#9bb0b8",
  unsafe: "#ff6f4c",
};

const els = {
  body: document.querySelector("#body-select"),
  periapsis: document.querySelector("#periapsis-altitude"),
  periapsisOut: document.querySelector("#periapsis-output"),
  periapsisMin: document.querySelector("#periapsis-min"),
  periapsisMax: document.querySelector("#periapsis-max"),
  ratioButtons: document.querySelectorAll("[data-ratio]"),
  inclination: document.querySelector("#inclination"),
  inclinationOut: document.querySelector("#inclination-output"),
  hemisphereButtons: document.querySelectorAll("[data-hemisphere]"),
  latitude: document.querySelector("#coverage-latitude"),
  latitudeOut: document.querySelector("#latitude-output"),
  note: document.querySelector("#orbit-note"),
  title: document.querySelector("#diagram-title"),
  bodyPeriod: document.querySelector("#body-period"),
  bodySoi: document.querySelector("#body-soi"),
  statusMetric: document.querySelector("#status-metric"),
  status: document.querySelector("#orbit-status"),
  apoapsisAltitude: document.querySelector("#apoapsis-altitude"),
  dwellLabel: document.querySelector("#dwell-label"),
  dwellTime: document.querySelector("#dwell-time"),
  injectionDv: document.querySelector("#injection-dv"),
  orbitalPeriod: document.querySelector("#orbital-period"),
  eccentricity: document.querySelector("#eccentricity"),
  apsisSpeeds: document.querySelector("#apsis-speeds"),
  latitudeReach: document.querySelector("#latitude-reach"),
  repeatCadence: document.querySelector("#repeat-cadence"),
  soiMargin: document.querySelector("#soi-margin"),
  canvas: document.querySelector("#orbit-canvas"),
};

const ctx = els.canvas.getContext("2d");
const progradeMarker = loadMarker("/assets/prograde-marker.png");
const tailWidths = [0.5, 0.65, 0.8, 0.95, 1.1, 1.3, 1.55, 1.8, 2.1, 2.4, 2.75, 3.1, 3.45, 3.8, 4.15, 4.5];
let periodRatio = 2;
let hemisphere = "north";

function loadMarker(source) {
  const image = new Image();
  image.addEventListener("load", render, { once: true });
  image.src = source;
  return image;
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function formatKm(value) {
  const rounded = Math.round(value);
  const sign = rounded < 0 ? "−" : "";
  return `${sign}${Math.abs(rounded).toLocaleString()} km`;
}

function formatVelocity(value) {
  return `${Math.round(value * 1000).toLocaleString()} m/s`;
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

function solveEccentricAnomaly(meanAnomaly, eccentricity) {
  let eccentricAnomaly = eccentricity < 0.8 ? meanAnomaly : Math.PI;
  for (let iteration = 0; iteration < 10; iteration += 1) {
    const residual = eccentricAnomaly - eccentricity * Math.sin(eccentricAnomaly) - meanAnomaly;
    eccentricAnomaly -= residual / (1 - eccentricity * Math.cos(eccentricAnomaly));
  }
  return eccentricAnomaly;
}

function trueAnomalyFromE(eccentricAnomaly, eccentricity) {
  return 2 * Math.atan2(
    Math.sqrt(1 + eccentricity) * Math.sin(eccentricAnomaly / 2),
    Math.sqrt(1 - eccentricity) * Math.cos(eccentricAnomaly / 2),
  );
}

function orbitalLatitude(trueAnomaly, inclination, selectedHemisphere) {
  const omega = selectedHemisphere === "north" ? -Math.PI / 2 : Math.PI / 2;
  return Math.asin(Math.sin(inclination) * Math.sin(omega + trueAnomaly));
}

function calculateDwellTime(eccentricity, inclination, threshold, selectedHemisphere, period) {
  if (eccentricity < 0 || eccentricity >= 1 || threshold > inclination) return 0;
  const samples = 4096;
  let hits = 0;
  for (let index = 0; index < samples; index += 1) {
    const meanAnomaly = Math.PI * 2 * (index + 0.5) / samples;
    const eccentricAnomaly = solveEccentricAnomaly(meanAnomaly, eccentricity);
    const trueAnomaly = trueAnomalyFromE(eccentricAnomaly, eccentricity);
    const latitude = orbitalLatitude(trueAnomaly, inclination, selectedHemisphere);
    const inRegion = selectedHemisphere === "north" ? latitude >= threshold : latitude <= -threshold;
    if (inRegion) hits += 1;
  }
  return period * hits / samples;
}

function periodSemiMajorAxis(body, ratio = periodRatio) {
  const period = body.rotation / ratio;
  return Math.cbrt(body.mu * (period / (2 * Math.PI)) ** 2);
}

function calculate() {
  const body = bodies[els.body.value];
  const periapsisAltitude = Number(els.periapsis.value);
  const inclinationDegrees = Number(els.inclination.value);
  const latitudeDegrees = Number(els.latitude.value);
  const inclination = inclinationDegrees * Math.PI / 180;
  const threshold = latitudeDegrees * Math.PI / 180;
  const period = body.rotation / periodRatio;
  const semiMajor = periodSemiMajorAxis(body);
  const rp = body.radius + periapsisAltitude;
  const ra = 2 * semiMajor - rp;
  const apoapsisAltitude = ra - body.radius;
  const eccentricity = (ra - rp) / (ra + rp);
  const semiMinor = ra > 0 && rp > 0 ? Math.sqrt(ra * rp) : 0;
  const centerOffset = (ra - rp) / 2;
  const periapsisSpeed = ra > rp ? Math.sqrt(body.mu * (2 / rp - 1 / semiMajor)) : 0;
  const apoapsisSpeed = ra > rp ? Math.sqrt(body.mu * (2 / ra - 1 / semiMajor)) : 0;
  const circularPeriapsis = Math.sqrt(body.mu / rp);
  const injectionDv = Math.max(0, periapsisSpeed - circularPeriapsis);
  const dwellTime = calculateDwellTime(eccentricity, inclination, threshold, hemisphere, period);
  const soiMargin = body.soi - ra;
  const hemisphereSign = hemisphere === "north" ? 1 : -1;
  const classicInclination = Math.abs(inclinationDegrees - 63.4) <= 2;
  const physicallyValid = periapsisAltitude > body.atmosphere && ra > rp && ra < body.soi;
  let status = "MOLNIYA-STYLE";
  if (periapsisAltitude <= body.atmosphere) status = "ATMOSPHERIC PERIAPSIS";
  else if (ra <= rp) status = "PERIOD TOO SHORT";
  else if (ra >= body.soi) status = "APOAPSIS OUTSIDE SOI";
  else if (latitudeDegrees > inclinationDegrees) status = "MISSES DWELL LATITUDE";
  else if (eccentricity < 0.5) status = "LOW-ECCENTRICITY ORBIT";
  else if (!classicInclination) status = "MOLNIYA-LIKE LOITER";

  return {
    body,
    periapsisAltitude,
    apoapsisAltitude,
    inclination,
    inclinationDegrees,
    threshold,
    latitudeDegrees,
    period,
    semiMajor,
    semiMinor,
    centerOffset,
    rp,
    ra,
    eccentricity,
    periapsisSpeed,
    apoapsisSpeed,
    injectionDv,
    dwellTime,
    soiMargin,
    hemisphereSign,
    status,
    physicallyValid,
    classicInclination,
  };
}

function updatePeriapsisRange(reset = false) {
  const body = bodies[els.body.value];
  const semiMajor = periodSemiMajorAxis(body);
  const minimum = Math.ceil((body.atmosphere + body.step) / body.step) * body.step;
  const maximum = Math.max(minimum, Math.floor((semiMajor - body.radius - body.step) / body.step) * body.step);
  els.periapsis.min = minimum;
  els.periapsis.max = maximum;
  els.periapsis.step = body.step;
  const requested = reset ? body.defaultPe : Number(els.periapsis.value);
  els.periapsis.value = clamp(requested, minimum, maximum);
  els.periapsisMin.textContent = formatKm(minimum);
  els.periapsisMax.textContent = formatKm(maximum);
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

function drawBody(center, radius, name) {
  const gradient = ctx.createRadialGradient(center.x - radius * 0.35, center.y - radius * 0.4, radius * 0.18, center.x, center.y, radius);
  gradient.addColorStop(0, "#79d8cf");
  gradient.addColorStop(0.62, "#2d766e");
  gradient.addColorStop(1, "#153f42");
  ctx.save();
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(center.x, center.y, radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "rgba(178, 255, 243, 0.35)";
  ctx.lineWidth = 1.5;
  ctx.stroke();
  drawLabel(center.x, center.y + 4, name.toUpperCase(), colors.text, "center", Math.max(9, radius * 0.14), 0.82);
  ctx.restore();
}

function drawCraft(x, y, rotation) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rotation);
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
}

function drawArrow(x, y, direction, color, length = 46) {
  const start = { x: x + direction.x * 11, y: y + direction.y * 11 };
  const end = { x: x + direction.x * (length - 8), y: y + direction.y * (length - 8) };
  const tip = { x: x + direction.x * length, y: y + direction.y * length };
  const normal = { x: -direction.y, y: direction.x };
  const backA = { x: end.x + normal.x * 5, y: end.y + normal.y * 5 };
  const backB = { x: end.x - normal.x * 5, y: end.y - normal.y * 5 };
  ctx.save();
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(start.x, start.y);
  ctx.lineTo(end.x, end.y);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(tip.x, tip.y);
  ctx.lineTo(backA.x, backA.y);
  ctx.lineTo(backB.x, backB.y);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function strokeSampledPath(pointAt, start, end, color, width, alpha, dash = [4, 6], segments = 220) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.globalAlpha = alpha;
  ctx.setLineDash(dash);
  ctx.beginPath();
  for (let index = 0; index <= segments; index += 1) {
    const parameter = start + (end - start) * index / segments;
    const point = pointAt(parameter);
    if (index === 0) ctx.moveTo(point.x, point.y);
    else ctx.lineTo(point.x, point.y);
  }
  ctx.stroke();
  ctx.restore();
}

function drawTail(pointAt, start, end, color) {
  ctx.save();
  ctx.lineCap = "butt";
  tailWidths.forEach((width, index) => {
    const a = start + (end - start) * index / tailWidths.length;
    const b = start + (end - start) * (index + 1) / tailWidths.length;
    const p0 = pointAt(a);
    const p1 = pointAt(b);
    ctx.strokeStyle = color;
    ctx.globalAlpha = 0.04 + index / (tailWidths.length - 1) * 0.94;
    ctx.lineWidth = width;
    ctx.beginPath();
    ctx.moveTo(p0.x, p0.y);
    ctx.lineTo(p1.x, p1.y);
    ctx.stroke();
  });
  ctx.restore();
}

function tangentAt(pointAt, parameter) {
  const before = pointAt(parameter - 0.002);
  const after = pointAt(parameter + 0.002);
  const dx = after.x - before.x;
  const dy = after.y - before.y;
  const length = Math.hypot(dx, dy) || 1;
  return { x: dx / length, y: dy / length };
}

function drawDwellArc(pointAt, result) {
  const steps = 260;
  ctx.save();
  ctx.strokeStyle = result.physicallyValid ? colors.dwell : colors.unsafe;
  ctx.lineWidth = 2.5;
  ctx.globalAlpha = 0.92;
  ctx.setLineDash([4, 6]);
  ctx.beginPath();
  let drawing = false;
  for (let index = 0; index <= steps; index += 1) {
    const eccentricAnomaly = -Math.PI + Math.PI * 2 * index / steps;
    const trueAnomaly = trueAnomalyFromE(eccentricAnomaly + Math.PI, result.eccentricity);
    const latitude = orbitalLatitude(trueAnomaly, result.inclination, hemisphere);
    const inRegion = hemisphere === "north" ? latitude >= result.threshold : latitude <= -result.threshold;
    const point = pointAt(eccentricAnomaly);
    if (inRegion) {
      if (!drawing) ctx.moveTo(point.x, point.y);
      else ctx.lineTo(point.x, point.y);
      drawing = true;
    } else {
      drawing = false;
    }
  }
  ctx.stroke();
  ctx.restore();
}

function drawDiagram(result) {
  const rect = els.canvas.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;
  els.canvas.width = Math.max(1, Math.floor(rect.width * dpr));
  els.canvas.height = Math.max(1, Math.floor(rect.height * dpr));
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  const width = rect.width;
  const height = rect.height;
  ctx.clearRect(0, 0, width, height);

  const projectRaw = (cross, major) => {
    const depth = -major * Math.cos(result.inclination) * result.hemisphereSign;
    const north = major * Math.sin(result.inclination);
    return {
      x: cross + depth * 0.18,
      y: -north * 0.94 + depth * 0.12,
    };
  };
  const orbitRaw = (eccentricAnomaly) => {
    const cross = result.semiMinor * Math.sin(eccentricAnomaly);
    const major = (result.centerOffset + result.semiMajor * Math.cos(eccentricAnomaly)) * result.hemisphereSign;
    return projectRaw(cross, major);
  };
  const rawPoints = Array.from({ length: 241 }, (_, index) => orbitRaw(Math.PI * 2 * index / 240));
  const minX = Math.min(...rawPoints.map((point) => point.x));
  const maxX = Math.max(...rawPoints.map((point) => point.x));
  const minY = Math.min(...rawPoints.map((point) => point.y));
  const maxY = Math.max(...rawPoints.map((point) => point.y));
  const plot = { left: width * 0.09, right: width * 0.91, top: height * 0.12, bottom: height * 0.87 };
  const scale = Math.min((plot.right - plot.left) / (maxX - minX), (plot.bottom - plot.top) / (maxY - minY));
  const offsetX = (plot.left + plot.right) / 2 - (minX + maxX) * scale / 2;
  const offsetY = (plot.top + plot.bottom) / 2 - (minY + maxY) * scale / 2;
  const toScreen = (point) => ({ x: offsetX + point.x * scale, y: offsetY + point.y * scale });
  const orbitPoint = (parameter) => toScreen(orbitRaw(parameter));
  const focus = toScreen({ x: 0, y: 0 });
  const circleRaw = (parameter, radius = result.rp) => projectRaw(
    radius * Math.sin(parameter),
    radius * Math.cos(parameter) * result.hemisphereSign,
  );
  const circlePoint = (parameter) => toScreen(circleRaw(parameter));
  const bodyRadius = Math.max(17, result.body.radius * scale);
  const orbitColor = result.physicallyValid ? colors.orbit : colors.unsafe;
  const motionSign = -result.hemisphereSign;

  ctx.save();
  ctx.strokeStyle = "rgba(91, 215, 235, 0.08)";
  ctx.lineWidth = 1;
  ctx.setLineDash([2, 7]);
  for (const factor of [0.45, 0.72, 1]) {
    ctx.beginPath();
    ctx.arc(focus.x, focus.y, Math.min(width, height) * 0.24 * factor, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.restore();

  const equatorRadius = result.body.radius * 1.48;
  const equatorPoint = (parameter) => toScreen({
    x: equatorRadius * Math.cos(parameter) + equatorRadius * Math.sin(parameter) * 0.18,
    y: equatorRadius * Math.sin(parameter) * 0.16,
  });
  strokeSampledPath(equatorPoint, 0, Math.PI * 2, colors.entry, 1.2, 0.28, [3, 6], 100);
  strokeSampledPath(orbitPoint, -Math.PI, Math.PI, orbitColor, 1.6, 0.52, [4, 6]);
  drawDwellArc(orbitPoint, result);
  strokeSampledPath(circlePoint, Math.PI - 0.9, Math.PI + 0.9, colors.entry, 1.5, 0.64, [4, 6], 80);

  drawBody(focus, bodyRadius, result.body.name);
  strokeSampledPath(equatorPoint, 0, Math.PI, colors.entry, 1.4, 0.52, [3, 6], 50);

  const latitudeOffset = -result.hemisphereSign * result.body.radius * Math.sin(result.threshold) * 0.94 * scale;
  const latitudeRadius = result.body.radius * Math.cos(result.threshold) * scale;
  ctx.save();
  ctx.strokeStyle = colors.entry;
  ctx.globalAlpha = 0.62;
  ctx.lineWidth = 1.2;
  ctx.setLineDash([3, 4]);
  ctx.beginPath();
  ctx.ellipse(focus.x, focus.y + latitudeOffset, latitudeRadius, Math.max(2, latitudeRadius * 0.12), 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();

  drawTail(circlePoint, Math.PI - 1.35 * motionSign, Math.PI, colors.entry);
  drawTail(orbitPoint, -1.15 * motionSign, 0, result.physicallyValid ? colors.dwell : colors.unsafe);

  const periapsis = orbitPoint(Math.PI);
  const periapsisTangent = tangentAt(orbitPoint, Math.PI);
  const periapsisDirection = {
    x: periapsisTangent.x * motionSign,
    y: periapsisTangent.y * motionSign,
  };
  const periapsisRotation = Math.atan2(periapsisDirection.y, periapsisDirection.x);
  drawArrow(periapsis.x, periapsis.y, periapsisDirection, colors.maneuver);
  drawCraft(periapsis.x, periapsis.y, periapsisRotation);
  const calloutSide = periapsis.x < focus.x ? 1 : -1;
  const iconX = focus.x + calloutSide * (bodyRadius + 38);
  const iconY = periapsis.y - 4;
  if (progradeMarker.complete && progradeMarker.naturalWidth) ctx.drawImage(progradeMarker, iconX - 13, iconY - 13, 26, 26);
  drawLabel(iconX, iconY - 22, "BURN 1 / PROGRADE", colors.maneuver, "center", 9, 0.96);
  drawLabel(iconX, iconY + 26, `Δv ${formatVelocity(result.injectionDv)}`, colors.maneuver, "center", 9, 0.96);

  const apoapsis = orbitPoint(0);
  const apoapsisTangent = tangentAt(orbitPoint, 0);
  const apoapsisDirection = {
    x: apoapsisTangent.x * motionSign,
    y: apoapsisTangent.y * motionSign,
  };
  drawCraft(apoapsis.x, apoapsis.y, Math.atan2(apoapsisDirection.y, apoapsisDirection.x));
  const labelSide = apoapsis.x > width / 2 ? -1 : 1;
  drawLabel(apoapsis.x + labelSide * 22, apoapsis.y - 26, `AP ${formatKm(result.apoapsisAltitude)}`, orbitColor, labelSide < 0 ? "right" : "left", 10, 0.94);
  drawLabel(apoapsis.x + labelSide * 22, apoapsis.y - 11, `DWELL ≥ ${result.latitudeDegrees}° ${hemisphere === "north" ? "N" : "S"}`, result.physicallyValid ? colors.dwell : colors.unsafe, labelSide < 0 ? "right" : "left", 10, 0.96);

  drawLabel(focus.x + bodyRadius + 12, focus.y + latitudeOffset + 3, `${result.latitudeDegrees}° ${hemisphere === "north" ? "N" : "S"}`, colors.entry, "left", 9, 0.85);
  drawLabel(focus.x, focus.y - bodyRadius - 12, "N", colors.muted, "center", 9, 0.72);
  drawLabel(focus.x, focus.y + bodyRadius + 18, "S", colors.muted, "center", 9, 0.72);
  drawLabel(width / 2, height - 24, `i ${result.inclinationDegrees.toFixed(1)}° // e ${result.eccentricity.toFixed(3)} // ω ${hemisphere === "north" ? "270°" : "90°"}`, orbitColor, "center", 10, 0.88);
  if (!result.physicallyValid) drawLabel(width / 2, height - 42, result.status, colors.unsafe, "center", 12, 0.98);
}

function render() {
  const result = calculate();
  const pole = hemisphere === "north" ? "N" : "S";
  const theoretical = result.physicallyValid ? "" : "*";
  const statusWarning = result.status !== "MOLNIYA-STYLE";

  els.periapsisOut.value = formatKm(result.periapsisAltitude);
  els.inclinationOut.value = `${result.inclinationDegrees.toFixed(1)}°`;
  els.latitudeOut.value = `${result.latitudeDegrees}° ${pole}`;
  els.title.textContent = `${result.body.name} 1:${periodRatio} ${hemisphere === "north" ? "North" : "South"} Molniya`;
  els.bodyPeriod.textContent = `Sidereal day ${formatDuration(result.body.rotation)}`;
  els.bodySoi.textContent = `SOI ${formatKm(result.body.soi)}`;
  els.statusMetric.classList.toggle("is-invalid", statusWarning);
  els.status.textContent = result.status;
  els.apoapsisAltitude.textContent = `${formatKm(result.apoapsisAltitude)}${theoretical}`;
  els.dwellLabel.textContent = `Dwell above ${result.latitudeDegrees}° ${pole}`;
  els.dwellTime.textContent = `${formatDuration(result.dwellTime)}${theoretical}`;
  els.injectionDv.textContent = `${formatVelocity(result.injectionDv)}${theoretical}`;
  els.orbitalPeriod.textContent = `${formatDuration(result.period)}${theoretical}`;
  els.eccentricity.textContent = result.eccentricity.toFixed(3);
  els.apsisSpeeds.textContent = `${Math.round(result.periapsisSpeed * 1000).toLocaleString()} / ${Math.round(result.apoapsisSpeed * 1000).toLocaleString()} m/s${theoretical}`;
  els.latitudeReach.textContent = `±${result.inclinationDegrees.toFixed(1)}°`;
  els.repeatCadence.textContent = `${periodRatio} orbits / day`;
  els.soiMargin.textContent = `${formatKm(result.soiMargin)}${theoretical}`;
  els.soiMargin.classList.toggle("is-invalid", result.soiMargin <= 0);

  if (result.status === "APOAPSIS OUTSIDE SOI") {
    els.note.textContent = `The 1:${periodRatio} apoapsis leaves ${result.body.name}'s sphere of influence. Choose a shorter period lock or a different body before calling this a one-body orbit.`;
  } else if (result.status === "ATMOSPHERIC PERIAPSIS") {
    els.note.textContent = `Periapsis intersects ${result.body.name}'s atmosphere. The starred ellipse assumes the spacecraft survives repeatedly converting the coverage mission into a heating experiment.`;
  } else if (result.status === "MISSES DWELL LATITUDE") {
    els.note.textContent = `An inclination of ${result.inclinationDegrees.toFixed(1)}° never reaches ${result.latitudeDegrees}° ${pole}. Lower the dwell threshold or tilt the plane farther.`;
  } else if (result.status === "LOW-ECCENTRICITY ORBIT") {
    els.note.textContent = `This period and periapsis produce e ${result.eccentricity.toFixed(3)}. It is resonant, but not eccentric enough to create the dramatic apoapsis loiter expected from a Molniya-style orbit.`;
  } else if (!result.classicInclination) {
    els.note.textContent = `The high ellipse still loiters over ${pole}, but ${result.inclinationDegrees.toFixed(1)}° is not the real-world 63.4° critical inclination. Stock KSP ignores J2 apsidal precession, so the sky will not file a complaint.`;
  } else {
    els.note.textContent = `The 1:${periodRatio} ellipse spends ${formatDuration(result.dwellTime)} above ${result.latitudeDegrees}° ${pole} each orbit. Burn prograde at periapsis, then let Kepler handle the loitering.`;
  }

  drawDiagram(result);
}

function setRatio(value) {
  periodRatio = Number(value);
  els.ratioButtons.forEach((button) => button.classList.toggle("active", Number(button.dataset.ratio) === periodRatio));
  updatePeriapsisRange();
  render();
}

function setHemisphere(value) {
  hemisphere = value;
  els.hemisphereButtons.forEach((button) => button.classList.toggle("active", button.dataset.hemisphere === hemisphere));
  render();
}

els.body.addEventListener("change", () => {
  updatePeriapsisRange(true);
  render();
});
els.periapsis.addEventListener("input", render);
els.inclination.addEventListener("input", render);
els.latitude.addEventListener("input", render);
els.ratioButtons.forEach((button) => button.addEventListener("click", () => setRatio(button.dataset.ratio)));
els.hemisphereButtons.forEach((button) => button.addEventListener("click", () => setHemisphere(button.dataset.hemisphere)));
window.addEventListener("resize", render);

updatePeriapsisRange(true);
render();
