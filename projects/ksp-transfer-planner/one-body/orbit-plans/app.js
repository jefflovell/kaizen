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
  const ellipseCenterOffset = ((result.r2 - result.r1) / 2) * scale;
  const ellipseCenterX = center.x + ellipseCenterOffset;

  ctx.clearRect(0, 0, width, height);

  drawRings(center, Math.max(startRadius, targetRadius));
  drawBody(center, bodyRadius, result.body.name);
  drawCircle(center, startRadius, "#5bd7eb", 2.5);
  drawCircle(center, targetRadius, "#83e67b", 2.5);
  drawTransferEllipse(ellipseCenterX, center.y, semiMajor, ellipseMinor, result.outward);
  drawBurnMarker(center.x + startRadius, center.y, result.outward ? "prograde" : "retrograde", "Burn 1");
  drawBurnMarker(center.x - targetRadius, center.y, result.outward ? "prograde" : "retrograde", "Burn 2");
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
    "#83e67b",
    "right"
  );
}

function drawRings(center, radius) {
  ctx.save();
  ctx.strokeStyle = "rgba(180, 208, 220, 0.08)";
  ctx.lineWidth = 1;
  for (let i = 0.45; i <= 1.15; i += 0.18) {
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
  ctx.strokeStyle = "rgba(237, 247, 248, 0.22)";
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.fillStyle = "rgba(237, 247, 248, 0.78)";
  ctx.font = "700 12px DM Sans";
  ctx.textAlign = "center";
  ctx.fillText(name, center.x, center.y + 4);
  ctx.restore();
}

function drawCircle(center, radius, color, lineWidth) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;
  ctx.shadowColor = color;
  ctx.shadowBlur = 12;
  ctx.beginPath();
  ctx.arc(center.x, center.y, radius, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}

function drawTransferEllipse(x, y, rx, ry, outward) {
  ctx.save();
  ctx.strokeStyle = "#f5b447";
  ctx.lineWidth = 3;
  ctx.setLineDash([12, 10]);
  ctx.shadowColor = "rgba(245, 180, 71, 0.9)";
  ctx.shadowBlur = 14;
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.fillStyle = "#f5b447";
  ctx.font = "700 11px DM Sans";
  ctx.textAlign = "center";
  ctx.fillText(outward ? "apoapsis coast" : "periapsis coast", x, y - ry - 12);
  ctx.restore();
}

function drawBurnMarker(x, y, direction, label) {
  const sign = direction === "prograde" ? 1 : -1;
  const labelX = clamp(x + sign * 36, 42, els.canvas.getBoundingClientRect().width - 42);
  const labelY = sign > 0 ? y - 13 : y + 23;
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = "#ff704d";
  ctx.strokeStyle = "#ff704d";
  ctx.lineWidth = 2;
  ctx.shadowColor = "rgba(255, 112, 77, 0.75)";
  ctx.shadowBlur = 10;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(sign * 28, -8);
  ctx.lineTo(sign * 28, 8);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "rgba(237, 247, 248, 0.86)";
  ctx.font = "700 11px DM Sans";
  ctx.textAlign = "center";
  ctx.setTransform(window.devicePixelRatio || 1, 0, 0, window.devicePixelRatio || 1, 0, 0);
  ctx.fillText(label, labelX, labelY);
  ctx.restore();
}

function drawAltitudeLabel(x, y, text, color, align) {
  const width = els.canvas.getBoundingClientRect().width;
  ctx.save();
  ctx.fillStyle = color;
  ctx.font = "700 12px DM Sans";
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
