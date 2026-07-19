const bodies = {
  kerbin: { name: "Kerbin", radius: 600, mu: 3531.6, min: 70, max: 3000, step: 5 },
  mun: { name: "Mun", radius: 200, mu: 65.138, min: 10, max: 1200, step: 2 },
  minmus: { name: "Minmus", radius: 60, mu: 1.7658, min: 8, max: 450, step: 1 },
  duna: { name: "Duna", radius: 320, mu: 301.363, min: 55, max: 2200, step: 5 },
  eve: { name: "Eve", radius: 700, mu: 8171.73, min: 95, max: 3600, step: 5 },
  moho: { name: "Moho", radius: 250, mu: 168.609, min: 12, max: 1500, step: 2 },
  ike: { name: "Ike", radius: 130, mu: 18.568, min: 10, max: 850, step: 2 },
  jool: { name: "Jool", radius: 6000, mu: 282528, min: 210, max: 28000, step: 20 },
};

const els = {
  body: document.querySelector("#body-select"),
  altitude: document.querySelector("#orbit-altitude"),
  current: document.querySelector("#current-inclination"),
  target: document.querySelector("#target-inclination"),
  altitudeOut: document.querySelector("#altitude-output"),
  currentOut: document.querySelector("#current-output"),
  targetOut: document.querySelector("#target-output"),
  note: document.querySelector("#burn-note"),
  title: document.querySelector("#diagram-title"),
  radius: document.querySelector("#body-radius"),
  mu: document.querySelector("#body-mu"),
  total: document.querySelector("#total-dv"),
  deltaInclination: document.querySelector("#delta-inclination"),
  burnDirection: document.querySelector("#burn-direction"),
  selectedNode: document.querySelector("#selected-node"),
  orbitalSpeed: document.querySelector("#orbital-speed"),
  orbitalPeriod: document.querySelector("#orbital-period"),
  orbitalRadius: document.querySelector("#orbital-radius"),
  canvas: document.querySelector("#orbit-canvas"),
  toggles: document.querySelectorAll(".toggle-button"),
};

const ctx = els.canvas.getContext("2d");
const colors = {
  current: "#5bd7eb",
  target: "#ff18b0",
  amber: "#f5b447",
  craft: "#ff704d",
  craftOutline: "#ffd7cc",
};
const maneuverMarkers = {
  normal: loadManeuverMarker("/assets/normal-marker.png"),
  "anti-normal": loadManeuverMarker("/assets/anti-normal-marker.png"),
};
const tailWidths = [0.5, 0.7, 0.9, 1.1, 1.3, 1.55, 1.8, 2.05, 2.35, 2.65, 2.95, 3.25, 3.55, 3.85, 4.15, 4.5];
const tailOpacities = [0.04, 0.08, 0.13, 0.19, 0.26, 0.34, 0.43, 0.52, 0.61, 0.7, 0.78, 0.84, 0.89, 0.93, 0.96, 0.98];

let activeNode = "ascending";

function loadManeuverMarker(source) {
  const image = new Image();
  image.addEventListener("load", render, { once: true });
  image.src = source;
  return image;
}

function radians(degrees) {
  return (degrees * Math.PI) / 180;
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function formatVelocity(kmPerSecond) {
  return `${Math.round(kmPerSecond * 1000).toLocaleString()} m/s`;
}

function formatKm(value) {
  return `${Math.round(value).toLocaleString()} km`;
}

function formatSignedAngle(value) {
  if (value > 0) return `+${value}°`;
  if (value < 0) return `−${Math.abs(value)}°`;
  return "0°";
}

function normalizePlaneDelta(value) {
  let normalized = ((value + 180) % 360 + 360) % 360 - 180;
  if (normalized === -180 && value > 0) normalized = 180;
  return Object.is(normalized, -0) ? 0 : normalized;
}

function formatTime(seconds) {
  const total = Math.round(seconds);
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const secs = total % 60;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m ${String(secs).padStart(2, "0")}s`;
}

function calculatePlaneChange() {
  const body = bodies[els.body.value];
  const altitude = Number(els.altitude.value);
  const currentInclination = Number(els.current.value);
  const targetInclination = Number(els.target.value);
  const signedDelta = normalizePlaneDelta(targetInclination - currentInclination);
  const deltaInclination = Math.abs(signedDelta);
  const orbitalRadius = body.radius + altitude;
  const velocity = Math.sqrt(body.mu / orbitalRadius);
  const deltaV = 2 * velocity * Math.sin(radians(deltaInclination) / 2);
  const period = 2 * Math.PI * Math.sqrt((orbitalRadius ** 3) / body.mu);
  const positiveRotation = signedDelta > 0;
  const atAscending = activeNode === "ascending";
  const maneuverType = deltaInclination === 0
    ? null
    : positiveRotation === atAscending
      ? "normal"
      : "anti-normal";

  return {
    body,
    altitude,
    currentInclination,
    targetInclination,
    signedDelta,
    deltaInclination,
    orbitalRadius,
    velocity,
    deltaV,
    period,
    maneuverType,
  };
}

function updateControlsForBody() {
  const body = bodies[els.body.value];
  els.altitude.min = body.min;
  els.altitude.max = body.max;
  els.altitude.step = body.step;
  els.altitude.value = clamp(Number(els.altitude.value), body.min, body.max);
}

function projectPoint(center, radius, parameter, signedDeltaDegrees) {
  const delta = radians(signedDeltaDegrees);
  const x = radius * Math.cos(parameter);
  const y = radius * Math.sin(parameter) * Math.cos(delta);
  const z = radius * Math.sin(parameter) * Math.sin(delta);
  return {
    x: center.x + y + 0.14 * z,
    y: center.y + 0.22 * x - 0.72 * z,
  };
}

function projectedTangent(radius, parameter, signedDeltaDegrees) {
  const delta = radians(signedDeltaDegrees);
  return {
    x: radius * Math.cos(parameter) * (Math.cos(delta) + 0.14 * Math.sin(delta)),
    y: -0.22 * radius * Math.sin(parameter) - 0.72 * radius * Math.cos(parameter) * Math.sin(delta),
  };
}

function traceProjectedPath(center, radius, delta, start, end, segments = 160) {
  ctx.beginPath();
  for (let index = 0; index <= segments; index += 1) {
    const t = start + ((end - start) * index) / segments;
    const point = projectPoint(center, radius, t, delta);
    if (index === 0) ctx.moveTo(point.x, point.y);
    else ctx.lineTo(point.x, point.y);
  }
}

function drawProjectedOrbit(center, radius, delta, color, foreground = false) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = foreground ? 2.15 : 1.55;
  ctx.globalAlpha = foreground ? 0.82 : 0.26;
  ctx.setLineDash([4, 6]);
  ctx.lineCap = "round";
  traceProjectedPath(
    center,
    radius,
    delta,
    foreground ? -Math.PI / 2 : 0,
    foreground ? Math.PI / 2 : Math.PI * 2,
    foreground ? 80 : 180
  );
  ctx.stroke();
  ctx.restore();
}

function drawReferencePlane(center, radius) {
  ctx.save();
  ctx.strokeStyle = "rgba(91, 215, 235, 0.09)";
  ctx.lineWidth = 1;
  ctx.setLineDash([2, 7]);
  for (const scale of [0.4, 0.64, 1.14]) {
    traceProjectedPath(center, radius * scale, 0, 0, Math.PI * 2, 120);
    ctx.stroke();
  }
  ctx.strokeStyle = "rgba(245, 180, 71, 0.18)";
  ctx.setLineDash([3, 8]);
  ctx.beginPath();
  ctx.moveTo(center.x, center.y - radius * 0.34);
  ctx.lineTo(center.x, center.y + radius * 0.34);
  ctx.stroke();
  ctx.restore();
}

function drawBody(center, radius, name) {
  const gradient = ctx.createRadialGradient(
    center.x - radius * 0.35,
    center.y - radius * 0.4,
    radius * 0.2,
    center.x,
    center.y,
    radius
  );
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
  ctx.fillStyle = "rgba(226, 242, 245, 0.8)";
  ctx.font = "700 12px 'Courier Prime', monospace";
  ctx.textAlign = "center";
  ctx.fillText(name.toUpperCase(), center.x, center.y + 4);
  ctx.restore();
}

function drawOrbitTail(center, radius, currentInclination, startDegrees, endDegrees) {
  const span = endDegrees - startDegrees;
  ctx.save();
  ctx.strokeStyle = colors.current;
  ctx.lineCap = "round";
  ctx.setLineDash([]);
  for (let index = 0; index < tailWidths.length; index += 1) {
    const start = radians(startDegrees + (span * index) / tailWidths.length);
    const end = radians(startDegrees + (span * (index + 1)) / tailWidths.length);
    ctx.globalAlpha = tailOpacities[index];
    ctx.lineWidth = tailWidths[index];
    traceProjectedPath(center, radius, currentInclination, start, end, 6);
    ctx.stroke();
  }
  ctx.restore();
}

function drawNode(point, label, selected, labelSide) {
  ctx.save();
  ctx.fillStyle = selected ? colors.target : "#050a0f";
  ctx.strokeStyle = selected ? colors.target : colors.amber;
  ctx.lineWidth = selected ? 2 : 1.25;
  ctx.beginPath();
  ctx.arc(point.x, point.y, selected ? 4 : 3, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = selected ? colors.target : colors.amber;
  ctx.font = "700 11px 'Courier Prime', monospace";
  ctx.textAlign = labelSide < 0 ? "right" : "left";
  ctx.fillText(label, point.x + labelSide * 18, point.y + (label === "AN" ? 19 : -12));
  ctx.restore();
}

function drawAngleAnnotation(center, radius, result, nodeParameter) {
  if (result.deltaInclination === 0) return;
  const currentTangent = projectedTangent(radius, nodeParameter, result.currentInclination);
  const targetTangent = projectedTangent(radius, nodeParameter, result.targetInclination);
  let start = Math.atan2(currentTangent.y, currentTangent.x);
  let end = Math.atan2(targetTangent.y, targetTangent.x);
  let span = end - start;
  while (span > Math.PI) span -= Math.PI * 2;
  while (span < -Math.PI) span += Math.PI * 2;
  start += Math.PI;
  end = start + span;
  const arcRadius = radius * 0.62;

  ctx.save();
  ctx.strokeStyle = colors.amber;
  ctx.fillStyle = colors.amber;
  ctx.globalAlpha = 0.86;
  ctx.lineWidth = 1.5;
  ctx.setLineDash([]);
  ctx.beginPath();
  ctx.arc(center.x, center.y, arcRadius, start, end, span < 0);
  ctx.stroke();
  for (const angle of [start, end]) {
    const inner = arcRadius - 5;
    const outer = arcRadius + 5;
    ctx.beginPath();
    ctx.moveTo(center.x + Math.cos(angle) * inner, center.y + Math.sin(angle) * inner);
    ctx.lineTo(center.x + Math.cos(angle) * outer, center.y + Math.sin(angle) * outer);
    ctx.stroke();
  }
  const middle = start + span / 2;
  ctx.font = "700 11px 'Courier Prime', monospace";
  ctx.textAlign = "center";
  ctx.fillText(
    `Δi ${result.deltaInclination}°`,
    center.x + Math.cos(middle) * (arcRadius + 18),
    center.y + Math.sin(middle) * (arcRadius + 18) + 4
  );
  ctx.restore();
}

function drawBurnVector(x, y, maneuverType) {
  if (!maneuverType) return;
  const direction = maneuverType === "normal" ? -1 : 1;
  const stemStart = y + direction * 12;
  const stemEnd = y + direction * 38;
  const tip = y + direction * 45;
  ctx.save();
  ctx.strokeStyle = colors.target;
  ctx.fillStyle = colors.target;
  ctx.lineWidth = 3;
  ctx.lineCap = "butt";
  ctx.beginPath();
  ctx.moveTo(x, stemStart);
  ctx.lineTo(x, stemEnd);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x, tip);
  ctx.lineTo(x - 5, y + direction * 33);
  ctx.lineTo(x + 5, y + direction * 33);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawCraft(x, y, rotation) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(radians(rotation));
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

function drawManeuverInstruction(x, y, result) {
  if (!result.maneuverType) return;
  const marker = maneuverMarkers[result.maneuverType];
  const side = activeNode === "ascending" ? 1 : -1;
  const iconX = x + side * 46;
  const iconY = y;
  if (marker?.complete && marker.naturalWidth > 0) {
    ctx.save();
    ctx.globalAlpha = 0.97;
    ctx.drawImage(marker, iconX - 15, iconY - 15, 30, 30);
    ctx.restore();
  }
  ctx.save();
  ctx.fillStyle = colors.target;
  ctx.font = "700 11px 'Courier Prime', monospace";
  ctx.textAlign = side > 0 ? "left" : "right";
  const noteX = iconX + side * 22;
  ctx.fillText("PLANE BURN", noteX, iconY - 2);
  ctx.fillText(`Δv ${formatVelocity(result.deltaV)}`, noteX, iconY + 12);
  ctx.restore();
}

function drawOrbit(result) {
  const rect = els.canvas.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;
  els.canvas.width = Math.max(1, Math.floor(rect.width * dpr));
  els.canvas.height = Math.max(1, Math.floor(rect.height * dpr));
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  const width = rect.width;
  const height = rect.height;
  const center = { x: width / 2, y: height / 2 };
  const radius = Math.min(width * 0.34, height * 0.34);
  const bodyRadius = clamp((result.body.radius / result.orbitalRadius) * radius, 26, radius * 0.27);
  const ascendingNode = projectPoint(center, radius, 0, 0);
  const descendingNode = projectPoint(center, radius, Math.PI, 0);
  const selectedPoint = activeNode === "ascending" ? ascendingNode : descendingNode;
  const nodeParameter = activeNode === "ascending" ? 0 : Math.PI;

  ctx.clearRect(0, 0, width, height);
  drawReferencePlane(center, radius);
  drawProjectedOrbit(center, radius, result.currentInclination, colors.current, false);
  drawProjectedOrbit(center, radius, result.targetInclination, colors.target, false);
  drawBody(center, bodyRadius, result.body.name);
  drawProjectedOrbit(center, radius, result.currentInclination, colors.current, true);
  drawProjectedOrbit(center, radius, result.targetInclination, colors.target, true);
  drawAngleAnnotation(center, radius, result, nodeParameter);
  drawNode(ascendingNode, "AN", activeNode === "ascending", 1);
  drawNode(descendingNode, "DN", activeNode === "descending", -1);
  drawOrbitTail(
    center,
    radius,
    result.currentInclination,
    activeNode === "ascending" ? -100 : 80,
    activeNode === "ascending" ? 0 : 180
  );
  drawBurnVector(selectedPoint.x, selectedPoint.y, result.maneuverType);
  drawManeuverInstruction(selectedPoint.x, selectedPoint.y, result);
  const craftTangent = projectedTangent(radius, nodeParameter, result.currentInclination);
  drawCraft(
    selectedPoint.x,
    selectedPoint.y,
    (Math.atan2(craftTangent.y, craftTangent.x) * 180) / Math.PI
  );
}

function render() {
  const result = calculatePlaneChange();
  const nodeName = activeNode === "ascending" ? "ascending" : "descending";
  const directionName = result.maneuverType
    ? result.maneuverType === "normal"
      ? "Normal"
      : "Anti-normal"
    : "No burn";

  els.altitudeOut.value = formatKm(result.altitude);
  els.currentOut.value = formatSignedAngle(result.currentInclination);
  els.targetOut.value = formatSignedAngle(result.targetInclination);
  els.title.textContent = `${result.body.name} Plane Plot`;
  els.radius.textContent = `Radius ${formatKm(result.body.radius)}`;
  els.mu.textContent = `GM ${result.body.mu.toLocaleString()} km^3/s^2`;
  els.total.textContent = formatVelocity(result.deltaV);
  els.deltaInclination.textContent = `${result.deltaInclination}°`;
  els.burnDirection.textContent = directionName;
  els.selectedNode.textContent = activeNode === "ascending" ? "Ascending" : "Descending";
  els.orbitalSpeed.textContent = formatVelocity(result.velocity);
  els.orbitalPeriod.textContent = formatTime(result.period);
  els.orbitalRadius.textContent = formatKm(result.orbitalRadius);
  els.note.textContent = result.maneuverType
    ? `Burn ${result.maneuverType} at the ${nodeName} node to rotate the plane ${formatSignedAngle(result.signedDelta)}.`
    : "The current and target planes already match. Save the fuel and stop touching the node handles.";

  drawOrbit(result);
}

function setNode(node) {
  activeNode = node;
  els.toggles.forEach((button) => {
    button.classList.toggle("active", button.dataset.node === activeNode);
  });
  render();
}

els.body.addEventListener("change", () => {
  updateControlsForBody();
  render();
});

[els.altitude, els.current, els.target].forEach((input) => {
  input.addEventListener("input", render);
});

els.toggles.forEach((button) => {
  button.addEventListener("click", () => setNode(button.dataset.node));
});

window.addEventListener("resize", render);

updateControlsForBody();
render();
