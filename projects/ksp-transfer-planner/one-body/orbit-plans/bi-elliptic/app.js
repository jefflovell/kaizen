const bodies = {
  kerbin: { name: "Kerbin", radius: 600, mu: 3531.6, soi: 84159.286, atmosphere: 70, step: 5, defaultLow: 100 },
  mun: { name: "Mun", radius: 200, mu: 65.138, soi: 2429.559, atmosphere: 0, step: 2, defaultLow: 30 },
  minmus: { name: "Minmus", radius: 60, mu: 1.7658, soi: 2247.428, atmosphere: 0, step: 1, defaultLow: 20 },
  duna: { name: "Duna", radius: 320, mu: 301.363, soi: 47921.949, atmosphere: 50, step: 5, defaultLow: 80 },
  eve: { name: "Eve", radius: 700, mu: 8171.73, soi: 85109.365, atmosphere: 90, step: 10, defaultLow: 120 },
  moho: { name: "Moho", radius: 250, mu: 168.609, soi: 9646.663, atmosphere: 0, step: 5, defaultLow: 40 },
  ike: { name: "Ike", radius: 130, mu: 18.568, soi: 1049.599, atmosphere: 0, step: 2, defaultLow: 20 },
  jool: { name: "Jool", radius: 6000, mu: 282528, soi: 2455985.185, atmosphere: 200, step: 20, defaultLow: 300 },
};

const colors = {
  start: "#5bd7eb",
  first: "#f5b447",
  second: "#ff18b0",
  target: "#8ce66f",
  maneuver: "#4cff4c",
  craft: "#ff704d",
  craftOutline: "#ffd7cc",
  text: "#edf7f8",
  muted: "#9bb0b8",
  unsafe: "#ff6f4c",
};

const els = {
  body: document.querySelector("#body-select"),
  start: document.querySelector("#start-altitude"),
  target: document.querySelector("#target-altitude"),
  intermediate: document.querySelector("#intermediate-altitude"),
  startOut: document.querySelector("#start-output"),
  targetOut: document.querySelector("#target-output"),
  intermediateOut: document.querySelector("#intermediate-output"),
  startMin: document.querySelector("#start-min"),
  startMax: document.querySelector("#start-max"),
  targetMin: document.querySelector("#target-min"),
  targetMax: document.querySelector("#target-max"),
  intermediateMin: document.querySelector("#intermediate-min"),
  intermediateMax: document.querySelector("#intermediate-max"),
  directionButtons: document.querySelectorAll("[data-direction]"),
  note: document.querySelector("#transfer-note"),
  title: document.querySelector("#diagram-title"),
  bodySoi: document.querySelector("#body-soi"),
  statusMetric: document.querySelector("#status-metric"),
  verdict: document.querySelector("#fuel-verdict"),
  biTotal: document.querySelector("#bi-total"),
  hohmannTotal: document.querySelector("#hohmann-total"),
  differenceLabel: document.querySelector("#difference-label"),
  fuelDifference: document.querySelector("#fuel-difference"),
  coastTime: document.querySelector("#coast-time"),
  dvOne: document.querySelector("#dv-one"),
  dvTwo: document.querySelector("#dv-two"),
  dvThree: document.querySelector("#dv-three"),
  radiusRatio: document.querySelector("#radius-ratio"),
  timePenalty: document.querySelector("#time-penalty"),
  soiMargin: document.querySelector("#soi-margin"),
  canvas: document.querySelector("#orbit-canvas"),
};

const ctx = els.canvas.getContext("2d");
const maneuverMarkers = {
  prograde: loadMarker("/assets/prograde-marker.png"),
  retrograde: loadMarker("/assets/retrograde-marker.png"),
};
const tailWidths = [0.5, 0.65, 0.8, 0.95, 1.1, 1.3, 1.55, 1.8, 2.1, 2.4, 2.75, 3.1, 3.45, 3.8, 4.15, 4.5];
let selectedDirection = "raise";

function loadMarker(source) {
  const image = new Image();
  image.addEventListener("load", render, { once: true });
  image.src = source;
  return image;
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function snap(value, step) {
  return Math.round(value / step) * step;
}

function formatKm(value) {
  return `${Math.round(value).toLocaleString()} km`;
}

function formatVelocity(value) {
  return `${Math.round(value * 1000).toLocaleString()} m/s`;
}

function formatDuration(seconds, compact = false) {
  const total = Math.max(0, Math.round(seconds));
  const days = Math.floor(total / 86400);
  const hours = Math.floor((total % 86400) / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const secs = total % 60;
  if (compact) {
    if (days) return `${days}d ${hours}h ${minutes}m`;
    return `${hours}h ${minutes}m`;
  }
  const clock = `${hours}h ${String(minutes).padStart(2, "0")}m ${String(secs).padStart(2, "0")}s`;
  return days ? `${days}d ${clock}` : clock;
}

function circularVelocity(mu, radius) {
  return Math.sqrt(mu / radius);
}

function conicVelocity(mu, radius, semiMajor) {
  return Math.sqrt(mu * (2 / radius - 1 / semiMajor));
}

function bodyRanges(body) {
  const safeMin = Math.max(body.step, snap(body.atmosphere + body.step, body.step));
  const circularMax = Math.max(safeMin + body.step * 4, snap(body.soi * 0.35 - body.radius, body.step));
  const intermediateMax = Math.max(circularMax + body.step, snap(body.soi * 0.92 - body.radius, body.step));
  return { safeMin, circularMax, intermediateMax };
}

function defaultAltitudes(body) {
  const ranges = bodyRanges(body);
  const low = clamp(snap(body.defaultLow, body.step), ranges.safeMin, ranges.circularMax - body.step);
  const lowRadius = body.radius + low;
  const desiredHigh = snap(lowRadius * 15 - body.radius, body.step);
  const high = clamp(desiredHigh, low + body.step, ranges.circularMax);
  const desiredIntermediate = snap(body.soi * 0.75 - body.radius, body.step);
  const intermediate = clamp(desiredIntermediate, high + body.step, ranges.intermediateMax);
  return { low, high, intermediate, ranges };
}

function calculate() {
  const body = bodies[els.body.value];
  const startAltitude = Number(els.start.value);
  const targetAltitude = Number(els.target.value);
  const intermediateAltitude = Number(els.intermediate.value);
  const r1 = body.radius + startAltitude;
  const r2 = body.radius + targetAltitude;
  const rb = body.radius + intermediateAltitude;
  const a1 = (r1 + rb) / 2;
  const a2 = (r2 + rb) / 2;
  const aH = (r1 + r2) / 2;
  const v1 = circularVelocity(body.mu, r1);
  const v2 = circularVelocity(body.mu, r2);
  const transfer1AtStart = conicVelocity(body.mu, r1, a1);
  const transfer1AtApoapsis = conicVelocity(body.mu, rb, a1);
  const transfer2AtApoapsis = conicVelocity(body.mu, rb, a2);
  const transfer2AtTarget = conicVelocity(body.mu, r2, a2);
  const dv1Signed = transfer1AtStart - v1;
  const dv2Signed = transfer2AtApoapsis - transfer1AtApoapsis;
  const dv3Signed = v2 - transfer2AtTarget;
  const dv1 = Math.abs(dv1Signed);
  const dv2 = Math.abs(dv2Signed);
  const dv3 = Math.abs(dv3Signed);
  const biTotal = dv1 + dv2 + dv3;
  const hohmannAtStart = conicVelocity(body.mu, r1, aH);
  const hohmannAtTarget = conicVelocity(body.mu, r2, aH);
  const hohmannDv1 = Math.abs(hohmannAtStart - v1);
  const hohmannDv2 = Math.abs(v2 - hohmannAtTarget);
  const hohmannTotal = hohmannDv1 + hohmannDv2;
  const firstCoast = Math.PI * Math.sqrt(a1 ** 3 / body.mu);
  const secondCoast = Math.PI * Math.sqrt(a2 ** 3 / body.mu);
  const biTime = firstCoast + secondCoast;
  const hohmannTime = Math.PI * Math.sqrt(aH ** 3 / body.mu);
  const difference = hohmannTotal - biTotal;
  const outward = r2 > r1;
  const radiusRatio = Math.max(r1, r2) / Math.min(r1, r2);
  const soiMargin = body.soi - rb;
  const valid = startAltitude > body.atmosphere && targetAltitude > body.atmosphere && rb > Math.max(r1, r2) && soiMargin > 0;

  return {
    body,
    startAltitude,
    targetAltitude,
    intermediateAltitude,
    r1,
    r2,
    rb,
    a1,
    a2,
    dv1,
    dv2,
    dv3,
    dv2Signed,
    dv3Signed,
    biTotal,
    hohmannTotal,
    biTime,
    hohmannTime,
    difference,
    outward,
    radiusRatio,
    soiMargin,
    valid,
  };
}

function syncIntermediateRange() {
  const body = bodies[els.body.value];
  const ranges = bodyRanges(body);
  const minimum = snap(Math.max(Number(els.start.value), Number(els.target.value)) + body.step, body.step);
  els.intermediate.min = minimum;
  els.intermediate.max = ranges.intermediateMax;
  els.intermediate.step = body.step;
  els.intermediate.value = clamp(Number(els.intermediate.value), minimum, ranges.intermediateMax);
  els.intermediateMin.textContent = formatKm(minimum);
  els.intermediateMax.textContent = formatKm(ranges.intermediateMax);
}

function updateBodyControls(reset = false) {
  const body = bodies[els.body.value];
  const defaults = defaultAltitudes(body);
  for (const input of [els.start, els.target]) {
    input.min = defaults.ranges.safeMin;
    input.max = defaults.ranges.circularMax;
    input.step = body.step;
  }
  els.startMin.textContent = formatKm(defaults.ranges.safeMin);
  els.targetMin.textContent = formatKm(defaults.ranges.safeMin);
  els.startMax.textContent = formatKm(defaults.ranges.circularMax);
  els.targetMax.textContent = formatKm(defaults.ranges.circularMax);
  if (reset) {
    const start = selectedDirection === "raise" ? defaults.low : defaults.high;
    const target = selectedDirection === "raise" ? defaults.high : defaults.low;
    els.start.value = start;
    els.target.value = target;
    els.intermediate.value = defaults.intermediate;
  }
  syncIntermediateRange();
}

function enforceDifferentEndpoints(changed) {
  const body = bodies[els.body.value];
  const ranges = bodyRanges(body);
  let start = Number(els.start.value);
  let target = Number(els.target.value);
  if (start === target) {
    if (changed === "start") {
      target = start < ranges.circularMax ? start + body.step : start - body.step;
    } else {
      start = target > ranges.safeMin ? target - body.step : target + body.step;
    }
  }
  els.start.value = start;
  els.target.value = target;
  selectedDirection = start < target ? "raise" : "lower";
  els.directionButtons.forEach((button) => button.classList.toggle("active", button.dataset.direction === selectedDirection));
  syncIntermediateRange();
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
  drawLabel(center.x, center.y + 4, name.toUpperCase(), colors.text, "center", Math.max(9, radius * 0.22), 0.82);
  ctx.restore();
}

function ellipseGeometry(focus, periapsis, apoapsis) {
  const rx = (periapsis + apoapsis) / 2;
  return {
    centerX: focus.x + (periapsis - apoapsis) / 2,
    centerY: focus.y,
    rx,
    ry: Math.sqrt(periapsis * apoapsis),
    pointAt(parameter) {
      return {
        x: this.centerX + this.rx * Math.cos(parameter),
        y: this.centerY + this.ry * Math.sin(parameter),
      };
    },
  };
}

function circlePoint(focus, radius, parameter) {
  return { x: focus.x + radius * Math.cos(parameter), y: focus.y + radius * Math.sin(parameter) };
}

function strokePath(pointAt, start, end, color, width, alpha, dash = [4, 6], segments = 160) {
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

function drawArrow(x, y, direction, color, length = 39) {
  const start = { x: x + direction.x * 11, y: y + direction.y * 11 };
  const end = { x: x + direction.x * (length - 8), y: y + direction.y * (length - 8) };
  const tip = { x: x + direction.x * length, y: y + direction.y * length };
  const normal = { x: -direction.y, y: direction.x };
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
  ctx.lineTo(end.x + normal.x * 5, end.y + normal.y * 5);
  ctx.lineTo(end.x - normal.x * 5, end.y - normal.y * 5);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawBurn(point, craftDirection, burnDirection, type, title, deltaV, iconOffset, labelOffset) {
  drawArrow(point.x, point.y, burnDirection, colors.maneuver);
  drawCraft(point.x, point.y, Math.atan2(craftDirection.y, craftDirection.x));
  const iconX = point.x + iconOffset.x;
  const iconY = point.y + iconOffset.y;
  const marker = maneuverMarkers[type];
  if (marker?.complete && marker.naturalWidth) ctx.drawImage(marker, iconX - 11, iconY - 11, 22, 22);
  drawLabel(point.x + labelOffset.x, point.y + labelOffset.y, title, colors.maneuver, labelOffset.x < 0 ? "right" : "left", 9, 0.96);
  drawLabel(point.x + labelOffset.x, point.y + labelOffset.y + 14, `Δv ${formatVelocity(deltaV)}`, colors.maneuver, labelOffset.x < 0 ? "right" : "left", 9, 0.96);
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

  const innerPhysical = Math.min(result.r1, result.r2);
  const outerPhysical = Math.max(result.r1, result.r2);
  const innerDisplay = clamp(Math.min(width, height) * 0.115, 35, 68);
  const ratioProgress = clamp(Math.log(outerPhysical / innerPhysical) / Math.log(20), 0, 1);
  const outerDisplay = innerDisplay + 22 + ratioProgress * Math.min(65, width * 0.16);
  const availableApoapsis = Math.min(width * 0.43, height * 0.43);
  const rbDisplay = Math.max(outerDisplay + 18, Math.min(availableApoapsis, outerDisplay + 112));
  const startDisplay = result.r1 === innerPhysical ? innerDisplay : outerDisplay;
  const targetDisplay = result.r2 === innerPhysical ? innerDisplay : outerDisplay;
  const focus = { x: width * 0.56, y: height * 0.52 };
  const bodyRadius = Math.max(25, Math.min(43, innerDisplay * result.body.radius / innerPhysical));
  const first = ellipseGeometry(focus, startDisplay, rbDisplay);
  const second = ellipseGeometry(focus, targetDisplay, rbDisplay);
  const firstPoint = (parameter) => first.pointAt(parameter);
  const secondPoint = (parameter) => second.pointAt(parameter);
  const startPoint = (parameter) => circlePoint(focus, startDisplay, parameter);
  const targetPoint = (parameter) => circlePoint(focus, targetDisplay, parameter);
  const pathAlpha = result.valid ? 1 : 0.62;

  ctx.save();
  ctx.strokeStyle = "rgba(91, 215, 235, 0.09)";
  ctx.lineWidth = 1;
  ctx.setLineDash([2, 7]);
  for (const radius of [innerDisplay, outerDisplay, rbDisplay]) {
    ctx.beginPath();
    ctx.arc(focus.x, focus.y, radius, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.restore();

  strokePath(startPoint, 0, Math.PI * 2, colors.start, 1.5, 0.52, [4, 6], 120);
  strokePath(targetPoint, 0, Math.PI * 2, colors.target, 1.5, 0.52, [4, 6], 120);
  strokePath(firstPoint, -Math.PI * 2, 0, colors.first, 1.2, 0.22, [4, 6]);
  strokePath(secondPoint, -Math.PI * 2, 0, colors.second, 1.2, 0.22, [4, 6]);
  strokePath(firstPoint, 0, -Math.PI, result.valid ? colors.first : colors.unsafe, 2.2, 0.94 * pathAlpha, [4, 6]);
  strokePath(secondPoint, -Math.PI, -Math.PI * 2, result.valid ? colors.second : colors.unsafe, 2.2, 0.94 * pathAlpha, [4, 6]);

  drawBody(focus, bodyRadius, result.body.name);
  drawTail(startPoint, 0.82, 0, colors.start);
  drawTail(firstPoint, -Math.PI + 0.82, -Math.PI, result.valid ? colors.first : colors.unsafe);
  drawTail(secondPoint, -Math.PI * 2 + 0.82, -Math.PI * 2, result.valid ? colors.second : colors.unsafe);

  const burn1 = firstPoint(0);
  const burn2 = firstPoint(-Math.PI);
  const burn3 = secondPoint(-Math.PI * 2);
  const upward = { x: 0, y: -1 };
  const downward = { x: 0, y: 1 };
  drawBurn(burn1, upward, upward, "prograde", "BURN 1 // PROGRADE", result.dv1, { x: -27, y: 1 }, { x: -42, y: 30 });
  drawBurn(
    burn2,
    downward,
    result.outward ? downward : upward,
    result.outward ? "prograde" : "retrograde",
    `BURN 2 // ${result.outward ? "PROGRADE" : "RETROGRADE"}`,
    result.dv2,
    { x: 27, y: 1 },
    { x: 42, y: 30 },
  );
  drawBurn(burn3, upward, downward, "retrograde", "BURN 3 // RETROGRADE", result.dv3, { x: 28, y: 1 }, { x: 43, y: -45 });

  drawLabel(focus.x, focus.y - startDisplay - 10, `START ${formatKm(result.startAltitude)}`, colors.start, "center", 9, 0.9);
  drawLabel(focus.x, focus.y + targetDisplay + 18, `TARGET ${formatKm(result.targetAltitude)}`, colors.target, "center", 9, 0.9);
  const apoapsisLabelX = burn2.x < 110 ? burn2.x + 8 : burn2.x;
  drawLabel(apoapsisLabelX, focus.y - 22, `SHARED AP ${formatKm(result.intermediateAltitude)}`, result.valid ? colors.second : colors.unsafe, burn2.x < 110 ? "left" : "center", 10, 0.96);
  drawLabel(width / 2, height - 18, `RADIUS RATIO ${result.radiusRatio.toFixed(2)}× // DISPLAY COMPRESSED`, colors.muted, "center", 9, 0.8);
  if (!result.valid) drawLabel(width / 2, 28, "THEORETICAL PATH OUTSIDE ONE-BODY LIMITS", colors.unsafe, "center", 11, 0.98);
}

function render() {
  const result = calculate();
  const saving = Math.abs(result.difference);
  const biWins = result.difference > 0.0005;
  const practicalTie = Math.abs(result.difference) <= 0.0005;
  const direction = result.outward ? "Raise" : "Lower";
  const warning = !result.valid;

  els.startOut.value = formatKm(result.startAltitude);
  els.targetOut.value = formatKm(result.targetAltitude);
  els.intermediateOut.value = formatKm(result.intermediateAltitude);
  els.title.textContent = `${result.body.name} Bi-Elliptic ${direction}`;
  els.bodySoi.textContent = `SOI ${formatKm(result.body.soi)}`;
  els.statusMetric.classList.toggle("is-hohmann", !biWins && !practicalTie && result.valid);
  els.statusMetric.classList.toggle("is-invalid", warning);
  if (warning) els.verdict.textContent = "OUTSIDE ONE-BODY LIMITS";
  else if (practicalTie) els.verdict.textContent = "PRACTICAL TIE";
  else els.verdict.textContent = `${biWins ? "BI-ELLIPTIC" : "HOHMANN"} SAVES ${formatVelocity(saving)}`;
  els.biTotal.textContent = formatVelocity(result.biTotal);
  els.hohmannTotal.textContent = formatVelocity(result.hohmannTotal);
  els.differenceLabel.textContent = biWins ? "Fuel saved" : "Fuel penalty";
  els.fuelDifference.textContent = formatVelocity(saving);
  els.coastTime.textContent = formatDuration(result.biTime);
  els.dvOne.textContent = `${formatVelocity(result.dv1)} // PRO`;
  els.dvTwo.textContent = `${formatVelocity(result.dv2)} // ${result.outward ? "PRO" : "RETRO"}`;
  els.dvThree.textContent = `${formatVelocity(result.dv3)} // RETRO`;
  els.radiusRatio.textContent = `${result.radiusRatio.toFixed(2)}×`;
  els.timePenalty.textContent = `+${formatDuration(result.biTime - result.hohmannTime, true)}`;
  els.soiMargin.textContent = formatKm(result.soiMargin);
  els.soiMargin.classList.toggle("is-invalid", result.soiMargin <= 0);

  if (!result.valid) {
    els.note.textContent = `The shared apoapsis leaves ${result.body.name}'s sphere of influence or an endpoint intersects the atmosphere. The numbers are theoretical; the one-body mission has already wandered into another chapter.`;
  } else if (biWins) {
    els.note.textContent = `Bi-elliptic saves ${formatVelocity(saving)} versus Hohmann, but adds ${formatDuration(result.biTime - result.hohmannTime, true)} of coast time. Mission Control has found fuel in the couch cushions and lost the calendar.`;
  } else if (practicalTie) {
    els.note.textContent = `The two plans are effectively tied on fuel. Hohmann uses one fewer burn and arrives sooner, which is usually the part where the committee stops listening.`;
  } else {
    els.note.textContent = `Hohmann saves ${formatVelocity(saving)} and arrives ${formatDuration(result.biTime - result.hohmannTime, true)} sooner. Raise the endpoint ratio or the shared apoapsis before submitting the absurd detour paperwork.`;
  }

  drawDiagram(result);
}

function setDirection(direction) {
  selectedDirection = direction;
  const defaults = defaultAltitudes(bodies[els.body.value]);
  els.start.value = direction === "raise" ? defaults.low : defaults.high;
  els.target.value = direction === "raise" ? defaults.high : defaults.low;
  els.intermediate.value = defaults.intermediate;
  els.directionButtons.forEach((button) => button.classList.toggle("active", button.dataset.direction === direction));
  syncIntermediateRange();
  render();
}

els.body.addEventListener("change", () => {
  updateBodyControls(true);
  render();
});
els.start.addEventListener("input", () => {
  enforceDifferentEndpoints("start");
  render();
});
els.target.addEventListener("input", () => {
  enforceDifferentEndpoints("target");
  render();
});
els.intermediate.addEventListener("input", render);
els.directionButtons.forEach((button) => button.addEventListener("click", () => setDirection(button.dataset.direction)));
window.addEventListener("resize", render);

updateBodyControls(true);
render();
