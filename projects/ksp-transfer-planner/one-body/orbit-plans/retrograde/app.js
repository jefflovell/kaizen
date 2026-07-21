const bodies = {
  kerbin: { name: "Kerbin", radius: 600, mu: 3531.6, rotation: 21549.4251830898, soi: 84159.286, atmosphere: 70, min: 80, max: 2500, step: 5, initial: 120 },
  mun: { name: "Mun", radius: 200, mu: 65.138, rotation: 138984.376574476, soi: 2429.559, atmosphere: 0, min: 10, max: 1200, step: 5, initial: 100 },
  minmus: { name: "Minmus", radius: 60, mu: 1.7658, rotation: 40400, soi: 2247.428, atmosphere: 0, min: 8, max: 800, step: 2, initial: 80 },
  duna: { name: "Duna", radius: 320, mu: 301.363, rotation: 65517.859375, soi: 47921.949, atmosphere: 50, min: 60, max: 2500, step: 5, initial: 200 },
  eve: { name: "Eve", radius: 700, mu: 8171.73, rotation: 80500, soi: 85109.365, atmosphere: 90, min: 100, max: 4000, step: 10, initial: 300 },
  moho: { name: "Moho", radius: 250, mu: 168.609, rotation: 1210000, soi: 9646.663, atmosphere: 0, min: 12, max: 3000, step: 5, initial: 150 },
  ike: { name: "Ike", radius: 130, mu: 18.568, rotation: 65517.8621348081, soi: 1049.599, atmosphere: 0, min: 8, max: 600, step: 2, initial: 80 },
  jool: { name: "Jool", radius: 6000, mu: 282528, rotation: 36000, soi: 2455985.185, atmosphere: 200, min: 220, max: 15000, step: 20, initial: 1000 },
};

const colors = {
  equator: "#5bd7eb",
  target: "#ff18b0",
  amber: "#f5b447",
  maneuver: "#4cff4c",
  craft: "#ff704d",
  craftOutline: "#ffd7cc",
  text: "#edf7f8",
  muted: "#9bb0b8",
  unsafe: "#ff6f4c",
  grid: "rgba(91, 215, 235, 0.12)",
};

const els = {
  body: document.querySelector("#body-select"),
  altitude: document.querySelector("#orbit-altitude"),
  inclination: document.querySelector("#inclination"),
  latitude: document.querySelector("#launch-latitude"),
  altitudeOut: document.querySelector("#altitude-output"),
  altitudeMin: document.querySelector("#altitude-min"),
  altitudeMid: document.querySelector("#altitude-mid"),
  altitudeMax: document.querySelector("#altitude-max"),
  inclinationOut: document.querySelector("#inclination-output"),
  latitudeOut: document.querySelector("#latitude-output"),
  note: document.querySelector("#launch-note"),
  title: document.querySelector("#diagram-title"),
  bodyPeriod: document.querySelector("#body-period"),
  statusMetric: document.querySelector("#status-metric"),
  retrogradeDv: document.querySelector("#retrograde-dv"),
  penalty: document.querySelector("#rotation-penalty"),
  progradeDv: document.querySelector("#prograde-dv"),
  heading: document.querySelector("#launch-heading"),
  speed: document.querySelector("#orbital-speed"),
  surfaceSpeed: document.querySelector("#surface-speed"),
  period: document.querySelector("#orbital-period"),
  reachable: document.querySelector("#reachable-range"),
  direction: document.querySelector("#orbit-direction"),
  canvas: document.querySelector("#orbit-canvas"),
};

const ctx = els.canvas.getContext("2d");
const retrogradeMarker = new Image();
retrogradeMarker.addEventListener("load", render, { once: true });
retrogradeMarker.src = "/assets/retrograde-marker.png";

const tailWidths = [0.5, 0.65, 0.8, 0.95, 1.1, 1.3, 1.55, 1.8, 2.1, 2.4, 2.75, 3.1, 3.45, 3.8, 4.15, 4.5];

function radians(degrees) {
  return degrees * Math.PI / 180;
}

function degrees(value) {
  return value * 180 / Math.PI;
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function formatVelocity(kmPerSecond, signed = false) {
  const value = Math.round(kmPerSecond * 1000);
  return `${signed && value >= 0 ? "+" : ""}${value.toLocaleString()} m/s`;
}

function formatDuration(seconds) {
  const total = Math.max(0, Math.round(seconds));
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const secs = total % 60;
  return `${hours}h ${String(minutes).padStart(2, "0")}m ${String(secs).padStart(2, "0")}s`;
}

function headingName(heading) {
  if (heading >= 258.75 && heading < 281.25) return "west";
  if (heading >= 326.25 || heading < 11.25) return "north";
  if (heading < 78.75) return "northeast";
  if (heading < 101.25) return "east";
  if (heading < 168.75) return "southeast";
  if (heading < 191.25) return "south";
  if (heading < 258.75) return "southwest";
  return "northwest";
}

function calculate() {
  const body = bodies[els.body.value];
  const altitude = Number(els.altitude.value);
  const inclination = Number(els.inclination.value);
  const latitude = Number(els.latitude.value);
  const orbitRadius = body.radius + altitude;
  const orbitalSpeed = Math.sqrt(body.mu / orbitRadius);
  const orbitalPeriod = 2 * Math.PI * Math.sqrt(orbitRadius ** 3 / body.mu);
  const surfaceEquator = 2 * Math.PI * body.radius / body.rotation;
  const surfaceSpeed = surfaceEquator * Math.cos(radians(latitude));
  const latitudeCosine = Math.cos(radians(latitude));
  const eastTarget = orbitalSpeed * Math.cos(radians(inclination)) / latitudeCosine;
  const reachable = Math.abs(eastTarget) <= orbitalSpeed + 1e-9;
  const northTarget = Math.sqrt(Math.max(0, orbitalSpeed ** 2 - eastTarget ** 2));
  const retrogradeDv = Math.hypot(eastTarget - surfaceSpeed, northTarget);
  const mirroredEast = -eastTarget;
  const progradeDv = Math.hypot(mirroredEast - surfaceSpeed, northTarget);
  const penalty = retrogradeDv - progradeDv;
  const sinAzimuth = clamp(Math.cos(radians(inclination)) / latitudeCosine, -1, 1);
  const heading = (degrees(Math.asin(sinAzimuth)) + 360) % 360;
  const maxRetrogradeInclination = 180 - latitude;
  const orbitValid = altitude > body.atmosphere && orbitRadius < body.soi;
  let failure = "";
  if (altitude <= body.atmosphere) failure = "INSIDE ATMOSPHERE";
  else if (orbitRadius >= body.soi) failure = "OUTSIDE SOI";
  else if (!reachable || inclination > maxRetrogradeInclination + 1e-9) failure = "DIRECT LAUNCH IMPOSSIBLE";

  return {
    body,
    altitude,
    inclination,
    latitude,
    orbitRadius,
    orbitalSpeed,
    orbitalPeriod,
    surfaceSpeed,
    retrogradeDv,
    progradeDv,
    penalty,
    heading,
    maxRetrogradeInclination,
    valid: orbitValid && reachable && inclination <= maxRetrogradeInclination + 1e-9,
    failure,
  };
}

function projectPoint(center, radius, parameter, planeTilt) {
  const tilt = radians(planeTilt);
  const x = radius * Math.cos(parameter);
  const y = radius * Math.sin(parameter) * Math.cos(tilt);
  const z = radius * Math.sin(parameter) * Math.sin(tilt);
  return {
    x: center.x + y + 0.13 * z,
    y: center.y + 0.22 * x - 0.72 * z,
  };
}

function pathOrbit(center, radius, planeTilt, start, end, segments = 160) {
  ctx.beginPath();
  for (let index = 0; index <= segments; index += 1) {
    const parameter = start + (end - start) * index / segments;
    const point = projectPoint(center, radius, parameter, planeTilt);
    if (index === 0) ctx.moveTo(point.x, point.y);
    else ctx.lineTo(point.x, point.y);
  }
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

function drawReferenceGeometry(center, radius) {
  ctx.save();
  ctx.strokeStyle = "rgba(91, 215, 235, 0.11)";
  ctx.lineWidth = 1;
  ctx.setLineDash([2, 8]);
  for (const scale of [0.55, 1.18]) {
    pathOrbit(center, radius * scale, 0, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.beginPath();
  ctx.moveTo(center.x - radius * 1.25, center.y);
  ctx.lineTo(center.x + radius * 1.25, center.y);
  ctx.stroke();
  ctx.restore();
}

function drawOrbit(center, radius, tilt, color, foreground) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.globalAlpha = foreground ? 0.9 : 0.34;
  ctx.lineWidth = foreground ? 2 : 1.4;
  ctx.setLineDash([4, 6]);
  ctx.lineCap = "round";
  pathOrbit(center, radius, tilt, foreground ? -Math.PI / 2 : Math.PI / 2, foreground ? Math.PI / 2 : Math.PI * 1.5, 100);
  ctx.stroke();
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
  drawLabel(center.x, center.y + 4, name.toUpperCase(), colors.text, "center", Math.max(10, radius * 0.18), 0.82);
  ctx.restore();
}

function drawArrow(start, end, color, width = 2, head = 8) {
  const angle = Math.atan2(end.y - start.y, end.x - start.x);
  ctx.save();
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = width;
  ctx.lineCap = "butt";
  ctx.beginPath();
  ctx.moveTo(start.x, start.y);
  ctx.lineTo(end.x - Math.cos(angle) * head * 0.7, end.y - Math.sin(angle) * head * 0.7);
  ctx.stroke();
  ctx.translate(end.x, end.y);
  ctx.rotate(angle);
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(-head, -head * 0.52);
  ctx.lineTo(-head, head * 0.52);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawSpin(center, bodyRadius, result) {
  const arcRadius = bodyRadius * 0.78;
  const start = radians(205);
  const end = radians(335);
  ctx.save();
  ctx.strokeStyle = colors.amber;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.ellipse(center.x, center.y - bodyRadius * 0.12, arcRadius, arcRadius * 0.28, 0, start, end);
  ctx.stroke();
  const point = { x: center.x + arcRadius * Math.cos(end), y: center.y - bodyRadius * 0.12 + arcRadius * 0.28 * Math.sin(end) };
  const before = { x: center.x + arcRadius * Math.cos(end - 0.02), y: center.y - bodyRadius * 0.12 + arcRadius * 0.28 * Math.sin(end - 0.02) };
  drawArrow(before, point, colors.amber, 2, 8);
  ctx.restore();
  drawLabel(center.x, center.y - bodyRadius * 0.72, `SPIN EAST // ${formatVelocity(result.surfaceSpeed)}`, colors.amber, "center", 9, 0.9);
}

function drawTailAndCraft(center, radius, tilt, result) {
  const start = radians(100);
  const end = 0;
  ctx.save();
  ctx.strokeStyle = result.valid ? colors.target : colors.unsafe;
  ctx.lineCap = "butt";
  for (let index = 0; index < tailWidths.length; index += 1) {
    const t0 = start + (end - start) * index / tailWidths.length;
    const t1 = start + (end - start) * (index + 1) / tailWidths.length;
    ctx.globalAlpha = 0.04 + index / (tailWidths.length - 1) * 0.94;
    ctx.lineWidth = tailWidths[index];
    pathOrbit(center, radius, tilt, t0, t1, 5);
    ctx.stroke();
  }
  ctx.restore();

  const craft = projectPoint(center, radius, 0, tilt);
  const before = projectPoint(center, radius, 0.01, tilt);
  const angle = Math.atan2(craft.y - before.y, craft.x - before.x);
  const tangent = { x: Math.cos(angle), y: Math.sin(angle) };
  drawArrow(
    { x: craft.x + tangent.x * 16, y: craft.y + tangent.y * 16 },
    { x: craft.x + tangent.x * 66, y: craft.y + tangent.y * 66 },
    result.valid ? colors.maneuver : colors.unsafe,
    3,
    10
  );

  ctx.save();
  ctx.translate(craft.x, craft.y);
  ctx.rotate(angle);
  ctx.fillStyle = colors.craft;
  ctx.strokeStyle = colors.craftOutline;
  ctx.lineWidth = 1.25;
  ctx.lineJoin = "round";
  ctx.beginPath();
  ctx.moveTo(13, 0);
  ctx.lineTo(-10, -7);
  ctx.lineTo(-5, 0);
  ctx.lineTo(-10, 7);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();

  const normal = { x: tangent.y, y: -tangent.x };
  const marker = { x: craft.x + normal.x * 34, y: craft.y + normal.y * 34 };
  if (retrogradeMarker.complete && retrogradeMarker.naturalWidth) {
    ctx.drawImage(retrogradeMarker, marker.x - 13, marker.y - 13, 26, 26);
  }
  drawLabel(craft.x + tangent.x * 76, craft.y + tangent.y * 76 - 5, `${Math.round(result.heading)}° ${headingName(result.heading).toUpperCase()}`, result.valid ? colors.maneuver : colors.unsafe, "center", 9, 0.94);
}

function drawComparisonBars(area, result) {
  const maxValue = Math.max(result.retrogradeDv, result.progradeDv, 0.001);
  const barWidth = area.width * 0.82;
  const lineX = area.x;
  const topY = area.y + 32;
  const rows = [
    { label: "MIRRORED PROGRADE", value: result.progradeDv, color: colors.equator },
    { label: "RETROGRADE TARGET", value: result.retrogradeDv, color: result.valid ? colors.target : colors.unsafe },
  ];
  drawLabel(area.x, area.y, "IDEAL INSERTION Δv // SAME ALTITUDE", colors.text, "left", 9, 0.76);
  rows.forEach((row, index) => {
    const y = topY + index * 56;
    drawLabel(lineX, y, row.label, row.color, "left", 9, 0.88);
    ctx.save();
    ctx.strokeStyle = "rgba(237, 247, 248, 0.12)";
    ctx.lineWidth = 8;
    ctx.lineCap = "butt";
    ctx.beginPath();
    ctx.moveTo(lineX, y + 17);
    ctx.lineTo(lineX + barWidth, y + 17);
    ctx.stroke();
    ctx.strokeStyle = row.color;
    ctx.globalAlpha = 0.88;
    ctx.beginPath();
    ctx.moveTo(lineX, y + 17);
    ctx.lineTo(lineX + barWidth * row.value / maxValue, y + 17);
    ctx.stroke();
    ctx.restore();
    drawLabel(lineX + barWidth, y + 4, formatVelocity(row.value), row.color, "right", 9, 0.96);
  });
  drawLabel(lineX, topY + 128, `ROTATION TAX ${formatVelocity(result.penalty, true)}`, result.valid ? colors.target : colors.unsafe, "left", 11, 0.98);
  drawLabel(lineX, topY + 149, "EXCLUDES GRAVITY, DRAG, AND STEERING LOSSES", colors.muted, "left", 8, 0.72);
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

  const compact = width < 620;
  const center = compact
    ? { x: width * 0.5, y: height * 0.32 }
    : { x: width * 0.4, y: height * 0.47 };
  const orbitRadius = Math.min(compact ? width * 0.36 : width * 0.34, compact ? height * 0.23 : height * 0.43);
  const bodyRadius = orbitRadius * 0.29;
  const tilt = 180 - result.inclination;

  drawReferenceGeometry(center, orbitRadius);
  drawOrbit(center, orbitRadius, 0, colors.equator, false);
  drawOrbit(center, orbitRadius, tilt, result.valid ? colors.target : colors.unsafe, false);
  drawBody(center, bodyRadius, result.body.name);
  drawSpin(center, bodyRadius, result);
  drawOrbit(center, orbitRadius, 0, colors.equator, true);
  drawOrbit(center, orbitRadius, tilt, result.valid ? colors.target : colors.unsafe, true);
  drawTailAndCraft(center, orbitRadius, tilt, result);

  drawLabel(center.x, center.y - orbitRadius * 0.86, `TARGET ${result.inclination}°`, result.valid ? colors.target : colors.unsafe, "center", 10, 0.92);
  drawLabel(center.x - orbitRadius * 0.82, center.y + orbitRadius * 0.3, "EQUATOR", colors.equator, "right", 8, 0.72);

  const comparison = compact
    ? { x: width * 0.12, y: height * 0.69, width: width * 0.76 }
    : { x: width * 0.67, y: height * 0.24, width: width * 0.28 };
  drawComparisonBars(comparison, result);

  if (!result.valid) {
    drawLabel(width / 2, height - 30, result.failure, colors.unsafe, "center", 12, 0.96);
  }
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
  els.altitudeOut.value = `${result.altitude.toLocaleString()} km`;
  els.inclinationOut.value = `${result.inclination}°`;
  els.latitudeOut.value = `${result.latitude}°`;
  els.title.textContent = `${result.body.name} ${result.inclination}° Insertion`;
  els.bodyPeriod.textContent = `Sidereal day ${formatDuration(result.body.rotation)}`;
  els.statusMetric.classList.toggle("is-invalid", !result.valid);
  els.retrogradeDv.textContent = result.valid ? formatVelocity(result.retrogradeDv) : result.failure;
  els.penalty.textContent = formatVelocity(result.penalty, true);
  els.progradeDv.textContent = formatVelocity(result.progradeDv);
  els.heading.textContent = result.valid ? `${Math.round(result.heading)}° ${headingName(result.heading)}` : "No direct heading";
  els.speed.textContent = formatVelocity(result.orbitalSpeed);
  els.surfaceSpeed.textContent = `${formatVelocity(result.surfaceSpeed)} east`;
  els.period.textContent = formatDuration(result.orbitalPeriod);
  els.reachable.textContent = `90°–${result.maxRetrogradeInclination}°`;
  els.reachable.classList.toggle("is-invalid", !result.valid);
  els.direction.textContent = result.inclination === 90 ? "Polar boundary" : "Retrograde";

  if (!result.valid) {
    if (result.failure === "DIRECT LAUNCH IMPOSSIBLE") {
      els.note.textContent = `A launch site at ${result.latitude}° can directly reach retrograde inclinations only through ${result.maxRetrogradeInclination}°. Launch into a reachable plane or budget a later plane change.`;
    } else {
      els.note.textContent = `This target is ${result.failure.toLowerCase()}. The comparison remains theoretical until the orbit returns to usable space.`;
    }
  } else if (result.inclination === 90) {
    els.note.textContent = `Launch on a northbound 0° heading for the polar boundary. Surface rotation still becomes a sideways velocity component that the ascent must remove.`;
  } else {
    els.note.textContent = `Launch about ${Math.round(result.heading)}° ${headingName(result.heading)} for a ${result.inclination}° orbit. ${result.body.name} contributes ${formatVelocity(result.surfaceSpeed)} eastward before the first engine starts arguing.`;
  }

  drawDiagram(result);
}

els.body.addEventListener("change", () => {
  updateBodyRange();
  render();
});
els.altitude.addEventListener("input", render);
els.inclination.addEventListener("input", render);
els.latitude.addEventListener("input", render);
window.addEventListener("resize", render);

updateBodyRange();
render();
