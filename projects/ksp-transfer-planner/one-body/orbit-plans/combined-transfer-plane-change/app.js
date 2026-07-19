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

const colors = {
  current: "#5bd7eb",
  transfer: "#f5b447",
  target: "#ff18b0",
  maneuver: "#4cff4c",
  plane: "#ff18b0",
  craft: "#ff704d",
  craftOutline: "#ffd7cc",
  resultant: "#edf7f8",
};

const tailWidths = [0.5, 0.7, 0.9, 1.1, 1.3, 1.55, 1.8, 2.05, 2.35, 2.65, 2.95, 3.25, 3.55, 3.85, 4.15, 4.5];
const tailOpacities = [0.04, 0.08, 0.13, 0.19, 0.26, 0.34, 0.43, 0.52, 0.61, 0.7, 0.78, 0.84, 0.89, 0.93, 0.96, 0.98];

const els = {
  body: document.querySelector("#body-select"),
  start: document.querySelector("#start-altitude"),
  target: document.querySelector("#target-altitude"),
  currentPlane: document.querySelector("#current-plane"),
  targetPlane: document.querySelector("#target-plane"),
  startOut: document.querySelector("#start-output"),
  targetOut: document.querySelector("#target-output"),
  currentPlaneOut: document.querySelector("#current-plane-output"),
  targetPlaneOut: document.querySelector("#target-plane-output"),
  note: document.querySelector("#burn-note"),
  title: document.querySelector("#diagram-title"),
  radius: document.querySelector("#body-radius"),
  mu: document.querySelector("#body-mu"),
  total: document.querySelector("#total-dv"),
  savings: document.querySelector("#savings"),
  dvOne: document.querySelector("#dv-one"),
  dvTwo: document.querySelector("#dv-two"),
  separate: document.querySelector("#separate-dv"),
  planeDelta: document.querySelector("#plane-delta"),
  time: document.querySelector("#transfer-time"),
  arrivalSpeed: document.querySelector("#arrival-speed"),
  targetSpeed: document.querySelector("#target-speed"),
  arrivalNode: document.querySelector("#arrival-node"),
  canvas: document.querySelector("#orbit-canvas"),
  nodeButtons: document.querySelectorAll("[data-node]"),
};

const ctx = els.canvas.getContext("2d");
let selectedNode = "an";

const markerImages = {
  prograde: loadMarker("/assets/prograde-marker.png"),
  retrograde: loadMarker("/assets/retrograde-marker.png"),
  normal: loadMarker("/assets/normal-marker.png"),
  "anti-normal": loadMarker("/assets/anti-normal-marker.png"),
};

function loadMarker(source) {
  const image = new Image();
  image.addEventListener("load", render, { once: true });
  image.src = source;
  return image;
}

function circularVelocity(mu, radius) {
  return Math.sqrt(mu / radius);
}

function transferVelocity(mu, radius, semiMajorAxis) {
  return Math.sqrt(mu * (2 / radius - 1 / semiMajorAxis));
}

function normalizePlaneDelta(current, target) {
  const raw = target - current;
  let normalized = ((raw + 180) % 360 + 360) % 360 - 180;
  if (Math.abs(normalized) === 180 && raw !== 0) normalized = Math.sign(raw) * 180;
  return normalized;
}

function maneuverForPlane(signedDelta, node) {
  if (Math.abs(signedDelta) < 0.0001) return null;
  const positiveAtNode = node === "an" ? "normal" : "anti-normal";
  const negativeAtNode = node === "an" ? "anti-normal" : "normal";
  return signedDelta > 0 ? positiveAtNode : negativeAtNode;
}

function calculate() {
  const body = bodies[els.body.value];
  const startAlt = Number(els.start.value);
  const targetAlt = Number(els.target.value);
  const currentAngle = Number(els.currentPlane.value);
  const targetAngle = Number(els.targetPlane.value);
  const signedDelta = normalizePlaneDelta(currentAngle, targetAngle);
  const deltaRadians = Math.abs(signedDelta) * Math.PI / 180;
  const signedRadians = signedDelta * Math.PI / 180;
  const r1 = body.radius + startAlt;
  const r2 = body.radius + targetAlt;
  const a = (r1 + r2) / 2;
  const v1 = circularVelocity(body.mu, r1);
  const v2 = circularVelocity(body.mu, r2);
  const vt1 = transferVelocity(body.mu, r1, a);
  const vt2 = transferVelocity(body.mu, r2, a);
  const dv1 = Math.abs(vt1 - v1);
  const dv2 = Math.sqrt(vt2 ** 2 + v2 ** 2 - 2 * vt2 * v2 * Math.cos(deltaRadians));
  const separateCircularization = Math.abs(v2 - vt2);
  const separatePlane = 2 * v2 * Math.sin(deltaRadians / 2);
  const separateTotal = dv1 + separateCircularization + separatePlane;
  const total = dv1 + dv2;
  const tangentComponent = v2 * Math.cos(deltaRadians) - vt2;
  const planeComponent = v2 * Math.sin(signedRadians);
  const transferTime = Math.PI * Math.sqrt((a ** 3) / body.mu);
  const outward = r2 >= r1;
  const injectionType = outward ? "prograde" : "retrograde";
  const tangentialType = tangentComponent >= 0 ? "prograde" : "retrograde";
  const planeType = maneuverForPlane(signedDelta, selectedNode);

  return {
    body,
    startAlt,
    targetAlt,
    currentAngle,
    targetAngle,
    signedDelta,
    deltaRadians,
    r1,
    r2,
    a,
    v1,
    v2,
    vt1,
    vt2,
    dv1,
    dv2,
    total,
    separateTotal,
    savings: Math.max(0, separateTotal - total),
    tangentComponent,
    planeComponent,
    transferTime,
    outward,
    injectionType,
    tangentialType,
    planeType,
  };
}

function formatVelocity(kmPerSecond) {
  return `${Math.round(kmPerSecond * 1000).toLocaleString()} m/s`;
}

function formatTime(seconds) {
  const total = Math.round(seconds);
  const days = Math.floor(total / 21600);
  const hours = Math.floor((total % 21600) / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const secs = total % 60;
  if (days > 0) return `${days}d ${hours}h ${minutes}m`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m ${String(secs).padStart(2, "0")}s`;
}

function formatAngle(value) {
  if (value > 0) return `+${value}°`;
  return `${value}°`;
}

function updateControlsForBody() {
  const body = bodies[els.body.value];
  [els.start, els.target].forEach((input) => {
    input.min = body.min;
    input.max = body.max;
    input.step = body.step;
    input.value = Math.min(Math.max(Number(input.value), body.min), body.max);
  });
  if (Number(els.start.value) === Number(els.target.value)) {
    els.target.value = Math.min(body.max, Number(els.start.value) + body.step * 12);
  }
}

function projectCircle(center, scale, radius, inclination, t) {
  const angle = inclination * Math.PI / 180;
  const x = radius * Math.sin(t) * Math.cos(angle);
  const y = radius * Math.cos(t);
  const z = -radius * Math.sin(t) * Math.sin(angle);
  return {
    x: center.x + (x + 0.14 * z) * scale,
    y: center.y + (0.36 * y - 0.72 * z) * scale,
  };
}

function projectTransfer(center, scale, result, t) {
  const angle = result.currentAngle * Math.PI / 180;
  const c = (result.r1 - result.r2) / 2;
  const b = Math.sqrt(result.r1 * result.r2);
  const alongNodeAxis = c + result.a * Math.cos(t);
  const acrossPlane = b * Math.sin(t);
  const x = acrossPlane * Math.cos(angle);
  const y = alongNodeAxis;
  const z = -acrossPlane * Math.sin(angle);
  return {
    x: center.x + (x + 0.14 * z) * scale,
    y: center.y + (0.36 * y - 0.72 * z) * scale,
  };
}

function samplePath(pointAt, start, end, steps = 140) {
  const points = [];
  for (let index = 0; index <= steps; index += 1) {
    const t = start + (end - start) * index / steps;
    points.push(pointAt(t));
  }
  return points;
}

function strokePoints(points, color, width, alpha, dash = [4, 6]) {
  if (points.length < 2) return;
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.globalAlpha = alpha;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.setLineDash(dash);
  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);
  points.slice(1).forEach((point) => ctx.lineTo(point.x, point.y));
  ctx.stroke();
  ctx.restore();
}

function drawTail(pointAt, startDegrees, endDegrees, color) {
  const start = startDegrees * Math.PI / 180;
  const end = endDegrees * Math.PI / 180;
  const span = end - start;
  for (let index = 0; index < tailWidths.length; index += 1) {
    const a = start + span * index / tailWidths.length;
    const b = start + span * (index + 1) / tailWidths.length;
    strokePoints(samplePath(pointAt, a, b, 7), color, tailWidths[index], tailOpacities[index], []);
  }
}

function tangentAt(pointAt, t) {
  const before = pointAt(t - 0.002);
  const after = pointAt(t + 0.002);
  const dx = after.x - before.x;
  const dy = after.y - before.y;
  const length = Math.hypot(dx, dy) || 1;
  return { x: dx / length, y: dy / length };
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
  ctx.fillStyle = "rgba(226, 242, 245, 0.82)";
  ctx.font = "700 12px 'Courier Prime', monospace";
  ctx.textAlign = "center";
  ctx.fillText(name.toUpperCase(), center.x, center.y + 4);
  ctx.restore();
}

function drawReferenceRings(center, radius) {
  ctx.save();
  ctx.strokeStyle = "rgba(91, 215, 235, 0.08)";
  ctx.lineWidth = 1;
  ctx.setLineDash([2, 8]);
  for (let factor = 0.45; factor <= 1.12; factor += 0.22) {
    ctx.beginPath();
    ctx.ellipse(center.x, center.y, radius * factor, radius * factor * 0.36, 0, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.beginPath();
  ctx.moveTo(center.x - radius * 1.18, center.y);
  ctx.lineTo(center.x + radius * 1.18, center.y);
  ctx.stroke();
  ctx.restore();
}

function drawNodeMarker(point, label, selected, width) {
  ctx.save();
  ctx.strokeStyle = colors.target;
  ctx.fillStyle = selected ? colors.target : "#050a0f";
  ctx.globalAlpha = selected ? 1 : 0.72;
  ctx.lineWidth = selected ? 2 : 1.2;
  ctx.beginPath();
  ctx.arc(point.x, point.y, selected ? 4 : 3.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.restore();

  const canvasHeight = els.canvas.getBoundingClientRect().height;
  const upperNode = point.y < canvasHeight / 2;
  drawLabel(point.x - (upperNode ? 15 : 12), point.y + (upperNode ? -8 : 3), label, colors.target, "right", 10);
}

function drawArrow(origin, unit, length, color, width = 3) {
  if (length < 2) return;
  const end = { x: origin.x + unit.x * length, y: origin.y + unit.y * length };
  const tip = { x: origin.x + unit.x * (length + 7), y: origin.y + unit.y * (length + 7) };
  const perpendicular = { x: -unit.y, y: unit.x };
  const back = { x: end.x - unit.x * 3, y: end.y - unit.y * 3 };
  ctx.save();
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = width;
  ctx.lineCap = "butt";
  ctx.beginPath();
  ctx.moveTo(origin.x, origin.y);
  ctx.lineTo(end.x, end.y);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(tip.x, tip.y);
  ctx.lineTo(back.x + perpendicular.x * 5, back.y + perpendicular.y * 5);
  ctx.lineTo(back.x - perpendicular.x * 5, back.y - perpendicular.y * 5);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawCraft(point, tangent) {
  ctx.save();
  ctx.translate(point.x, point.y);
  ctx.rotate(Math.atan2(tangent.y, tangent.x));
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

function drawMarker(type, x, y, size = 28) {
  const marker = markerImages[type];
  if (!marker?.complete || marker.naturalWidth === 0) return;
  ctx.save();
  ctx.globalAlpha = 0.98;
  ctx.drawImage(marker, x - size / 2, y - size / 2, size, size);
  ctx.restore();
}

function drawBurnOne(result, point, tangent, width) {
  const direction = result.injectionType === "prograde" ? tangent : { x: -tangent.x, y: -tangent.y };
  drawArrow({ x: point.x + direction.x * 12, y: point.y + direction.y * 12 }, direction, 30, colors.maneuver);
  drawCraft(point, tangent);
  const mobile = width < 500;
  const groupX = mobile ? width - 52 : point.x;
  const groupY = mobile ? point.y - 55 : point.y + 52;
  const labelX = mobile ? width - 8 : groupX;
  const align = mobile ? "right" : "center";
  drawMarker(result.injectionType, groupX, groupY, 28);
  drawLabel(labelX, groupY - 23, "BURN 1", colors.maneuver, align, mobile ? 9 : 11);
  drawLabel(labelX, groupY + 25, `Δv ${formatVelocity(result.dv1)}`, colors.maneuver, align, mobile ? 9 : 10);
}

function drawCombinedBurn(result, point, tangent, width) {
  const maxComponent = Math.max(Math.abs(result.tangentComponent), Math.abs(result.planeComponent), 0.001);
  const componentScale = 42 / maxComponent;
  const tangentSign = Math.sign(result.tangentComponent) || 1;
  const tangentUnit = { x: tangent.x * tangentSign, y: tangent.y * tangentSign };
  const planeUnit = result.planeType === "anti-normal" ? { x: 0, y: 1 } : { x: 0, y: -1 };
  const tangentialLength = Math.max(5, Math.abs(result.tangentComponent) * componentScale);
  const planeLength = Math.abs(result.planeComponent) < 0.0001 ? 0 : Math.max(5, Math.abs(result.planeComponent) * componentScale);
  const origin = { x: point.x + 20, y: point.y + 2 };

  drawArrow(origin, tangentUnit, tangentialLength, colors.maneuver, 2.5);
  if (planeLength > 0) drawArrow(origin, planeUnit, planeLength, colors.plane, 2.5);

  const resultEnd = {
    x: origin.x + tangentUnit.x * tangentialLength + planeUnit.x * planeLength,
    y: origin.y + tangentUnit.y * tangentialLength + planeUnit.y * planeLength,
  };
  ctx.save();
  ctx.strokeStyle = colors.resultant;
  ctx.globalAlpha = 0.72;
  ctx.lineWidth = 1.3;
  ctx.setLineDash([3, 3]);
  ctx.beginPath();
  ctx.moveTo(origin.x, origin.y);
  ctx.lineTo(resultEnd.x, resultEnd.y);
  ctx.stroke();
  ctx.restore();

  drawCraft(point, tangent);

  const mobile = width < 500;
  const groupX = mobile ? 52 : Math.min(width - 78, Math.max(78, point.x));
  const groupY = mobile ? point.y + 78 : point.y - 52;
  drawMarker(result.tangentialType, groupX - (result.planeType ? 16 : 0), groupY, 27);
  if (result.planeType) drawMarker(result.planeType, groupX + 17, groupY, 27);
  drawLabel(mobile ? 8 : groupX - 30, mobile ? groupY + 25 : groupY - 4, "BURN 2 // COMBINED", colors.resultant, mobile ? "left" : "right", mobile ? 9 : 10);
  drawLabel(mobile ? 8 : groupX - 30, mobile ? groupY + 38 : groupY + 9, `Δv ${formatVelocity(result.dv2)}`, colors.resultant, mobile ? "left" : "right", mobile ? 9 : 10);
}

function drawLabel(x, y, text, color, align = "left", size = 11) {
  ctx.save();
  ctx.fillStyle = color;
  ctx.font = `700 ${size}px 'Courier Prime', monospace`;
  ctx.textAlign = align;
  ctx.fillText(text, x, y);
  ctx.restore();
}

function drawDiagram(result) {
  const canvas = els.canvas;
  const rect = canvas.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;
  canvas.width = Math.max(1, Math.floor(rect.width * dpr));
  canvas.height = Math.max(1, Math.floor(rect.height * dpr));
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  const width = rect.width;
  const height = rect.height;
  const center = { x: width / 2, y: height / 2 + 8 };
  const plotRadius = Math.min(width * 0.42, height * 0.42);
  const scale = plotRadius / Math.max(result.r1, result.r2);
  const bodyRadius = Math.max(24, Math.min(result.body.radius * scale, plotRadius * 0.17));
  const currentPoint = (t) => projectCircle(center, scale, result.r1, result.currentAngle, t);
  const targetPoint = (t) => projectCircle(center, scale, result.r2, result.targetAngle, t);
  const transferPoint = (t) => projectTransfer(center, scale, result, t);

  ctx.clearRect(0, 0, width, height);
  drawReferenceRings(center, plotRadius);

  strokePoints(samplePath(currentPoint, 0, Math.PI * 2), colors.current, 1.6, 0.2);
  strokePoints(samplePath(targetPoint, 0, Math.PI * 2), colors.target, 1.6, 0.2);
  strokePoints(samplePath(transferPoint, Math.PI, Math.PI * 2), colors.transfer, 1.4, 0.16);
  strokePoints(samplePath(currentPoint, Math.PI / 2, Math.PI * 1.5), colors.current, 1.8, 0.42);
  strokePoints(samplePath(targetPoint, Math.PI / 2, Math.PI * 1.5), colors.target, 1.8, 0.42);
  strokePoints(samplePath(transferPoint, Math.PI / 2, Math.PI), colors.transfer, 2.1, 0.64);

  drawBody(center, bodyRadius, result.body.name);

  strokePoints(samplePath(currentPoint, -Math.PI / 2, Math.PI / 2), colors.current, 1.9, 0.78);
  strokePoints(samplePath(targetPoint, -Math.PI / 2, Math.PI / 2), colors.target, 1.9, 0.78);
  strokePoints(samplePath(transferPoint, 0, Math.PI / 2), colors.transfer, 2.1, 0.82);
  drawTail(currentPoint, -100, 0, colors.current);
  drawTail(transferPoint, 80, 180, colors.transfer);

  const departure = currentPoint(0);
  const arrival = targetPoint(Math.PI);
  const oppositeTargetNode = targetPoint(0);
  const departureTangent = tangentAt(currentPoint, 0);
  const arrivalTangent = tangentAt(transferPoint, Math.PI);

  drawLabel(center.x, center.y - plotRadius * 0.58, `PLANE Δ ${formatAngle(result.signedDelta)}`, colors.plane, "center", 11);
  drawLabel(departure.x + 94, departure.y + 4, `START ${result.startAlt.toLocaleString()} km`, colors.current, "center", 10);
  const targetLabelX = Math.min(width - 72, Math.max(72, arrival.x));
  drawLabel(targetLabelX + 94, arrival.y + 4, `TARGET ${result.targetAlt.toLocaleString()} km`, colors.target, "center", 10);
  drawNodeMarker(arrival, selectedNode.toUpperCase(), true, width);
  drawNodeMarker(oppositeTargetNode, selectedNode === "an" ? "DN" : "AN", false, width);

  drawBurnOne(result, departure, departureTangent, width);
  drawCombinedBurn(result, arrival, arrivalTangent, width);
}

function render() {
  const result = calculate();
  els.startOut.textContent = `${result.startAlt.toLocaleString()} km`;
  els.targetOut.textContent = `${result.targetAlt.toLocaleString()} km`;
  els.currentPlaneOut.textContent = formatAngle(result.currentAngle);
  els.targetPlaneOut.textContent = formatAngle(result.targetAngle);
  els.title.textContent = `${result.body.name} Combined Vector Plot`;
  els.radius.textContent = `Radius ${result.body.radius.toLocaleString()} km`;
  els.mu.textContent = `GM ${result.body.mu.toLocaleString()} km^3/s^2`;
  els.total.textContent = formatVelocity(result.total);
  els.savings.textContent = formatVelocity(result.savings);
  els.dvOne.textContent = formatVelocity(result.dv1);
  els.dvTwo.textContent = formatVelocity(result.dv2);
  els.separate.textContent = formatVelocity(result.separateTotal);
  els.planeDelta.textContent = formatAngle(result.signedDelta);
  els.time.textContent = formatTime(result.transferTime);
  els.arrivalSpeed.textContent = formatVelocity(result.vt2);
  els.targetSpeed.textContent = formatVelocity(result.v2);
  els.arrivalNode.textContent = selectedNode.toUpperCase();

  const first = result.injectionType;
  const second = [result.tangentialType, result.planeType].filter(Boolean).join(" + ");
  const apsis = result.outward ? "apoapsis" : "periapsis";
  els.note.textContent = `Burn ${first} to enter the transfer, coast to ${apsis}, then combine ${second}.`;

  drawDiagram(result);
}

els.body.addEventListener("change", () => {
  updateControlsForBody();
  render();
});

[els.start, els.target, els.currentPlane, els.targetPlane].forEach((input) => {
  input.addEventListener("input", render);
});

els.nodeButtons.forEach((button) => {
  button.addEventListener("click", () => {
    selectedNode = button.dataset.node;
    els.nodeButtons.forEach((candidate) => candidate.classList.toggle("active", candidate === button));
    render();
  });
});

window.addEventListener("resize", render);
updateControlsForBody();
render();
