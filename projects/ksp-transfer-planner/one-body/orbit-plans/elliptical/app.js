const bodies = {
  kerbin: { name: "Kerbin", radius: 600, mu: 3531.6, soi: 84159.286, atmosphere: 70, periMin: -150, periMax: 5000, apoMax: 15000, step: 5, defaultPe: 100, defaultAp: 800 },
  mun: { name: "Mun", radius: 200, mu: 65.138, soi: 2429.559, atmosphere: 0, periMin: -50, periMax: 1200, apoMax: 2800, step: 5, defaultPe: 30, defaultAp: 500 },
  minmus: { name: "Minmus", radius: 60, mu: 1.7658, soi: 2247.428, atmosphere: 0, periMin: -15, periMax: 800, apoMax: 2500, step: 2, defaultPe: 20, defaultAp: 300 },
  duna: { name: "Duna", radius: 320, mu: 301.363, soi: 47921.949, atmosphere: 50, periMin: -80, periMax: 4000, apoMax: 12000, step: 5, defaultPe: 80, defaultAp: 1000 },
  eve: { name: "Eve", radius: 700, mu: 8171.73, soi: 85109.365, atmosphere: 90, periMin: -175, periMax: 5000, apoMax: 15000, step: 10, defaultPe: 120, defaultAp: 1200 },
  moho: { name: "Moho", radius: 250, mu: 168.609, soi: 9646.663, atmosphere: 0, periMin: -60, periMax: 3000, apoMax: 10500, step: 5, defaultPe: 40, defaultAp: 700 },
  ike: { name: "Ike", radius: 130, mu: 18.568, soi: 1049.599, atmosphere: 0, periMin: -30, periMax: 600, apoMax: 1400, step: 2, defaultPe: 20, defaultAp: 300 },
  jool: { name: "Jool", radius: 6000, mu: 282528, soi: 2455985.185, atmosphere: 200, periMin: -1500, periMax: 15000, apoMax: 40000, step: 20, defaultPe: 300, defaultAp: 5000 },
};

const colors = {
  entry: "#5bd7eb",
  ellipse: "#f5b447",
  optional: "#8ce66f",
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
  apoapsis: document.querySelector("#apoapsis-altitude"),
  periapsisOut: document.querySelector("#periapsis-output"),
  apoapsisOut: document.querySelector("#apoapsis-output"),
  periapsisMin: document.querySelector("#periapsis-min"),
  periapsisMax: document.querySelector("#periapsis-max"),
  apoapsisMin: document.querySelector("#apoapsis-min"),
  apoapsisMax: document.querySelector("#apoapsis-max"),
  toggles: document.querySelectorAll("[data-entry]"),
  note: document.querySelector("#burn-note"),
  title: document.querySelector("#diagram-title"),
  bodyRadius: document.querySelector("#body-radius"),
  bodySoi: document.querySelector("#body-soi"),
  statusMetric: document.querySelector("#status-metric"),
  status: document.querySelector("#orbit-status"),
  entryBurnLabel: document.querySelector("#entry-burn-label"),
  exitBurnLabel: document.querySelector("#exit-burn-label"),
  entryDv: document.querySelector("#entry-dv"),
  exitDv: document.querySelector("#exit-dv"),
  totalDv: document.querySelector("#total-dv"),
  coastTime: document.querySelector("#coast-time"),
  periapsisSpeed: document.querySelector("#periapsis-speed"),
  apoapsisSpeed: document.querySelector("#apoapsis-speed"),
  period: document.querySelector("#orbital-period"),
  semiMajor: document.querySelector("#semi-major"),
  eccentricity: document.querySelector("#eccentricity"),
  canvas: document.querySelector("#orbit-canvas"),
};

const ctx = els.canvas.getContext("2d");
const maneuverMarkers = {
  prograde: loadMarker("/assets/prograde-marker.png"),
  retrograde: loadMarker("/assets/retrograde-marker.png"),
};
const tailWidths = [0.5, 0.65, 0.8, 0.95, 1.1, 1.3, 1.55, 1.8, 2.1, 2.4, 2.75, 3.1, 3.45, 3.8, 4.15, 4.5];
let activeEntry = "periapsis";

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

function calculate() {
  const body = bodies[els.body.value];
  const periapsisAltitude = Number(els.periapsis.value);
  const apoapsisAltitude = Number(els.apoapsis.value);
  const rp = body.radius + periapsisAltitude;
  const ra = body.radius + apoapsisAltitude;
  const semiMajor = (rp + ra) / 2;
  const eccentricity = (ra - rp) / (ra + rp);
  const semiMinor = Math.sqrt(rp * ra);
  const periapsisSpeed = Math.sqrt(body.mu * (2 / rp - 1 / semiMajor));
  const apoapsisSpeed = Math.sqrt(body.mu * (2 / ra - 1 / semiMajor));
  const circularPeriapsis = Math.sqrt(body.mu / rp);
  const circularApoapsis = Math.sqrt(body.mu / ra);
  const periapsisBurn = Math.abs(periapsisSpeed - circularPeriapsis);
  const apoapsisBurn = Math.abs(circularApoapsis - apoapsisSpeed);
  const period = 2 * Math.PI * Math.sqrt(semiMajor ** 3 / body.mu);
  const entryAtPeriapsis = activeEntry === "periapsis";
  const entryDv = entryAtPeriapsis ? periapsisBurn : apoapsisBurn;
  const exitDv = entryAtPeriapsis ? apoapsisBurn : periapsisBurn;
  let status = "BOUND ELLIPSE";
  let valid = true;
  if (periapsisAltitude <= 0) {
    status = "IMPACT TRAJECTORY";
    valid = false;
  } else if (periapsisAltitude <= body.atmosphere) {
    status = "ATMOSPHERIC PASS";
    valid = false;
  } else if (ra >= body.soi) {
    status = "APOAPSIS OUTSIDE SOI";
    valid = false;
  }

  return {
    body,
    periapsisAltitude,
    apoapsisAltitude,
    rp,
    ra,
    semiMajor,
    semiMinor,
    eccentricity,
    periapsisSpeed,
    apoapsisSpeed,
    circularPeriapsis,
    circularApoapsis,
    periapsisBurn,
    apoapsisBurn,
    period,
    entryAtPeriapsis,
    entryDv,
    exitDv,
    totalDv: entryDv + exitDv,
    status,
    valid,
  };
}

function updateBodyRanges() {
  const body = bodies[els.body.value];
  els.periapsis.min = body.periMin;
  els.periapsis.max = body.periMax;
  els.periapsis.step = body.step;
  els.apoapsis.min = body.periMin + body.step;
  els.apoapsis.max = body.apoMax;
  els.apoapsis.step = body.step;
  els.periapsis.value = body.defaultPe;
  els.apoapsis.value = body.defaultAp;
  syncApsisRanges();
}

function syncApsisRanges(changed) {
  const body = bodies[els.body.value];
  let periapsis = Number(els.periapsis.value);
  let apoapsis = Number(els.apoapsis.value);
  if (periapsis >= apoapsis) {
    if (changed === "periapsis") {
      apoapsis = Math.min(body.apoMax, periapsis + body.step);
      if (apoapsis <= periapsis) periapsis = apoapsis - body.step;
    } else {
      periapsis = Math.max(body.periMin, apoapsis - body.step);
    }
  }
  els.periapsis.value = periapsis;
  els.apoapsis.value = apoapsis;
  els.periapsis.max = Math.min(body.periMax, apoapsis - body.step);
  els.apoapsis.min = periapsis + body.step;
  els.periapsisMin.textContent = formatKm(body.periMin);
  els.periapsisMax.textContent = formatKm(Number(els.periapsis.max));
  els.apoapsisMin.textContent = formatKm(Number(els.apoapsis.min));
  els.apoapsisMax.textContent = formatKm(body.apoMax);
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

function ellipsePoint(centerX, centerY, rx, ry, parameter) {
  return {
    x: centerX + rx * Math.cos(parameter),
    y: centerY + ry * Math.sin(parameter),
  };
}

function traceEllipse(centerX, centerY, rx, ry, start, end, segments = 120) {
  ctx.beginPath();
  for (let index = 0; index <= segments; index += 1) {
    const parameter = start + (end - start) * index / segments;
    const point = ellipsePoint(centerX, centerY, rx, ry, parameter);
    if (index === 0) ctx.moveTo(point.x, point.y);
    else ctx.lineTo(point.x, point.y);
  }
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
  drawLabel(center.x, center.y + 4, name.toUpperCase(), colors.text, "center", Math.max(10, radius * 0.15), 0.82);
  ctx.restore();
}

function drawDraftingRings(focus, radius) {
  ctx.save();
  ctx.strokeStyle = "rgba(91, 215, 235, 0.09)";
  ctx.lineWidth = 1;
  ctx.setLineDash([2, 7]);
  for (const scale of [0.45, 0.72, 1]) {
    ctx.beginPath();
    ctx.arc(focus.x, focus.y, radius * scale, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.restore();
}

function drawEllipsePath(geometry, result) {
  const pathColor = result.valid ? colors.ellipse : colors.unsafe;
  ctx.save();
  ctx.strokeStyle = pathColor;
  ctx.lineCap = "round";
  ctx.setLineDash([4, 6]);
  ctx.lineWidth = 1.5;
  ctx.globalAlpha = 0.28;
  traceEllipse(geometry.ellipseX, geometry.centerY, geometry.rx, geometry.ry, 0, Math.PI * 2, 220);
  ctx.stroke();
  ctx.lineWidth = 2.2;
  ctx.globalAlpha = 0.86;
  const start = result.entryAtPeriapsis ? 0 : Math.PI;
  const end = result.entryAtPeriapsis ? -Math.PI : 0;
  traceEllipse(geometry.ellipseX, geometry.centerY, geometry.rx, geometry.ry, start, end, 120);
  ctx.stroke();
  ctx.restore();
}

function drawLocalCircleArc(focus, radius, nodeAngle, color) {
  const span = Math.PI * 0.34;
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.5;
  ctx.globalAlpha = 0.62;
  ctx.setLineDash([4, 6]);
  ctx.beginPath();
  ctx.arc(focus.x, focus.y, radius, nodeAngle - span, nodeAngle + span);
  ctx.stroke();
  ctx.restore();
}

function drawApsisAxis(geometry, result) {
  ctx.save();
  ctx.strokeStyle = "rgba(237, 247, 248, 0.16)";
  ctx.lineWidth = 1;
  ctx.setLineDash([3, 7]);
  ctx.beginPath();
  ctx.moveTo(geometry.apoapsis.x, geometry.centerY);
  ctx.lineTo(geometry.periapsis.x, geometry.centerY);
  ctx.stroke();
  ctx.restore();
  drawLabel(geometry.apoapsis.x + 10, geometry.centerY - 48, `AP ${formatKm(result.apoapsisAltitude)}`, result.valid ? colors.ellipse : colors.unsafe, "left", 10, 0.94);
  drawLabel(geometry.periapsis.x - 8, geometry.centerY + 46, `PE ${formatKm(result.periapsisAltitude)}`, result.valid ? colors.ellipse : colors.unsafe, "right", 10, 0.94);
}

function drawTail(centerX, centerY, rx, ry, startDegrees, endDegrees, color) {
  const start = startDegrees * Math.PI / 180;
  const end = endDegrees * Math.PI / 180;
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineCap = "butt";
  for (let index = 0; index < tailWidths.length; index += 1) {
    const t0 = start + (end - start) * index / tailWidths.length;
    const t1 = start + (end - start) * (index + 1) / tailWidths.length;
    ctx.globalAlpha = 0.04 + index / (tailWidths.length - 1) * 0.94;
    ctx.lineWidth = tailWidths[index];
    traceEllipse(centerX, centerY, rx, ry, t0, t1, 5);
    ctx.stroke();
  }
  ctx.restore();
}

function drawArrow(x, y, rotation, color) {
  const angle = rotation * Math.PI / 180;
  const point = (distance, offset = 0) => ({
    x: x + Math.cos(angle) * distance - Math.sin(angle) * offset,
    y: y + Math.sin(angle) * distance + Math.cos(angle) * offset,
  });
  const start = point(11);
  const end = point(38);
  const tip = point(46);
  const backA = point(33, -5);
  const backB = point(33, 5);
  ctx.save();
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = 3;
  ctx.lineCap = "butt";
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

function drawCraft(x, y, rotation) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rotation * Math.PI / 180);
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

function drawBurnAssembly(x, y, craftRotation, vectorRotation, maneuverType, title, deltaV, side) {
  drawArrow(x, y, vectorRotation, colors.maneuver);
  drawCraft(x, y, craftRotation);
  const iconX = x + side * 39;
  const marker = maneuverMarkers[maneuverType];
  if (marker?.complete && marker.naturalWidth) ctx.drawImage(marker, iconX - 13, y - 13, 26, 26);
  drawLabel(iconX, y - 24, title, colors.maneuver, "center", 9, 0.94);
  drawLabel(iconX, y + 27, `Δv ${deltaV}`, colors.maneuver, "center", 9, 0.94);
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

  const left = width * 0.09;
  const right = width * 0.91;
  const top = height * 0.2;
  const bottom = height * 0.79;
  const scale = Math.min((right - left) / (result.ra + result.rp), (bottom - top) / (2 * result.semiMinor));
  const focus = { x: left + result.ra * scale, y: (top + bottom) / 2 };
  const geometry = {
    focus,
    centerY: focus.y,
    ellipseX: focus.x + (result.rp - result.ra) * scale / 2,
    rx: result.semiMajor * scale,
    ry: result.semiMinor * scale,
    periapsis: { x: focus.x + result.rp * scale, y: focus.y },
    apoapsis: { x: focus.x - result.ra * scale, y: focus.y },
  };
  const bodyRadius = Math.max(16, result.body.radius * scale);
  const startRadius = (result.entryAtPeriapsis ? result.rp : result.ra) * scale;
  const exitRadius = (result.entryAtPeriapsis ? result.ra : result.rp) * scale;
  const entryPoint = result.entryAtPeriapsis ? geometry.periapsis : geometry.apoapsis;
  const exitPoint = result.entryAtPeriapsis ? geometry.apoapsis : geometry.periapsis;

  drawDraftingRings(focus, Math.min(result.ra * scale, Math.max(width, height) * 0.44));
  drawApsisAxis(geometry, result);
  drawLocalCircleArc(focus, startRadius, result.entryAtPeriapsis ? 0 : Math.PI, colors.entry);
  drawLocalCircleArc(focus, exitRadius, result.entryAtPeriapsis ? Math.PI : 0, colors.optional);
  drawEllipsePath(geometry, result);
  drawBody(focus, bodyRadius, result.body.name);

  if (result.entryAtPeriapsis) {
    drawTail(focus.x, focus.y, result.rp * scale, result.rp * scale, 100, 0, colors.entry);
    drawTail(geometry.ellipseX, geometry.centerY, geometry.rx, geometry.ry, -80, -180, result.valid ? colors.ellipse : colors.unsafe);
    drawBurnAssembly(entryPoint.x, entryPoint.y, -90, -90, "prograde", "ENTRY / PE", formatVelocity(result.entryDv), 1);
    drawBurnAssembly(exitPoint.x, exitPoint.y, 90, 90, "prograde", "OPTIONAL / AP", formatVelocity(result.exitDv), -1);
  } else {
    drawTail(focus.x, focus.y, result.ra * scale, result.ra * scale, 280, 180, colors.entry);
    drawTail(geometry.ellipseX, geometry.centerY, geometry.rx, geometry.ry, 100, 0, result.valid ? colors.ellipse : colors.unsafe);
    drawBurnAssembly(entryPoint.x, entryPoint.y, 90, -90, "retrograde", "ENTRY / AP", formatVelocity(result.entryDv), -1);
    drawBurnAssembly(exitPoint.x, exitPoint.y, -90, 90, "retrograde", "OPTIONAL / PE", formatVelocity(result.exitDv), 1);
  }

  drawLabel(geometry.ellipseX, geometry.centerY - geometry.ry - 18, `a ${formatKm(result.semiMajor)} // e ${result.eccentricity.toFixed(3)}`, result.valid ? colors.ellipse : colors.unsafe, "center", 10, 0.9);
  if (!result.valid) drawLabel(width / 2, height - 28, result.status, colors.unsafe, "center", 12, 0.96);
}

function setEntry(entry) {
  activeEntry = entry;
  els.toggles.forEach((toggle) => toggle.classList.toggle("active", toggle.dataset.entry === entry));
  render();
}

function render() {
  const result = calculate();
  const theoretical = result.valid ? "" : "*";
  const entryName = result.entryAtPeriapsis ? "PE" : "AP";
  const exitName = result.entryAtPeriapsis ? "AP" : "PE";
  const maneuver = result.entryAtPeriapsis ? "prograde" : "retrograde";

  els.periapsisOut.value = formatKm(result.periapsisAltitude);
  els.apoapsisOut.value = formatKm(result.apoapsisAltitude);
  els.title.textContent = `${result.body.name} ${result.eccentricity.toFixed(3)} Ellipse`;
  els.bodyRadius.textContent = `Radius ${formatKm(result.body.radius)}`;
  els.bodySoi.textContent = `SOI ${formatKm(result.body.soi)}`;
  els.statusMetric.classList.toggle("is-invalid", !result.valid);
  els.status.textContent = result.status;
  els.entryBurnLabel.textContent = `Entry burn at ${entryName}`;
  els.exitBurnLabel.textContent = `Optional circularize at ${exitName}`;
  els.entryDv.textContent = `${formatVelocity(result.entryDv)}${theoretical}`;
  els.exitDv.textContent = `${formatVelocity(result.exitDv)}${theoretical}`;
  els.totalDv.textContent = `${formatVelocity(result.totalDv)}${theoretical}`;
  els.coastTime.textContent = `${formatDuration(result.period / 2)}${theoretical}`;
  els.periapsisSpeed.textContent = `${formatVelocity(result.periapsisSpeed)}${theoretical}`;
  els.apoapsisSpeed.textContent = `${formatVelocity(result.apoapsisSpeed)}${theoretical}`;
  els.period.textContent = `${formatDuration(result.period)}${theoretical}`;
  els.semiMajor.textContent = formatKm(result.semiMajor);
  els.eccentricity.textContent = result.eccentricity.toFixed(3);

  if (!result.valid) {
    if (result.status === "IMPACT TRAJECTORY") {
      els.note.textContent = `Periapsis is ${formatKm(result.periapsisAltitude)}: the ellipse intersects ${result.body.name}. The starred conic values are theoretical until geology completes the maneuver.`;
    } else if (result.status === "ATMOSPHERIC PASS") {
      els.note.textContent = `Periapsis is inside ${result.body.name}'s atmosphere. Treat this as aerobraking or re-entry, not a stable vacuum coast, and verify the heat-shield side is facing the exciting part.`;
    } else {
      els.note.textContent = `Apoapsis reaches beyond ${result.body.name}'s sphere of influence. This is no longer a stable one-body ellipse; starred values ignore the body waiting outside the model.`;
    }
  } else {
    els.note.textContent = `Burn ${maneuver} at ${entryName} to enter the ellipse, coast ${formatDuration(result.period / 2)} to ${exitName}, then circularize ${maneuver} only if the mission no longer wants the ellipse.`;
  }

  drawDiagram(result);
}

els.body.addEventListener("change", () => {
  updateBodyRanges();
  render();
});
els.periapsis.addEventListener("input", () => {
  syncApsisRanges("periapsis");
  render();
});
els.apoapsis.addEventListener("input", () => {
  syncApsisRanges("apoapsis");
  render();
});
els.toggles.forEach((toggle) => toggle.addEventListener("click", () => setEntry(toggle.dataset.entry)));
window.addEventListener("resize", render);

updateBodyRanges();
render();
