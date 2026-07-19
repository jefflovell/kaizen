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
  start: document.querySelector("#start-altitude"),
  target: document.querySelector("#target-altitude"),
  startOut: document.querySelector("#start-output"),
  targetOut: document.querySelector("#target-output"),
  note: document.querySelector("#burn-note"),
  title: document.querySelector("#diagram-title"),
  radius: document.querySelector("#body-radius"),
  mu: document.querySelector("#body-mu"),
  total: document.querySelector("#total-dv"),
  dvOne: document.querySelector("#dv-one"),
  dvTwo: document.querySelector("#dv-two"),
  time: document.querySelector("#transfer-time"),
  transferAngle: document.querySelector("#transfer-angle"),
  startVelocity: document.querySelector("#start-velocity"),
  targetVelocity: document.querySelector("#target-velocity"),
  semiMajor: document.querySelector("#semi-major"),
  canvas: document.querySelector("#orbit-canvas"),
  toggles: document.querySelectorAll(".toggle-button"),
};

const ctx = els.canvas.getContext("2d");
let activePreset = "raise";
const maneuverGreen = "#4cff4c";
const maneuverMarkers = {
  prograde: loadManeuverMarker("/assets/prograde-marker.png"),
  retrograde: loadManeuverMarker("/assets/retrograde-marker.png"),
};

function loadManeuverMarker(source) {
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

function formatVelocity(kmPerSecond) {
  return `${Math.round(kmPerSecond * 1000).toLocaleString()} m/s`;
}

function formatKm(value) {
  return `${Math.round(value).toLocaleString()} km`;
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

function calculateTransfer() {
  const body = bodies[els.body.value];
  const startAlt = Number(els.start.value);
  const targetAlt = Number(els.target.value);
  const r1 = body.radius + startAlt;
  const r2 = body.radius + targetAlt;
  const a = (r1 + r2) / 2;
  const v1 = circularVelocity(body.mu, r1);
  const v2 = circularVelocity(body.mu, r2);
  const vt1 = transferVelocity(body.mu, r1, a);
  const vt2 = transferVelocity(body.mu, r2, a);
  const dv1 = Math.abs(vt1 - v1);
  const dv2 = Math.abs(v2 - vt2);
  const transferTime = Math.PI * Math.sqrt((a ** 3) / body.mu);
  const outward = r2 >= r1;

  return {
    body,
    startAlt,
    targetAlt,
    r1,
    r2,
    a,
    v1,
    v2,
    vt1,
    vt2,
    dv1,
    dv2,
    transferTime,
    transferAngle: 180,
    outward,
  };
}

function updateControlsForBody() {
  const body = bodies[els.body.value];
  [els.start, els.target].forEach((input) => {
    input.min = body.min;
    input.max = body.max;
    input.step = body.step;
  });

  els.start.value = Math.min(Math.max(Number(els.start.value), body.min), body.max);
  els.target.value = Math.min(Math.max(Number(els.target.value), body.min), body.max);

  if (Number(els.start.value) === Number(els.target.value)) {
    els.target.value = Math.min(body.max, Number(els.start.value) + body.step * 12);
  }
}

function drawOrbit(result) {
  const canvas = els.canvas;
  const rect = canvas.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;
  canvas.width = Math.max(1, Math.floor(rect.width * dpr));
  canvas.height = Math.max(1, Math.floor(rect.height * dpr));
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  const width = rect.width;
  const height = rect.height;
  const center = { x: width / 2, y: height / 2 };
  const maxRadius = Math.max(result.r1, result.r2);
  const scale = Math.min(width, height) * 0.39 / maxRadius;
  const bodyRadius = Math.max(18, result.body.radius * scale);
  const startRadius = result.r1 * scale;
  const targetRadius = result.r2 * scale;
  const semiMajor = result.a * scale;
  const ellipseMinor = Math.sqrt(result.r1 * result.r2) * scale;
  const ellipseCenterOffset = ((result.r1 - result.r2) / 2) * scale;
  const ellipseCenterX = center.x + ellipseCenterOffset;

  ctx.clearRect(0, 0, width, height);

  drawRings(center, Math.max(startRadius, targetRadius));
  drawCircle(center, startRadius, "#5bd7eb");
  drawCircle(center, targetRadius, "#8ce66f");
  drawTransferEllipse(ellipseCenterX, center.y, semiMajor, ellipseMinor);
  drawBody(center, bodyRadius, result.body.name);

  drawOrbitTail(center.x, center.y, startRadius, startRadius, 100, 0, "#5bd7eb");
  drawOrbitTail(ellipseCenterX, center.y, semiMajor, ellipseMinor, -80, -180, "#f5b447");

  drawBurnAssembly(
    center.x + startRadius,
    center.y,
    -90,
    result.outward ? -90 : 90,
    "BURN 1",
    formatVelocity(result.dv1),
    result.outward ? "prograde" : "retrograde",
    1
  );
  drawBurnAssembly(
    center.x - targetRadius,
    center.y,
    90,
    result.outward ? 90 : -90,
    "BURN 2",
    formatVelocity(result.dv2),
    result.outward ? "prograde" : "retrograde",
    -1
  );
  if (result.outward) {
    drawAltitudeLabel(
      center.x + startRadius * 0.76,
      center.y + startRadius * 0.35,
      `Start ${formatKm(result.startAlt)}`,
      "#5bd7eb",
      "left"
    );
    drawAltitudeLabel(
      center.x - targetRadius * 0.58,
      center.y - targetRadius * 0.32,
      `Target ${formatKm(result.targetAlt)}`,
      "#8ce66f",
      "right"
    );
  } else {
    drawAltitudeLabel(
      center.x - startRadius * 0.42,
      center.y + startRadius * 0.68,
      `Start ${formatKm(result.startAlt)}`,
      "#5bd7eb",
      "right"
    );
    drawAltitudeLabel(
      center.x + targetRadius * 0.54,
      center.y - targetRadius * 0.58,
      `Target ${formatKm(result.targetAlt)}`,
      "#8ce66f",
      "left"
    );
  }
}

function drawRings(center, radius) {
  ctx.save();
  ctx.strokeStyle = "rgba(91, 215, 235, 0.09)";
  ctx.lineWidth = 1;
  ctx.setLineDash([2, 7]);
  for (let i = 0.42; i <= 1.16; i += 0.185) {
    ctx.beginPath();
    ctx.arc(center.x, center.y, radius * i, 0, Math.PI * 2);
    ctx.stroke();
  }
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

function drawCircle(center, radius, color) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.8;
  ctx.globalAlpha = 0.68;
  ctx.setLineDash([4, 6]);
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.arc(center.x, center.y, radius, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}

function drawTransferEllipse(x, y, rx, ry) {
  ctx.save();
  ctx.strokeStyle = "#f5b447";
  ctx.lineWidth = 1.5;
  ctx.globalAlpha = 0.18;
  ctx.setLineDash([4, 6]);
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  ctx.stroke();

  ctx.lineWidth = 2.1;
  ctx.globalAlpha = 0.78;
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, -Math.PI, true);
  ctx.stroke();

  ctx.setLineDash([]);
  ctx.globalAlpha = 1;
  ctx.fillStyle = "#f5b447";
  ctx.font = "700 11px 'Courier Prime', monospace";
  ctx.textAlign = "center";
  ctx.fillText("COAST // 180°", x, y - ry - 13);
  ctx.restore();
}

const tailWidths = [0.5, 0.7, 0.9, 1.1, 1.3, 1.55, 1.8, 2.05, 2.35, 2.65, 2.95, 3.25, 3.55, 3.85, 4.15, 4.5];
const tailOpacities = [0.04, 0.08, 0.13, 0.19, 0.26, 0.34, 0.43, 0.52, 0.61, 0.7, 0.78, 0.84, 0.89, 0.93, 0.96, 0.98];

function drawOrbitTail(x, y, rx, ry, startDegrees, endDegrees, color) {
  const steps = tailWidths.length;
  const span = endDegrees - startDegrees;

  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineCap = "round";
  ctx.setLineDash([]);

  for (let index = 0; index < steps; index += 1) {
    const start = (startDegrees + (span * index) / steps) * (Math.PI / 180);
    const end = (startDegrees + (span * (index + 1)) / steps) * (Math.PI / 180);
    ctx.globalAlpha = tailOpacities[index];
    ctx.lineWidth = tailWidths[index];
    ctx.beginPath();
    ctx.ellipse(x, y, rx, ry, 0, start, end, span < 0);
    ctx.stroke();
  }

  ctx.restore();
}

function drawBurnAssembly(x, y, craftRotation, vectorRotation, label, deltaV, maneuverType, side) {
  drawBurnVector(x, y, vectorRotation, maneuverGreen);

  ctx.save();
  ctx.fillStyle = maneuverGreen;
  ctx.beginPath();
  ctx.arc(x, y, 3.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  drawCraft(x, y, craftRotation);

  const canvasWidth = els.canvas.getBoundingClientRect().width;
  const deltaLabel = `Δv ${deltaV}`;

  ctx.save();
  ctx.font = "700 11px 'Courier Prime', monospace";
  const labelWidth = Math.max(ctx.measureText(label).width, ctx.measureText(deltaLabel).width);
  ctx.restore();

  const iconOffset = 34;
  const iconHalf = 15;
  const margin = 10;
  const groupHalf = Math.max(iconHalf, labelWidth / 2);
  let iconSide = side;
  let iconX = x + iconSide * iconOffset;

  if (iconX - groupHalf < margin || iconX + groupHalf > canvasWidth - margin) {
    iconSide *= -1;
    iconX = x + iconSide * iconOffset;
  }

  iconX = clamp(iconX, margin + groupHalf, canvasWidth - margin - groupHalf);
  const noteAbove = label === "BURN 1";

  drawManeuverIcon(iconX, y, maneuverType);

  ctx.save();
  ctx.fillStyle = maneuverGreen;
  ctx.font = "700 11px 'Courier Prime', monospace";
  ctx.textAlign = "center";
  ctx.fillText(label, iconX, y + (noteAbove ? -25 : 26));
  ctx.fillText(deltaLabel, iconX, y + (noteAbove ? -13 : 38));
  ctx.restore();
}

function drawManeuverIcon(centerX, centerY, maneuverType) {
  const size = 30;
  const left = centerX - size / 2;
  const top = centerY - size / 2;
  const marker = maneuverMarkers[maneuverType];

  if (marker?.complete && marker.naturalWidth > 0) {
    ctx.save();
    ctx.globalAlpha = 0.96;
    ctx.drawImage(marker, left, top, size, size);
    ctx.restore();
  }
}

function drawBurnVector(x, y, rotation, color) {
  const radians = (rotation * Math.PI) / 180;
  const point = (distance, offset = 0) => ({
    x: x + Math.cos(radians) * distance - Math.sin(radians) * offset,
    y: y + Math.sin(radians) * distance + Math.cos(radians) * offset,
  });
  const stemStart = point(11);
  const stemEnd = point(38);
  const tip = point(45);
  const backA = point(33, -5);
  const backB = point(33, 5);

  ctx.save();
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = 3;
  ctx.lineCap = "butt";
  ctx.beginPath();
  ctx.moveTo(stemStart.x, stemStart.y);
  ctx.lineTo(stemEnd.x, stemEnd.y);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(tip.x, tip.y);
  ctx.lineTo(backA.x, backA.y);
  ctx.lineTo(backB.x, backB.y);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawCraft(x, y, rotation) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate((rotation * Math.PI) / 180);
  ctx.fillStyle = "#ff704d";
  ctx.strokeStyle = "#ffd7cc";
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

function drawAltitudeLabel(x, y, text, color, align) {
  const width = els.canvas.getBoundingClientRect().width;
  ctx.save();
  ctx.fillStyle = color;
  ctx.font = "700 11px 'Courier Prime', monospace";
  const textWidth = ctx.measureText(text).width;
  const padding = 12;
  const minX = align === "right" ? textWidth + padding : padding;
  const maxX = align === "left" ? width - textWidth - padding : width - padding;
  const labelX = clamp(x, minX, maxX);
  ctx.textAlign = align;
  ctx.fillText(text, labelX, y);
  ctx.restore();
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function render() {
  const result = calculateTransfer();
  const total = result.dv1 + result.dv2;
  const circularizeWord = result.outward ? "prograde" : "retrograde";
  const firstBurn = result.outward ? "prograde at periapsis" : "retrograde at apoapsis";

  els.startOut.value = formatKm(result.startAlt);
  els.targetOut.value = formatKm(result.targetAlt);
  els.title.textContent = `${result.body.name} Orbit Plot`;
  els.radius.textContent = `Radius ${formatKm(result.body.radius)}`;
  els.mu.textContent = `GM ${result.body.mu.toLocaleString()} km^3/s^2`;
  els.total.textContent = formatVelocity(total);
  els.dvOne.textContent = formatVelocity(result.dv1);
  els.dvTwo.textContent = formatVelocity(result.dv2);
  els.time.textContent = formatTime(result.transferTime);
  els.transferAngle.textContent = `${result.transferAngle} deg`;
  els.startVelocity.textContent = formatVelocity(result.v1);
  els.targetVelocity.textContent = formatVelocity(result.v2);
  els.semiMajor.textContent = formatKm(result.a);
  els.note.textContent = `Burn ${firstBurn}, coast halfway around the transfer ellipse, then circularize ${circularizeWord}.`;

  drawOrbit(result);
}

function setPreset(preset) {
  const body = bodies[els.body.value];
  activePreset = preset;
  els.toggles.forEach((button) => {
    button.classList.toggle("active", button.dataset.preset === preset);
  });

  if (preset === "raise") {
    els.start.value = Math.max(body.min, Math.round(body.max * 0.05 / body.step) * body.step);
    els.target.value = Math.round(body.max * 0.38 / body.step) * body.step;
  }

  if (preset === "lower") {
    els.start.value = Math.round(body.max * 0.38 / body.step) * body.step;
    els.target.value = Math.max(body.min, Math.round(body.max * 0.05 / body.step) * body.step);
  }

  if (preset === "swap") {
    [els.start.value, els.target.value] = [els.target.value, els.start.value];
  }

  render();
}

els.body.addEventListener("change", () => {
  updateControlsForBody();
  setPreset(activePreset === "swap" ? "raise" : activePreset);
});

[els.start, els.target].forEach((input) => {
  input.addEventListener("input", () => {
    els.toggles.forEach((button) => button.classList.remove("active"));
    render();
  });
});

els.toggles.forEach((button) => {
  button.addEventListener("click", () => setPreset(button.dataset.preset));
});

window.addEventListener("resize", render);

updateControlsForBody();
render();
