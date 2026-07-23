const bodies = {
  kerbin: { name: "Kerbin", radius: 600, mu: 3531.6, soi: 84159.286, atmosphere: 70, rotation: 21549.4251830898, step: 5, defaultAltitude: 100, surface: true },
  mun: { name: "Mun", radius: 200, mu: 65.138, soi: 2429.559, atmosphere: 0, rotation: 138984.376574476, step: 2, defaultAltitude: 30, surface: true },
  minmus: { name: "Minmus", radius: 60, mu: 1.7658, soi: 2247.428, atmosphere: 0, rotation: 40400, step: 1, defaultAltitude: 20, surface: true },
  duna: { name: "Duna", radius: 320, mu: 301.363, soi: 47921.949, atmosphere: 50, rotation: 65517.859375, step: 5, defaultAltitude: 80, surface: true },
  eve: { name: "Eve", radius: 700, mu: 8171.73, soi: 85109.365, atmosphere: 90, rotation: 80500, step: 10, defaultAltitude: 120, surface: true },
  moho: { name: "Moho", radius: 250, mu: 168.609, soi: 9646.663, atmosphere: 0, rotation: 1210000, step: 5, defaultAltitude: 40, surface: true },
  ike: { name: "Ike", radius: 130, mu: 18.568, soi: 1049.599, atmosphere: 0, rotation: 65517.8621348081, step: 2, defaultAltitude: 20, surface: true },
  jool: { name: "Jool", radius: 6000, mu: 282528, soi: 2455985.185, atmosphere: 200, rotation: 36000, step: 20, defaultAltitude: 300, surface: false },
};

const sites = {
  ksc: { name: "KSC", latitude: -0.0972, longitude: -74.5577, availability: "Stock" },
  dessert: { name: "Dessert", latitude: -6.52, longitude: -144.04, availability: "Making History" },
  woomerang: { name: "Woomerang", latitude: 45.29, longitude: 136.11, availability: "Making History" },
  cove: { name: "Cove", latitude: 3.7478, longitude: -72.2133, availability: "KSP 1.12 discoverable" },
  glacier: { name: "Glacier Lake", latitude: 73.5615, longitude: 84.248, availability: "KSP 1.12 discoverable" },
};

const colors = {
  latitude: "#f5b447",
  target: "#ff18b0",
  rotation: "#5bd7eb",
  ascent: "#8ce66f",
  craft: "#ff704d",
  craftOutline: "#ffd7cc",
  text: "#edf7f8",
  muted: "#9bb0b8",
  dim: "#6c828b",
  unsafe: "#ff6f4c",
  grid: "rgba(91, 215, 235, 0.13)",
};

const tailWidths = [0.5, 0.7, 0.9, 1.1, 1.3, 1.55, 1.8, 2.05, 2.35, 2.65, 2.95, 3.25, 3.55, 3.85, 4.15, 4.5];
const tailOpacities = [0.04, 0.08, 0.13, 0.19, 0.26, 0.34, 0.43, 0.52, 0.61, 0.7, 0.78, 0.84, 0.89, 0.93, 0.96, 0.98];

const els = {
  modeButtons: document.querySelectorAll("[data-mode]"),
  nodeButtons: document.querySelectorAll("[data-node]"),
  siteField: document.querySelector("#site-field"),
  bodyField: document.querySelector("#body-field"),
  site: document.querySelector("#site-select"),
  body: document.querySelector("#body-select"),
  latitude: document.querySelector("#latitude"),
  latitudeOut: document.querySelector("#latitude-output"),
  altitude: document.querySelector("#altitude"),
  altitudeOut: document.querySelector("#altitude-output"),
  altitudeMin: document.querySelector("#altitude-min"),
  altitudeMax: document.querySelector("#altitude-max"),
  inclination: document.querySelector("#inclination"),
  inclinationOut: document.querySelector("#inclination-output"),
  note: document.querySelector("#launch-note"),
  title: document.querySelector("#diagram-title"),
  doglegLegend: document.querySelector("#dogleg-legend"),
  coordinates: document.querySelector("#site-coordinates"),
  statusMetric: document.querySelector("#status-metric"),
  status: document.querySelector("#access-status"),
  headingLabel: document.querySelector("#heading-label"),
  heading: document.querySelector("#launch-heading"),
  secondHeadingLabel: document.querySelector("#second-heading-label"),
  secondHeading: document.querySelector("#second-heading"),
  creditLabel: document.querySelector("#credit-label"),
  credit: document.querySelector("#rotation-credit"),
  surfaceSpeed: document.querySelector("#surface-speed"),
  orbitSpeed: document.querySelector("#orbit-speed"),
  alongTrack: document.querySelector("#along-track"),
  crossTrack: document.querySelector("#cross-track"),
  rocketSpeed: document.querySelector("#rocket-speed"),
  inclinationBand: document.querySelector("#inclination-band"),
  availability: document.querySelector("#site-availability"),
  canvas: document.querySelector("#orbit-canvas"),
};

const ctx = els.canvas.getContext("2d");
let selectedMode = "site";
let selectedNode = "north";

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function toRad(value) {
  return (value * Math.PI) / 180;
}

function toDeg(value) {
  return (value * 180) / Math.PI;
}

function normalizeDegrees(value) {
  return ((value % 360) + 360) % 360;
}

function formatVelocity(value, signed = false) {
  if (!Number.isFinite(value)) return "—";
  const rounded = Math.round(value * 1000);
  const prefix = signed && rounded > 0 ? "+" : "";
  return `${prefix}${rounded.toLocaleString()} m/s`;
}

function formatHeading(value) {
  if (!Number.isFinite(value)) return "—";
  return `${normalizeDegrees(value).toFixed(1).padStart(5, "0")}°`;
}

function formatLatitude(value) {
  if (Math.abs(value) < 0.05) return "0.0°";
  return `${Math.abs(value).toFixed(1)}° ${value >= 0 ? "N" : "S"}`;
}

function formatLongitude(value) {
  return `${Math.abs(value).toFixed(3)}° ${value >= 0 ? "E" : "W"}`;
}

function bodyAltitudeRange(body) {
  const minimum = Math.max(body.step, Math.ceil((body.atmosphere + body.step) / body.step) * body.step);
  const maximum = Math.max(minimum + body.step * 8, Math.floor(Math.min(25000, body.soi * 0.35 - body.radius) / body.step) * body.step);
  return { minimum, maximum };
}

function currentSite() {
  if (selectedMode === "site") return sites[els.site.value];
  return {
    name: "Custom base",
    latitude: Number(els.latitude.value),
    longitude: null,
    availability: "Player-built surface base",
  };
}

function calculate() {
  const body = selectedMode === "site" ? bodies.kerbin : bodies[els.body.value];
  const site = currentSite();
  const latitude = site.latitude;
  const inclination = Number(els.inclination.value);
  const altitude = Number(els.altitude.value);
  const phi = toRad(latitude);
  const cosPhi = Math.cos(phi);
  const surfaceSpeed = body.surface ? ((2 * Math.PI * body.radius) / body.rotation) * cosPhi : NaN;
  const orbitSpeed = Math.sqrt(body.mu / (body.radius + altitude));
  const directFloor = Math.abs(latitude);
  const directCeiling = 180 - Math.abs(latitude);
  const direct = body.surface && inclination >= directFloor - 0.0001 && inclination <= directCeiling + 0.0001;
  const dogleg = body.surface && !direct;
  const doglegInclination = dogleg
    ? inclination < directFloor ? directFloor : directCeiling
    : inclination;

  function solveTrackHeadings(trackInclination) {
    let north = NaN;
    let south = NaN;
    if (!body.surface) return { north, south };
    if (Math.abs(cosPhi) < 1e-8) {
      north = 0;
      south = 180;
    } else {
      const ratio = clamp(Math.cos(toRad(trackInclination)) / cosPhi, -1, 1);
      const raw = toDeg(Math.asin(ratio));
      north = normalizeDegrees(raw);
      south = normalizeDegrees(180 - raw);
    }
    return { north, south };
  }

  const directTracks = direct ? solveTrackHeadings(inclination) : { north: NaN, south: NaN };
  const doglegTracks = dogleg ? solveTrackHeadings(doglegInclination) : { north: NaN, south: NaN };
  const northInertialHeading = direct ? directTracks.north : doglegTracks.north;
  const southInertialHeading = direct ? directTracks.south : doglegTracks.south;

  function solveLaunchVector(inertialHeading) {
    if (!body.surface || !Number.isFinite(inertialHeading)) {
      return { steeringHeading: NaN, rocketSpeed: NaN, alongTrack: NaN, crossTrack: NaN };
    }
    const trackAngle = toRad(inertialHeading);
    const orbitEast = orbitSpeed * Math.sin(trackAngle);
    const orbitNorth = orbitSpeed * Math.cos(trackAngle);
    const rocketEast = orbitEast - surfaceSpeed;
    const rocketNorth = orbitNorth;
    return {
      steeringHeading: normalizeDegrees(toDeg(Math.atan2(rocketEast, rocketNorth))),
      rocketSpeed: Math.hypot(rocketEast, rocketNorth),
      alongTrack: surfaceSpeed * Math.sin(trackAngle),
      crossTrack: surfaceSpeed * Math.cos(trackAngle),
    };
  }

  const northSolution = solveLaunchVector(northInertialHeading);
  const southSolution = solveLaunchVector(southInertialHeading);
  const selectedInertialHeading = selectedNode === "north" ? northInertialHeading : southInertialHeading;
  const alternateInertialHeading = selectedNode === "north" ? southInertialHeading : northInertialHeading;
  const selectedSolution = selectedNode === "north" ? northSolution : southSolution;
  const alternateSolution = selectedNode === "north" ? southSolution : northSolution;
  const selectedHeading = selectedSolution.steeringHeading;
  const alternateHeading = alternateSolution.steeringHeading;
  const alongTrack = selectedSolution.alongTrack;
  const crossTrack = selectedSolution.crossTrack;
  const rocketSpeed = selectedSolution.rocketSpeed;
  const rotationCredit = body.surface && Number.isFinite(rocketSpeed) ? orbitSpeed - rocketSpeed : NaN;
  const doglegDelta = dogleg ? Math.abs(doglegInclination - inclination) : 0;
  const doglegDv = dogleg ? 2 * orbitSpeed * Math.sin(toRad(doglegDelta) / 2) : 0;

  return {
    body,
    site,
    latitude,
    inclination,
    altitude,
    surfaceSpeed,
    orbitSpeed,
    directFloor,
    directCeiling,
    direct,
    dogleg,
    doglegInclination,
    doglegDelta,
    doglegDv,
    northInertialHeading,
    southInertialHeading,
    selectedInertialHeading,
    alternateInertialHeading,
    selectedHeading,
    alternateHeading,
    alongTrack,
    crossTrack,
    rocketSpeed,
    rotationCredit,
    noSurface: !body.surface,
  };
}

function syncMode() {
  const isSite = selectedMode === "site";
  els.siteField.hidden = !isSite;
  els.bodyField.hidden = isSite;
  els.latitude.disabled = isSite;
  if (isSite) {
    els.body.value = "kerbin";
    els.latitude.value = sites[els.site.value].latitude;
  }
  updateAltitudeRange(true);
}

function updateAltitudeRange(reset = false) {
  const body = selectedMode === "site" ? bodies.kerbin : bodies[els.body.value];
  const range = bodyAltitudeRange(body);
  els.altitude.min = range.minimum;
  els.altitude.max = range.maximum;
  els.altitude.step = body.step;
  if (reset) els.altitude.value = clamp(body.defaultAltitude, range.minimum, range.maximum);
  else els.altitude.value = clamp(Number(els.altitude.value), range.minimum, range.maximum);
  els.altitudeMin.textContent = `${range.minimum.toLocaleString()} km`;
  els.altitudeMax.textContent = `${range.maximum.toLocaleString()} km`;
}

function updateReadouts(result) {
  const locationName = selectedMode === "site" ? result.site.name : `${result.body.name} custom base`;
  els.latitudeOut.textContent = formatLatitude(result.latitude);
  els.altitudeOut.textContent = `${result.altitude.toLocaleString()} km`;
  els.inclinationOut.textContent = `${result.inclination.toFixed(1)}°`;
  els.title.textContent = `${locationName} // ${result.inclination.toFixed(1)}° Target Plane`;
  els.coordinates.textContent = result.site.longitude === null
    ? `${formatLatitude(result.latitude)} // Longitude sets launch time`
    : `${formatLatitude(result.latitude)} // ${formatLongitude(result.site.longitude)}`;

  els.statusMetric.classList.toggle("is-dogleg", !result.direct && !result.noSurface);
  els.statusMetric.classList.toggle("is-no-surface", result.noSurface);
  els.status.textContent = result.noSurface ? "NO SURFACE" : result.direct ? "DIRECT LAUNCH" : "DOGLEG REQUIRED";
  els.doglegLegend.hidden = !result.dogleg;
  els.headingLabel.textContent = result.dogleg ? "Initial launch heading" : "Ideal heading";
  els.heading.textContent = formatHeading(result.selectedHeading);
  els.secondHeadingLabel.textContent = result.dogleg ? "Reachable first plane" : "Second heading";
  els.secondHeading.textContent = result.dogleg
    ? `${result.doglegInclination.toFixed(1)}°`
    : formatHeading(result.alternateHeading);
  els.creditLabel.textContent = result.dogleg
    ? "Plane-change burn"
    : result.rotationCredit < 0 ? "Rotation penalty" : "Rotational credit";
  els.credit.textContent = result.dogleg
    ? formatVelocity(result.doglegDv)
    : formatVelocity(result.rotationCredit, true);
  els.credit.classList.toggle("is-penalty", !result.dogleg && result.rotationCredit < -0.0005);
  els.credit.classList.toggle("is-dogleg-value", result.dogleg);
  els.surfaceSpeed.textContent = formatVelocity(result.surfaceSpeed);
  els.orbitSpeed.textContent = formatVelocity(result.orbitSpeed);
  els.alongTrack.textContent = formatVelocity(result.alongTrack, true);
  els.crossTrack.textContent = formatVelocity(Math.abs(result.crossTrack));
  els.rocketSpeed.textContent = formatVelocity(result.rocketSpeed);
  els.inclinationBand.textContent = result.noSurface
    ? "—"
    : `${result.directFloor.toFixed(1)}°–${result.directCeiling.toFixed(1)}°`;
  els.availability.textContent = result.noSurface ? "Gas giant // no base" : result.site.availability;

  if (result.noSurface) {
    els.note.textContent = "Jool has no surface to launch from. Theoretical spin math is not a landing permit.";
  } else if (!result.direct) {
    els.note.textContent = `Launch into ${result.doglegInclination.toFixed(1)}°, coast to the shared node, then correct ${result.doglegDelta.toFixed(1)}° for about ${formatVelocity(result.doglegDv)}.`;
  } else if (result.rotationCredit < -0.0005) {
    els.note.textContent = "Retrograde means cancelling the planet's free eastward speed before buying the westward speed you actually wanted.";
  } else if (Math.abs(result.crossTrack) > Math.abs(result.alongTrack) * 0.75) {
    els.note.textContent = "Most of the site's spin is sideways to this heading. Geometry has opened the cross-track expense report.";
  } else if (Math.abs(result.latitude) > 60) {
    els.note.textContent = "High latitude makes steep planes natural, but the smaller latitude circle provides less free surface speed.";
  } else {
    els.note.textContent = "The site's eastward motion is doing useful work along the selected launch heading. Please try not to aim west.";
  }
}

function resizeCanvas() {
  const rect = els.canvas.getBoundingClientRect();
  const ratio = Math.min(window.devicePixelRatio || 1, 2);
  const width = Math.max(320, Math.round(rect.width));
  const height = Math.max(420, Math.round(rect.height));
  if (els.canvas.width !== Math.round(width * ratio) || els.canvas.height !== Math.round(height * ratio)) {
    els.canvas.width = Math.round(width * ratio);
    els.canvas.height = Math.round(height * ratio);
  }
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  return { width, height };
}

function ellipsePoint(cx, cy, rx, ry, rotation, angle) {
  const cosR = Math.cos(rotation);
  const sinR = Math.sin(rotation);
  const x = rx * Math.cos(angle);
  const y = ry * Math.sin(angle);
  return { x: cx + x * cosR - y * sinR, y: cy + x * sinR + y * cosR };
}

function ellipseTangent(rx, ry, rotation, angle, direction = 1) {
  const cosR = Math.cos(rotation);
  const sinR = Math.sin(rotation);
  const dx = -rx * Math.sin(angle) * direction;
  const dy = ry * Math.cos(angle) * direction;
  const x = dx * cosR - dy * sinR;
  const y = dx * sinR + dy * cosR;
  const length = Math.hypot(x, y) || 1;
  return { x: x / length, y: y / length, angle: Math.atan2(y, x) };
}

function ellipseVelocity(rx, ry, rotation, angle, direction = 1) {
  const cosR = Math.cos(rotation);
  const sinR = Math.sin(rotation);
  const dx = -rx * Math.sin(angle) * direction;
  const dy = ry * Math.cos(angle) * direction;
  return {
    x: dx * cosR - dy * sinR,
    y: dx * sinR + dy * cosR,
  };
}

function drawDashedEllipse(cx, cy, rx, ry, rotation, color, width = 1.4, alpha = 0.55) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(rotation);
  ctx.strokeStyle = color;
  ctx.globalAlpha = alpha;
  ctx.lineWidth = width;
  ctx.setLineDash([6, 7]);
  ctx.beginPath();
  ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}

function drawDashedEllipseArc(cx, cy, rx, ry, rotation, startAngle, endAngle, color, width = 1.4, alpha = 0.78) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(rotation);
  ctx.strokeStyle = color;
  ctx.globalAlpha = alpha;
  ctx.lineWidth = width;
  ctx.setLineDash([6, 7]);
  ctx.beginPath();
  ctx.ellipse(0, 0, rx, ry, 0, startAngle, endAngle);
  ctx.stroke();
  ctx.restore();
}

function drawTail(cx, cy, rx, ry, rotation, endAngle, direction, color) {
  const coverage = toRad(100);
  for (let index = 0; index < 16; index += 1) {
    const startFraction = index / 16;
    const endFraction = (index + 1) / 16;
    const a0 = endAngle - direction * coverage * (1 - startFraction);
    const a1 = endAngle - direction * coverage * (1 - endFraction);
    const p0 = ellipsePoint(cx, cy, rx, ry, rotation, a0);
    const p1 = ellipsePoint(cx, cy, rx, ry, rotation, a1);
    ctx.save();
    ctx.strokeStyle = color;
    ctx.globalAlpha = tailOpacities[index];
    ctx.lineWidth = tailWidths[index];
    ctx.lineCap = "butt";
    ctx.beginPath();
    ctx.moveTo(p0.x, p0.y);
    ctx.lineTo(p1.x, p1.y);
    ctx.stroke();
    ctx.restore();
  }
}

function drawArrow(fromX, fromY, toX, toY, color, width = 2.5, alpha = 1, head = 9) {
  const angle = Math.atan2(toY - fromY, toX - fromX);
  ctx.save();
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.globalAlpha = alpha;
  ctx.lineWidth = width;
  ctx.lineCap = "butt";
  ctx.beginPath();
  ctx.moveTo(fromX, fromY);
  ctx.lineTo(toX, toY);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(toX, toY);
  ctx.lineTo(toX - Math.cos(angle - 0.48) * head, toY - Math.sin(angle - 0.48) * head);
  ctx.lineTo(toX - Math.cos(angle + 0.48) * head, toY - Math.sin(angle + 0.48) * head);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawCraft(x, y, angle, scale = 1) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  ctx.scale(scale, scale);
  ctx.fillStyle = colors.craft;
  ctx.strokeStyle = colors.craftOutline;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(14, 0);
  ctx.lineTo(-10, -8);
  ctx.lineTo(-6, 0);
  ctx.lineTo(-10, 8);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}

function drawLabel(x, y, text, color, align = "left", size = 12, alpha = 1) {
  ctx.save();
  ctx.fillStyle = color;
  ctx.globalAlpha = alpha;
  ctx.font = `700 ${size}px 'Courier Prime', monospace`;
  ctx.textAlign = align;
  ctx.fillText(text, x, y);
  ctx.restore();
}

function drawBody(cx, cy, radius, result) {
  if (result.body.atmosphere > 0) {
    ctx.save();
    ctx.strokeStyle = result.noSurface ? colors.unsafe : colors.rotation;
    ctx.globalAlpha = 0.18;
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.arc(cx, cy, radius + 6, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  const gradient = ctx.createRadialGradient(cx - radius * 0.34, cy - radius * 0.36, radius * 0.08, cx, cy, radius);
  gradient.addColorStop(0, result.noSurface ? "#b6ddb6" : "#a7f1e8");
  gradient.addColorStop(0.38, result.noSurface ? "#5f9b72" : "#35aaa7");
  gradient.addColorStop(1, result.noSurface ? "#193526" : "#082d38");
  ctx.fillStyle = gradient;
  ctx.strokeStyle = "rgba(151, 224, 224, 0.48)";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  drawLabel(cx, cy - radius * 0.24, result.body.name.toUpperCase(), colors.text, "center", 13, 0.9);
}

function drawVelocityTriangle(result, x, y, scale) {
  const panelWidth = 190 * scale;
  const panelHeight = 125 * scale;
  ctx.save();
  ctx.fillStyle = "rgba(5, 10, 15, 0.88)";
  ctx.strokeStyle = "rgba(180, 208, 220, 0.24)";
  ctx.lineWidth = 1;
  ctx.fillRect(x, y, panelWidth, panelHeight);
  ctx.strokeRect(x, y, panelWidth, panelHeight);
  drawLabel(x + 12 * scale, y + 20 * scale, "VELOCITY TRIANGLE", colors.latitude, "left", 10 * scale);

  if (result.noSurface) {
    drawLabel(x + panelWidth / 2, y + panelHeight / 2 + 5, "NO DIRECT SOLUTION", colors.unsafe, "center", 11 * scale);
    ctx.restore();
    return;
  }

  if (result.dogleg) {
    drawLabel(x + 12 * scale, y + 48 * scale, `1  LAUNCH A ${formatHeading(result.selectedHeading)}`, colors.ascent, "left", 9 * scale);
    drawLabel(x + 12 * scale, y + 72 * scale, `2  CHANGE ${result.doglegDelta.toFixed(1)}°`, colors.target, "left", 9 * scale);
    drawLabel(x + 12 * scale, y + 96 * scale, `   Δv ${formatVelocity(result.doglegDv)}`, colors.target, "left", 9 * scale);
    ctx.restore();
    return;
  }

  const originX = x + 95 * scale;
  const originY = y + 77 * scale;
  const targetLength = 44 * scale;
  const trackAngle = toRad(result.selectedInertialHeading);
  const surfaceRatio = clamp(result.surfaceSpeed / result.orbitSpeed, 0, 0.34);
  const surfaceLength = targetLength * surfaceRatio;
  const targetX = originX + targetLength * Math.sin(trackAngle);
  const targetY = originY - targetLength * Math.cos(trackAngle);
  const spinX = originX + surfaceLength;
  const spinY = originY;
  drawArrow(originX, originY, targetX, targetY, colors.target, 2, 1, 7 * scale);
  drawArrow(originX, originY, spinX, spinY, colors.rotation, 2, 1, Math.min(5 * scale, Math.max(1.5 * scale, surfaceLength * 0.7)));
  drawArrow(spinX, spinY, targetX, targetY, colors.ascent, 2.5, 1, 7 * scale);
  drawLabel(spinX, spinY + 27 * scale, "V SURFACE", colors.rotation, "center", 8 * scale);
  drawLabel(targetX, targetY + (targetY < originY ? -7 : 13) * scale, "V ORBIT", colors.target, "center", 8 * scale);
  drawLabel((spinX + targetX) / 2, (spinY + targetY) / 2 + 13 * scale, "V ROCKET", colors.ascent, "center", 8 * scale);
  ctx.restore();
}

function renderDiagram(result) {
  const { width, height } = resizeCanvas();
  ctx.clearRect(0, 0, width, height);

  const compact = width < 620;
  const cx = compact ? width * 0.5 : width * 0.47;
  const cy = compact ? height * 0.42 : height * 0.45;
  const bodyRadius = Math.min(width, height) * (compact ? 0.16 : 0.155);
  const orbitRx = bodyRadius * (compact ? 1.9 : 2.18);
  const geometricInclination = Math.min(result.inclination, 180 - result.inclination);
  const orbitRy = orbitRx * (0.18 + 0.58 * Math.sin(toRad(geometricInclination)));
  const orbitRotation = result.dogleg ? -0.3 : -0.08;
  const direction = result.inclination <= 90 ? -1 : 1;
  const craftAngle = direction < 0 ? 0.79 : 2.35;
  const craftPoint = ellipsePoint(cx, cy, orbitRx, orbitRy, orbitRotation, craftAngle);
  const craftTangent = ellipseTangent(orbitRx, orbitRy, orbitRotation, craftAngle, direction);
  const doglegGeometricInclination = Math.min(result.doglegInclination, 180 - result.doglegInclination);
  const doglegRy = orbitRx * (0.18 + 0.58 * Math.sin(toRad(doglegGeometricInclination)));
  const doglegDirection = result.doglegInclination <= 90 ? -1 : 1;
  const doglegNodeAngle = doglegDirection < 0 ? 0 : Math.PI;
  const doglegNode = ellipsePoint(cx, cy, orbitRx, doglegRy, orbitRotation, doglegNodeAngle);
  const doglegTangent = ellipseTangent(orbitRx, doglegRy, orbitRotation, doglegNodeAngle, doglegDirection);

  ctx.save();
  ctx.strokeStyle = colors.grid;
  ctx.lineWidth = 1;
  ctx.setLineDash([3, 9]);
  for (let angle = 0; angle < 360; angle += 30) {
    const rad = toRad(angle);
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + Math.cos(rad) * orbitRx * 1.25, cy + Math.sin(rad) * orbitRx * 0.9);
    ctx.stroke();
  }
  ctx.restore();

  drawDashedEllipse(cx, cy, orbitRx, orbitRy, orbitRotation, colors.target, 1.5, 0.66);
  if (result.dogleg) {
    drawDashedEllipse(cx, cy, orbitRx, doglegRy, orbitRotation, colors.ascent, 1.5, 0.66);
  }

  const latRad = toRad(result.latitude);
  const latitudeY = cy - Math.sin(latRad) * bodyRadius * 0.72;
  const latitudeRx = Math.max(4, bodyRadius * Math.cos(latRad));
  const latitudeRy = Math.max(2, latitudeRx * 0.23);
  ctx.save();
  ctx.strokeStyle = colors.latitude;
  ctx.globalAlpha = 0.82;
  ctx.lineWidth = 1.5;
  ctx.setLineDash([5, 5]);
  ctx.beginPath();
  ctx.ellipse(cx, latitudeY, latitudeRx, latitudeRy, 0, Math.PI, Math.PI * 2);
  ctx.stroke();
  ctx.restore();

  drawBody(cx, cy, bodyRadius, result);

  ctx.save();
  ctx.strokeStyle = colors.latitude;
  ctx.globalAlpha = 0.96;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.ellipse(cx, latitudeY, latitudeRx, latitudeRy, 0, 0, Math.PI);
  ctx.stroke();
  ctx.restore();

  drawDashedEllipseArc(cx, cy, orbitRx, orbitRy, orbitRotation, 0, Math.PI, colors.target, 1.5, 0.82);
  if (result.dogleg) {
    drawDashedEllipseArc(cx, cy, orbitRx, doglegRy, orbitRotation, 0, Math.PI, colors.ascent, 1.5, 0.82);
    drawTail(cx, cy, orbitRx, doglegRy, orbitRotation, doglegNodeAngle, doglegDirection, colors.ascent);
  } else {
    drawTail(cx, cy, orbitRx, orbitRy, orbitRotation, craftAngle, direction, colors.target);
  }

  drawArrow(cx, cy + bodyRadius + 42, cx, cy - bodyRadius - 52, colors.muted, 1.4, 0.8, 8);
  drawLabel(cx + 10, cy - bodyRadius - 45, "N", colors.muted, "left", 11);
  drawLabel(cx + 10, cy + bodyRadius + 39, "S", colors.muted, "left", 11);

  const siteX = cx;
  const siteY = latitudeY + latitudeRy;
  ctx.fillStyle = result.noSurface ? colors.unsafe : colors.latitude;
  ctx.beginPath();
  ctx.arc(siteX, siteY, 5, 0, Math.PI * 2);
  ctx.fill();
  drawLabel(siteX, siteY + 62, "LAUNCH SITE", result.noSurface ? colors.unsafe : colors.latitude, "center", compact ? 9 : 11);

  const spinY = siteY - 24;
  drawArrow(siteX + 7, spinY, siteX + 70, spinY, colors.rotation, 2.4, result.noSurface ? 0.3 : 1, 9);
  drawLabel(siteX + 38, spinY - 18, "EAST // SPIN", colors.rotation, "center", compact ? 8 : 10, result.noSurface ? 0.35 : 1);

  if ((result.direct || result.dogleg) && !result.noSurface) {
    const headingAngle = toRad(result.selectedHeading);
    const headingX = Math.sin(headingAngle);
    const headingY = -Math.cos(headingAngle);
    const headingStartX = siteX;
    const headingStartY = siteY - 7;
    const headingLength = compact ? 64 : 88;
    const headingEndX = headingStartX + headingX * headingLength;
    const headingEndY = headingStartY + headingY * headingLength;
    drawArrow(headingStartX, headingStartY, headingEndX, headingEndY, colors.ascent, 2.6, 1, 10);
    const mostlyHorizontal = Math.abs(headingX) > 0.7;
    const labelX = headingStartX + headingX * headingLength * 0.62 + (mostlyHorizontal ? 0 : 18);
    const labelY = headingStartY + headingY * headingLength * 0.62 + (mostlyHorizontal ? 12 : 0);
    const headingText = result.dogleg
      ? `1 LAUNCH // A ${formatHeading(result.selectedHeading)}`
      : `A ${formatHeading(result.selectedHeading)}`;
    drawLabel(labelX, labelY, headingText, colors.ascent, "center", compact ? 8 : 11);
  } else {
    ctx.save();
    ctx.strokeStyle = colors.unsafe;
    ctx.globalAlpha = 0.9;
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.moveTo(siteX - 12, siteY + 11);
    ctx.lineTo(siteX + 12, siteY + 35);
    ctx.moveTo(siteX + 12, siteY + 11);
    ctx.lineTo(siteX - 12, siteY + 35);
    ctx.stroke();
    ctx.restore();
    drawLabel(siteX, siteY + 53, result.noSurface ? "NO LAUNCH SITE" : "NO DIRECT HEADING", colors.unsafe, "center", compact ? 9 : 11);
  }

  if (result.dogleg) {
    const outward = doglegNode.x >= cx ? 1 : -1;
    const incomingVelocity = ellipseVelocity(orbitRx, doglegRy, orbitRotation, doglegNodeAngle, doglegDirection);
    const targetVelocity = ellipseVelocity(orbitRx, orbitRy, orbitRotation, doglegNodeAngle, direction);
    const burnX = targetVelocity.x - incomingVelocity.x;
    const burnY = targetVelocity.y - incomingVelocity.y;
    const burnMagnitude = Math.hypot(burnX, burnY) || 1;
    const burnUnitX = burnX / burnMagnitude;
    const burnUnitY = burnY / burnMagnitude;
    ctx.save();
    ctx.strokeStyle = colors.target;
    ctx.fillStyle = "rgba(5, 10, 15, 0.92)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(doglegNode.x, doglegNode.y, compact ? 6 : 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
    drawArrow(
      doglegNode.x + burnUnitX * 5,
      doglegNode.y + burnUnitY * 5,
      doglegNode.x + burnUnitX * (compact ? 25 : 32),
      doglegNode.y + burnUnitY * (compact ? 25 : 32),
      colors.target,
      2.7,
      1,
      compact ? 8 : 10,
    );
    const doglegLabelX = doglegNode.x - outward * (compact ? 5 : 10);
    const doglegAlign = outward > 0 ? "right" : "left";
    drawLabel(doglegLabelX, doglegNode.y - (compact ? 42 : 52), `NODE BURN // Δi ${result.doglegDelta.toFixed(1)}°`, colors.target, doglegAlign, compact ? 8 : 10);
    drawLabel(doglegLabelX, doglegNode.y - (compact ? 28 : 35), `Δv ${formatVelocity(result.doglegDv)}`, colors.target, doglegAlign, compact ? 8 : 10);
    drawCraft(doglegNode.x, doglegNode.y, doglegTangent.angle, compact ? 0.82 : 1);
  } else {
    drawCraft(craftPoint.x, craftPoint.y, craftTangent.angle, compact ? 0.82 : 1);
  }

  drawLabel(cx - orbitRx, cy - orbitRy - 24, `${result.dogleg ? "2 " : ""}TARGET PLANE // ${result.inclination.toFixed(1)}°`, colors.target, "left", compact ? 9 : 11);
  if (result.dogleg) {
    drawLabel(cx - orbitRx, cy + doglegRy + 24, `1 FIRST PLANE // ${result.doglegInclination.toFixed(1)}°`, colors.ascent, "left", compact ? 8 : 10);
  }
  drawLabel(cx - latitudeRx * 0.76, latitudeY - latitudeRy - 10, `LAT ${formatLatitude(result.latitude)}`, colors.latitude, "left", compact ? 9 : 11);

  const triangleScale = compact ? 0.78 : 1;
  const triangleX = compact ? 12 : width - 210;
  const triangleY = height - 145 * triangleScale - 12;
  drawVelocityTriangle(result, triangleX, triangleY, triangleScale);
}

function render() {
  const result = calculate();
  updateReadouts(result);
  renderDiagram(result);
}

els.modeButtons.forEach((button) => {
  button.addEventListener("click", () => {
    selectedMode = button.dataset.mode;
    els.modeButtons.forEach((candidate) => candidate.classList.toggle("active", candidate === button));
    syncMode();
    render();
  });
});

els.nodeButtons.forEach((button) => {
  button.addEventListener("click", () => {
    selectedNode = button.dataset.node;
    els.nodeButtons.forEach((candidate) => candidate.classList.toggle("active", candidate === button));
    render();
  });
});

els.site.addEventListener("change", () => {
  els.latitude.value = sites[els.site.value].latitude;
  render();
});

els.body.addEventListener("change", () => {
  updateAltitudeRange(true);
  render();
});

for (const input of [els.latitude, els.altitude, els.inclination]) input.addEventListener("input", render);

window.addEventListener("resize", render);
syncMode();
render();
