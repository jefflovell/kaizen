const bodies = {
  kerbin: { name: "Kerbin", radius: 600, mu: 3531.6, rotation: 21549.4251830898, soi: 84159.286, min: 70, max: 3000, step: 5 },
  mun: { name: "Mun", radius: 200, mu: 65.138, rotation: 138984.376574476, soi: 2429.559, min: 10, max: 1200, step: 2 },
  minmus: { name: "Minmus", radius: 60, mu: 1.7658, rotation: 40400, soi: 2247.428, min: 8, max: 450, step: 1 },
  duna: { name: "Duna", radius: 320, mu: 301.363, rotation: 65517.859375, soi: 47921.949, min: 55, max: 4000, step: 5 },
  eve: { name: "Eve", radius: 700, mu: 8171.73, rotation: 80500, soi: 85109.365, min: 95, max: 12000, step: 10 },
  moho: { name: "Moho", radius: 250, mu: 168.609, rotation: 1210000, soi: 9646.663, min: 12, max: 5000, step: 5 },
  ike: { name: "Ike", radius: 130, mu: 18.568, rotation: 65517.8621348081, soi: 1049.599, min: 10, max: 850, step: 2 },
  jool: { name: "Jool", radius: 6000, mu: 282528, rotation: 36000, soi: 2455985.185, min: 210, max: 28000, step: 20 },
};

const colors = {
  current: "#5bd7eb",
  transfer: "#f5b447",
  target: "#8ce66f",
  plane: "#ff18b0",
  maneuver: "#4cff4c",
  craft: "#ff704d",
  craftOutline: "#ffd7cc",
  resultant: "#f3f7ef",
  soi: "#ff6f4c",
};

const els = {
  body: document.querySelector("#body-select"),
  parking: document.querySelector("#parking-altitude"),
  parkingOut: document.querySelector("#parking-output"),
  modeButtons: document.querySelectorAll("[data-mode]"),
  inclinationGroup: document.querySelector("#inclination-group"),
  inclination: document.querySelector("#target-inclination"),
  inclinationOut: document.querySelector("#inclination-output"),
  nodeGroup: document.querySelector("#node-group"),
  nodeButtons: document.querySelectorAll("[data-node]"),
  note: document.querySelector("#burn-note"),
  title: document.querySelector("#diagram-title"),
  radius: document.querySelector("#body-radius"),
  periodFooter: document.querySelector("#body-period"),
  statusMetric: document.querySelector("#status-metric"),
  status: document.querySelector("#target-status"),
  syncAltitude: document.querySelector("#sync-altitude"),
  total: document.querySelector("#total-dv"),
  dvOne: document.querySelector("#dv-one"),
  dvTwo: document.querySelector("#dv-two"),
  period: document.querySelector("#orbit-period"),
  targetSpeed: document.querySelector("#target-speed"),
  targetInclination: document.querySelector("#target-inclination-readout"),
  soiMargin: document.querySelector("#soi-margin"),
  arrivalNode: document.querySelector("#arrival-node"),
  canvas: document.querySelector("#orbit-canvas"),
};

const ctx = els.canvas.getContext("2d");
let activeMode = "stationary";
let selectedNode = "an";
let lastSynchronousInclination = 30;

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

function normalizePlaneDelta(value) {
  let normalized = ((value + 180) % 360 + 360) % 360 - 180;
  if (Math.abs(normalized) === 180 && value !== 0) normalized = Math.sign(value) * 180;
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
  const parkingAltitude = Number(els.parking.value);
  const targetAngle = activeMode === "stationary" ? 0 : Number(els.inclination.value);
  const signedDelta = normalizePlaneDelta(targetAngle);
  const deltaRadians = Math.abs(signedDelta) * Math.PI / 180;
  const signedRadians = signedDelta * Math.PI / 180;
  const r1 = body.radius + parkingAltitude;
  const r2 = Math.cbrt(body.mu * (body.rotation / (2 * Math.PI)) ** 2);
  const synchronousAltitude = r2 - body.radius;
  const a = (r1 + r2) / 2;
  const v1 = circularVelocity(body.mu, r1);
  const v2 = circularVelocity(body.mu, r2);
  const vt1 = transferVelocity(body.mu, r1, a);
  const vt2 = transferVelocity(body.mu, r2, a);
  const dv1 = Math.abs(vt1 - v1);
  const dv2 = Math.sqrt(vt2 ** 2 + v2 ** 2 - 2 * vt2 * v2 * Math.cos(deltaRadians));
  const tangentComponent = v2 * Math.cos(deltaRadians) - vt2;
  const planeComponent = v2 * Math.sin(signedRadians);
  const valid = r2 < body.soi;
  const outward = r2 >= r1;

  return {
    body,
    parkingAltitude,
    targetAngle,
    signedDelta,
    r1,
    r2,
    synchronousAltitude,
    a,
    v2,
    vt2,
    dv1,
    dv2,
    total: dv1 + dv2,
    tangentComponent,
    planeComponent,
    planeType: maneuverForPlane(signedDelta, selectedNode),
    tangentialType: tangentComponent >= 0 ? "prograde" : "retrograde",
    injectionType: outward ? "prograde" : "retrograde",
    valid,
    outward,
    soiMargin: body.soi - r2,
  };
}

function formatVelocity(value) {
  return `${Math.round(value * 1000).toLocaleString()} m/s`;
}

function formatKm(value) {
  return `${Math.round(value).toLocaleString()} km`;
}

function formatAngle(value) {
  if (value > 0) return `+${value}°`;
  return `${value}°`;
}

function formatDuration(seconds) {
  const total = Math.round(seconds);
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const secs = total % 60;
  return `${hours}h ${String(minutes).padStart(2, "0")}m ${String(secs).padStart(2, "0")}s`;
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
  const c = (result.r1 - result.r2) / 2;
  const b = Math.sqrt(result.r1 * result.r2);
  const alongNodeAxis = c + result.a * Math.cos(t);
  const acrossPlane = b * Math.sin(t);
  return {
    x: center.x + acrossPlane * scale,
    y: center.y + 0.36 * alongNodeAxis * scale,
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
  ctx.globalAlpha = alpha;
  ctx.lineWidth = width;
  ctx.setLineDash(dash);
  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);
  for (const point of points.slice(1)) ctx.lineTo(point.x, point.y);
  ctx.stroke();
  ctx.restore();
}

function drawTail(pointAt, startDegrees, endDegrees, color) {
  const widths = [0.5, 0.65, 0.8, 0.95, 1.1, 1.3, 1.55, 1.8, 2.1, 2.4, 2.75, 3.1, 3.45, 3.8, 4.15, 4.5];
  const start = startDegrees * Math.PI / 180;
  const end = endDegrees * Math.PI / 180;
  const span = end - start;
  ctx.save();
  ctx.lineCap = "butt";
  widths.forEach((width, index) => {
    const a = start + span * index / widths.length;
    const b = start + span * (index + 1) / widths.length;
    const p0 = pointAt(a);
    const p1 = pointAt(b);
    ctx.strokeStyle = color;
    ctx.globalAlpha = 0.04 + index / (widths.length - 1) * 0.94;
    ctx.lineWidth = width;
    ctx.beginPath();
    ctx.moveTo(p0.x, p0.y);
    ctx.lineTo(p1.x, p1.y);
    ctx.stroke();
  });
  ctx.restore();
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
  for (let factor = 0.35; factor <= 1.12; factor += 0.2) {
    ctx.beginPath();
    ctx.ellipse(center.x, center.y, radius * factor, radius * factor * 0.36, 0, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.restore();
}

function drawSoiBoundary(center, radius, valid) {
  ctx.save();
  ctx.strokeStyle = colors.soi;
  ctx.globalAlpha = valid ? 0.18 : 0.72;
  ctx.lineWidth = valid ? 1 : 1.6;
  ctx.setLineDash([3, 8]);
  ctx.beginPath();
  ctx.ellipse(center.x, center.y, radius, radius * 0.36, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
  drawLabel(center.x - radius + 8, center.y + 7, valid ? "SOI BEYOND PLOT" : "SOI LIMIT", colors.soi, "left", 9, valid ? 0.48 : 0.9);
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

function drawLabel(x, y, text, color, align = "left", size = 11, alpha = 1) {
  ctx.save();
  ctx.fillStyle = color;
  ctx.globalAlpha = alpha;
  ctx.font = `700 ${size}px 'Courier Prime', monospace`;
  ctx.textAlign = align;
  ctx.fillText(text, x, y);
  ctx.restore();
}

function drawRotationClock(center, bodyRadius, period) {
  const radius = bodyRadius + 14;
  const start = -Math.PI * 0.8;
  const end = Math.PI * 0.56;
  ctx.save();
  ctx.strokeStyle = colors.transfer;
  ctx.globalAlpha = 0.78;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(center.x, center.y, radius, start, end);
  ctx.stroke();
  const tip = { x: center.x + radius * Math.cos(end), y: center.y + radius * Math.sin(end) };
  const tangent = { x: -Math.sin(end), y: Math.cos(end) };
  drawArrow({ x: tip.x - tangent.x * 6, y: tip.y - tangent.y * 6 }, tangent, 3, colors.transfer, 1.5);
  ctx.restore();
  drawLabel(center.x, center.y + bodyRadius + 32, `ROTATION ${formatDuration(period)}`, colors.transfer, "center", 9, 0.86);
}

function drawStationaryLock(center, bodyRadius, arrival) {
  const dx = arrival.x - center.x;
  const dy = arrival.y - center.y;
  const length = Math.hypot(dx, dy) || 1;
  const unit = { x: dx / length, y: dy / length };
  const surface = { x: center.x + unit.x * bodyRadius, y: center.y + unit.y * bodyRadius };
  ctx.save();
  ctx.strokeStyle = colors.target;
  ctx.globalAlpha = 0.48;
  ctx.lineWidth = 1;
  ctx.setLineDash([2, 5]);
  ctx.beginPath();
  ctx.moveTo(surface.x, surface.y);
  ctx.lineTo(arrival.x, arrival.y);
  ctx.stroke();
  ctx.restore();
  const labelX = surface.x + (arrival.x - surface.x) * 0.48 + 8;
  const labelY = surface.y + (arrival.y - surface.y) * 0.48;
  drawLabel(labelX, labelY, "SAME LONGITUDE", colors.target, "left", 9, 0.82);
}

function drawGroundTrack(width, height) {
  const center = { x: width - 84, y: height - 92 };
  const points = [];
  for (let index = 0; index <= 100; index += 1) {
    const t = Math.PI * 2 * index / 100;
    points.push({ x: center.x + 31 * Math.sin(2 * t), y: center.y + 52 * Math.sin(t) });
  }
  strokePoints(points, colors.target, 1.7, 0.76, [3, 4]);
  ctx.save();
  ctx.strokeStyle = "rgba(91, 215, 235, 0.22)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.ellipse(center.x, center.y, 48, 58, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
  drawLabel(center.x, center.y - 68, "GROUND TRACK", colors.target, "center", 9, 0.9);
}

function drawBurnOne(result, point, tangent, width) {
  const direction = result.injectionType === "prograde" ? tangent : { x: -tangent.x, y: -tangent.y };
  drawArrow({ x: point.x + direction.x * 12, y: point.y + direction.y * 12 }, direction, 30, colors.maneuver);
  drawCraft(point, tangent);
  const mobile = width < 500;
  const groupX = mobile ? width - 48 : point.x;
  const groupY = mobile ? point.y - 52 : point.y + 52;
  const labelX = mobile ? width - 8 : groupX;
  const align = mobile ? "right" : "center";
  drawMarker(result.injectionType, groupX, groupY, 28);
  drawLabel(labelX, groupY - 23, "BURN 1", colors.maneuver, align, mobile ? 9 : 11);
  drawLabel(labelX, groupY + 25, `Δv ${formatVelocity(result.dv1)}`, colors.maneuver, align, mobile ? 9 : 10);
}

function drawBurnTwo(result, point, tangent, width) {
  const tangentSign = Math.sign(result.tangentComponent) || 1;
  const tangentUnit = { x: tangent.x * tangentSign, y: tangent.y * tangentSign };
  const planeUnit = result.planeType === "anti-normal" ? { x: 0, y: 1 } : { x: 0, y: -1 };
  const maxComponent = Math.max(Math.abs(result.tangentComponent), Math.abs(result.planeComponent), 0.001);
  const componentScale = 42 / maxComponent;
  const tangentialLength = Math.max(5, Math.abs(result.tangentComponent) * componentScale);
  const planeLength = Math.abs(result.planeComponent) < 0.0001 ? 0 : Math.max(5, Math.abs(result.planeComponent) * componentScale);
  const origin = { x: point.x + 18, y: point.y + 2 };
  drawArrow(origin, tangentUnit, tangentialLength, colors.maneuver, 2.5);
  if (planeLength > 0) drawArrow(origin, planeUnit, planeLength, colors.plane, 2.5);

  if (planeLength > 0) {
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
  }

  drawCraft(point, tangent);
  const mobile = width < 500;
  const groupX = mobile ? 50 : Math.min(width - 84, Math.max(84, point.x));
  const groupY = mobile ? point.y + 76 : point.y - 54;
  const hasPlane = Boolean(result.planeType);
  drawMarker(result.tangentialType, groupX - (hasPlane ? 16 : 0), groupY, 27);
  if (hasPlane) drawMarker(result.planeType, groupX + 17, groupY, 27);
  const labelX = mobile ? 8 : groupX - (hasPlane ? 34 : 0);
  const align = mobile ? "left" : "center";
  drawLabel(labelX, mobile ? groupY + 27 : groupY - 24, hasPlane ? "BURN 2 // COMBINED" : "BURN 2", colors.resultant, align, mobile ? 9 : 10);
  drawLabel(labelX, mobile ? groupY + 40 : groupY + 25, `Δv ${formatVelocity(result.dv2)}`, colors.resultant, align, mobile ? 9 : 10);
}

function drawDiagram(result) {
  const rect = els.canvas.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;
  els.canvas.width = Math.max(1, Math.floor(rect.width * dpr));
  els.canvas.height = Math.max(1, Math.floor(rect.height * dpr));
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  const width = rect.width;
  const height = rect.height;
  const center = { x: width / 2, y: height / 2 + 10 };
  const plotRadius = Math.min(width * 0.4, height * 0.4);
  const scale = plotRadius / Math.max(result.r1, result.r2);
  const bodyRadius = Math.max(24, Math.min(result.body.radius * scale, plotRadius * 0.18));
  const currentPoint = (t) => projectCircle(center, scale, result.r1, 0, t);
  const targetPoint = (t) => projectCircle(center, scale, result.r2, result.targetAngle, t);
  const transferPoint = (t) => projectTransfer(center, scale, result, t);
  const soiDrawRadius = result.valid ? plotRadius * 1.08 : result.body.soi * scale;

  ctx.clearRect(0, 0, width, height);
  drawReferenceRings(center, plotRadius);
  drawSoiBoundary(center, soiDrawRadius, result.valid);

  strokePoints(samplePath(currentPoint, 0, Math.PI * 2), colors.current, 1.6, 0.2);
  strokePoints(samplePath(targetPoint, 0, Math.PI * 2), result.valid ? colors.target : colors.soi, 1.6, result.valid ? 0.2 : 0.52);
  strokePoints(samplePath(transferPoint, Math.PI, Math.PI * 2), colors.transfer, 1.4, 0.16);
  strokePoints(samplePath(currentPoint, Math.PI / 2, Math.PI * 1.5), colors.current, 1.8, 0.42);
  strokePoints(samplePath(targetPoint, Math.PI / 2, Math.PI * 1.5), result.valid ? colors.target : colors.soi, 1.8, result.valid ? 0.42 : 0.62);
  strokePoints(samplePath(transferPoint, Math.PI / 2, Math.PI), colors.transfer, 2.1, 0.64);

  drawBody(center, bodyRadius, result.body.name);
  drawRotationClock(center, bodyRadius, result.body.rotation);

  strokePoints(samplePath(currentPoint, -Math.PI / 2, Math.PI / 2), colors.current, 1.9, 0.78);
  strokePoints(samplePath(targetPoint, -Math.PI / 2, Math.PI / 2), result.valid ? colors.target : colors.soi, 1.9, result.valid ? 0.78 : 0.88);
  strokePoints(samplePath(transferPoint, 0, Math.PI / 2), colors.transfer, 2.1, 0.82);
  drawTail(currentPoint, -100, 0, colors.current);
  drawTail(transferPoint, 80, 180, colors.transfer);

  const departure = currentPoint(0);
  const arrival = targetPoint(Math.PI);
  const departureTangent = tangentAt(currentPoint, 0);
  const arrivalTangent = tangentAt(transferPoint, Math.PI);

  if (activeMode === "stationary" && result.valid) drawStationaryLock(center, bodyRadius, arrival);
  if (activeMode === "synchronous" && Math.abs(result.targetAngle) > 0.001) drawGroundTrack(width, height);

  const targetColor = result.valid ? colors.target : colors.soi;
  drawLabel(departure.x + 92, departure.y + 4, `PARK ${formatKm(result.parkingAltitude)}`, colors.current, "center", 10);
  drawLabel(arrival.x + 104, arrival.y + 4, result.valid ? `SYNC ${formatKm(result.synchronousAltitude)}` : `REQUIRED ${formatKm(result.synchronousAltitude)} // OUTSIDE SOI`, targetColor, "center", 10);
  if (result.planeType) drawLabel(arrival.x - 16, arrival.y - 8, selectedNode.toUpperCase(), targetColor, "right", 10);

  drawBurnOne(result, departure, departureTangent, width);
  drawBurnTwo(result, arrival, arrivalTangent, width);
}

function updateControlsForBody() {
  const body = bodies[els.body.value];
  els.parking.min = body.min;
  els.parking.max = body.max;
  els.parking.step = body.step;
  els.parking.value = Math.min(Math.max(Number(els.parking.value), body.min), body.max);
}

function updateNodeAvailability() {
  const hasPlaneChange = activeMode === "synchronous" && Math.abs(Number(els.inclination.value)) > 0.001;
  els.nodeGroup.classList.toggle("is-locked", !hasPlaneChange);
  els.nodeButtons.forEach((button) => {
    button.disabled = !hasPlaneChange;
  });
}

function render() {
  const result = calculate();
  const theoreticalMark = result.valid ? "" : "*";
  els.parkingOut.textContent = formatKm(result.parkingAltitude);
  els.inclinationOut.textContent = formatAngle(result.targetAngle);
  els.title.textContent = `${result.body.name} ${activeMode === "stationary" ? "Stationary" : "Synchronous"} Transfer`;
  els.radius.textContent = `Radius ${result.body.radius.toLocaleString()} km`;
  els.periodFooter.textContent = `Sidereal day ${formatDuration(result.body.rotation)}`;
  els.statusMetric.classList.toggle("is-invalid", !result.valid);
  els.status.textContent = result.valid ? (activeMode === "stationary" ? "STATIONARY CAPABLE" : "SYNCHRONOUS CAPABLE") : "OUTSIDE SOI";
  els.syncAltitude.textContent = formatKm(result.synchronousAltitude);
  els.total.textContent = `${formatVelocity(result.total)}${theoreticalMark}`;
  els.dvOne.textContent = `${formatVelocity(result.dv1)}${theoreticalMark}`;
  els.dvTwo.textContent = `${formatVelocity(result.dv2)}${theoreticalMark}`;
  els.period.textContent = formatDuration(result.body.rotation);
  els.targetSpeed.textContent = formatVelocity(result.v2);
  els.targetInclination.textContent = formatAngle(result.targetAngle);
  els.soiMargin.textContent = result.valid ? `${formatKm(result.soiMargin)} inside` : `${formatKm(Math.abs(result.soiMargin))} outside`;
  els.arrivalNode.textContent = result.planeType ? selectedNode.toUpperCase() : "—";

  if (!result.valid) {
    els.note.textContent = `The synchronous radius is outside ${result.body.name}'s SOI. Burn values marked * are theoretical; the target orbit is not stable in stock KSP.`;
  } else if (activeMode === "stationary") {
    els.note.textContent = `${result.injectionType === "prograde" ? "Raise" : "Lower"} the far side to the synchronous rail, then circularize ${result.tangentialType}. Keep inclination at zero.`;
  } else if (result.planeType) {
    const components = [result.tangentialType, result.planeType].filter(Boolean).join(" + ");
    els.note.textContent = `${result.injectionType} into the transfer, then combine ${components} at ${selectedNode.toUpperCase()}. Same period; not the same longitude.`;
  } else {
    els.note.textContent = `${result.injectionType} into the transfer, then circularize ${result.tangentialType}. At 0° this synchronous target also satisfies the stationary geometry.`;
  }

  drawDiagram(result);
}

els.body.addEventListener("change", () => {
  updateControlsForBody();
  render();
});

els.parking.addEventListener("input", render);

els.inclination.addEventListener("input", () => {
  if (Number(els.inclination.value) !== 0) lastSynchronousInclination = Number(els.inclination.value);
  updateNodeAvailability();
  render();
});

els.modeButtons.forEach((button) => {
  button.addEventListener("click", () => {
    activeMode = button.dataset.mode;
    els.modeButtons.forEach((candidate) => candidate.classList.toggle("active", candidate === button));
    const locked = activeMode === "stationary";
    if (locked && Number(els.inclination.value) !== 0) lastSynchronousInclination = Number(els.inclination.value);
    els.inclination.disabled = locked;
    els.inclination.value = locked ? 0 : lastSynchronousInclination;
    els.inclinationGroup.classList.toggle("is-locked", locked);
    updateNodeAvailability();
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

window.addEventListener("resize", render);

updateControlsForBody();
updateNodeAvailability();
render();
