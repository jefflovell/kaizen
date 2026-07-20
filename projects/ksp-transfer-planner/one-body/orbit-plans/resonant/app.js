const bodies = {
  kerbin: { name: "Kerbin", radius: 600, mu: 3531.6, soi: 84159.286, atmosphere: 70, min: 80, max: 5000, step: 5, initial: 800 },
  mun: { name: "Mun", radius: 200, mu: 65.138, soi: 2429.559, atmosphere: 0, min: 10, max: 1600, step: 2, initial: 300 },
  minmus: { name: "Minmus", radius: 60, mu: 1.7658, soi: 2247.428, atmosphere: 0, min: 8, max: 1000, step: 1, initial: 180 },
  duna: { name: "Duna", radius: 320, mu: 301.363, soi: 47921.949, atmosphere: 50, min: 60, max: 5000, step: 5, initial: 600 },
  eve: { name: "Eve", radius: 700, mu: 8171.73, soi: 85109.365, atmosphere: 90, min: 100, max: 8000, step: 10, initial: 1000 },
  moho: { name: "Moho", radius: 250, mu: 168.609, soi: 9646.663, atmosphere: 0, min: 12, max: 5000, step: 5, initial: 500 },
  ike: { name: "Ike", radius: 130, mu: 18.568, soi: 1049.599, atmosphere: 0, min: 8, max: 700, step: 2, initial: 160 },
  jool: { name: "Jool", radius: 6000, mu: 282528, soi: 2455985.185, atmosphere: 200, min: 220, max: 30000, step: 20, initial: 8000 },
};

const colors = {
  target: "#8ce66f",
  carrier: "#f5b447",
  fleet: "#d8f36a",
  maneuver: "#4cff4c",
  craft: "#ff704d",
  craftOutline: "#ffd7cc",
  text: "#edf7f8",
  muted: "#9bb0b8",
  unsafe: "#ff6f4c",
};

const els = {
  body: document.querySelector("#body-select"),
  altitude: document.querySelector("#target-altitude"),
  altitudeOut: document.querySelector("#altitude-output"),
  count: document.querySelector("#satellite-count"),
  countOut: document.querySelector("#count-output"),
  phasingButtons: document.querySelectorAll("[data-phasing]"),
  note: document.querySelector("#burn-note"),
  title: document.querySelector("#diagram-title"),
  radius: document.querySelector("#body-radius"),
  targetPeriodFooter: document.querySelector("#target-period-footer"),
  statusMetric: document.querySelector("#status-metric"),
  status: document.querySelector("#target-status"),
  ratio: document.querySelector("#resonance-ratio"),
  apsisLabel: document.querySelector("#apsis-label"),
  phasingApsis: document.querySelector("#phasing-apsis"),
  satelliteDv: document.querySelector("#satellite-dv"),
  campaignTime: document.querySelector("#campaign-time"),
  targetPeriod: document.querySelector("#target-period"),
  releaseInterval: document.querySelector("#release-interval"),
  slotAngle: document.querySelector("#slot-angle"),
  carrierDv: document.querySelector("#carrier-dv"),
  campaignDv: document.querySelector("#campaign-dv"),
  canvas: document.querySelector("#orbit-canvas"),
};

const ctx = els.canvas.getContext("2d");
let phasingMode = "inner";

const markerImages = {
  prograde: loadMarker("/assets/prograde-marker.png"),
  retrograde: loadMarker("/assets/retrograde-marker.png"),
};

function loadMarker(source) {
  const image = new Image();
  image.addEventListener("load", render, { once: true });
  image.src = source;
  return image;
}

function period(mu, radius) {
  return 2 * Math.PI * Math.sqrt(radius ** 3 / mu);
}

function velocity(mu, radius, semiMajorAxis = radius) {
  return Math.sqrt(mu * (2 / radius - 1 / semiMajorAxis));
}

function calculate() {
  const body = bodies[els.body.value];
  const altitude = Number(els.altitude.value);
  const count = Number(els.count.value);
  const targetRadius = body.radius + altitude;
  const targetPeriod = period(body.mu, targetRadius);
  const numerator = phasingMode === "inner" ? count - 1 : count + 1;
  const resonantPeriod = targetPeriod * numerator / count;
  const semiMajorAxis = Math.cbrt(body.mu * (resonantPeriod / (2 * Math.PI)) ** 2);
  const oppositeRadius = 2 * semiMajorAxis - targetRadius;
  const oppositeAltitude = oppositeRadius - body.radius;
  const targetSpeed = velocity(body.mu, targetRadius);
  const resonantSpeed = velocity(body.mu, targetRadius, semiMajorAxis);
  const burn = Math.abs(targetSpeed - resonantSpeed);
  const slotAngle = 360 / count;
  const campaignTime = resonantPeriod * (count - 1);
  const campaignDv = burn * count;
  const surfaceClear = oppositeRadius > body.radius;
  const atmosphereClear = phasingMode === "outer" || oppositeAltitude > body.atmosphere;
  const soiClear = phasingMode === "inner" || oppositeRadius < body.soi;
  const valid = surfaceClear && atmosphereClear && soiClear;
  let failure = "";
  if (!surfaceClear) failure = "INTERSECTS BODY";
  else if (!atmosphereClear) failure = "ATMOSPHERE";
  else if (!soiClear) failure = "OUTSIDE SOI";

  return {
    body,
    altitude,
    count,
    targetRadius,
    targetPeriod,
    numerator,
    resonantPeriod,
    semiMajorAxis,
    oppositeRadius,
    oppositeAltitude,
    targetSpeed,
    resonantSpeed,
    burn,
    slotAngle,
    campaignTime,
    campaignDv,
    valid,
    failure,
    circularizeType: phasingMode === "inner" ? "prograde" : "retrograde",
    injectType: phasingMode === "inner" ? "retrograde" : "prograde",
  };
}

function formatVelocity(value) {
  return `${Math.round(value * 1000).toLocaleString()} m/s`;
}

function formatKm(value) {
  const rounded = Math.round(value);
  const sign = rounded > 0 ? "" : rounded < 0 ? "−" : "";
  return `${sign}${Math.abs(rounded).toLocaleString()} km`;
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

function orbitPoint(center, scale, rightRadius, oppositeRadius, t) {
  const semiMajor = (rightRadius + oppositeRadius) / 2;
  const offset = (rightRadius - oppositeRadius) / 2;
  const semiMinor = Math.sqrt(Math.max(0, rightRadius * oppositeRadius));
  return {
    x: center.x + (offset + semiMajor * Math.cos(t)) * scale,
    y: center.y + semiMinor * Math.sin(t) * scale * 0.36,
  };
}

function samplePath(pointAt, start, end, steps = 180) {
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

function drawReferenceRings(center, radius) {
  ctx.save();
  ctx.strokeStyle = "rgba(91, 215, 235, 0.08)";
  ctx.lineWidth = 1;
  ctx.setLineDash([2, 8]);
  for (let factor = 0.35; factor <= 1.14; factor += 0.2) {
    ctx.beginPath();
    ctx.ellipse(center.x, center.y, radius * factor, radius * factor * 0.36, 0, 0, Math.PI * 2);
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
  ctx.fillStyle = "rgba(226, 242, 245, 0.82)";
  ctx.font = "700 12px 'Courier Prime', monospace";
  ctx.textAlign = "center";
  ctx.fillText(name.toUpperCase(), center.x, center.y + 4);
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

function drawMarker(type, x, y, size = 28) {
  const marker = markerImages[type];
  if (!marker?.complete || marker.naturalWidth === 0) return;
  ctx.save();
  ctx.drawImage(marker, x - size / 2, y - size / 2, size, size);
  ctx.restore();
}

function pointOnOffsetPath(pointAt, t, offset) {
  const point = pointAt(t);
  const tangent = tangentAt(pointAt, t);
  const normal = { x: tangent.y, y: -tangent.x };
  return {
    x: point.x + normal.x * offset,
    y: point.y + normal.y * offset,
  };
}

function drawCurvedPathArrow(pointAt, start, end, offset, color, width = 3) {
  const steps = 18;
  const points = [];
  for (let index = 0; index <= steps; index += 1) {
    const t = start + (end - start) * index / steps;
    points.push(pointOnOffsetPath(pointAt, t, offset));
  }
  const tip = points.at(-1);
  const before = points.at(-2);
  const dx = tip.x - before.x;
  const dy = tip.y - before.y;
  const magnitude = Math.hypot(dx, dy) || 1;
  const unit = { x: dx / magnitude, y: dy / magnitude };
  const perpendicular = { x: -unit.y, y: unit.x };
  const back = { x: tip.x - unit.x * 11, y: tip.y - unit.y * 11 };

  ctx.save();
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = width;
  ctx.lineCap = "butt";
  ctx.lineJoin = "round";
  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);
  for (const point of points.slice(1, -2)) ctx.lineTo(point.x, point.y);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(tip.x, tip.y);
  ctx.lineTo(back.x + perpendicular.x * 5.5, back.y + perpendicular.y * 5.5);
  ctx.lineTo(back.x - perpendicular.x * 5.5, back.y - perpendicular.y * 5.5);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawCurvedCraft(pointAt, directionSign) {
  const start = -directionSign * 26 * Math.PI / 180;
  const end = 0;
  const steps = 14;
  const points = [];
  for (let index = 0; index <= steps; index += 1) {
    const t = start + (end - start) * index / steps;
    points.push(pointAt(t));
  }
  const tip = points.at(-1);
  const before = points.at(-2);
  const dx = tip.x - before.x;
  const dy = tip.y - before.y;
  const magnitude = Math.hypot(dx, dy) || 1;
  const unit = { x: dx / magnitude, y: dy / magnitude };
  const perpendicular = { x: -unit.y, y: unit.x };
  const back = { x: tip.x - unit.x * 11, y: tip.y - unit.y * 11 };

  ctx.save();
  ctx.strokeStyle = colors.craftOutline;
  ctx.lineWidth = 5;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);
  for (const point of points.slice(1, -2)) ctx.lineTo(point.x, point.y);
  ctx.stroke();
  ctx.strokeStyle = colors.craft;
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.fillStyle = colors.craft;
  ctx.beginPath();
  ctx.moveTo(tip.x, tip.y);
  ctx.lineTo(back.x + perpendicular.x * 6.5, back.y + perpendicular.y * 6.5);
  ctx.lineTo(back.x - perpendicular.x * 6.5, back.y - perpendicular.y * 6.5);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = colors.craftOutline;
  ctx.lineWidth = 1.25;
  ctx.stroke();
  ctx.restore();
}

function drawSatellite(point, tangent, index, active = false) {
  ctx.save();
  ctx.translate(point.x, point.y);
  ctx.rotate(Math.atan2(tangent.y, tangent.x));
  ctx.fillStyle = active ? colors.craft : colors.fleet;
  ctx.strokeStyle = active ? colors.craftOutline : "rgba(237, 247, 248, 0.72)";
  ctx.lineWidth = 1;
  ctx.fillRect(-5, -4, 10, 8);
  ctx.strokeRect(-5, -4, 10, 8);
  ctx.restore();
  if (index > 0) drawLabel(point.x + 9, point.y - 8, `S${index}`, colors.fleet, "left", 8, 0.8);
}

function drawPhaseArc(targetPoint, angle, count) {
  const points = samplePath(targetPoint, 0.08, angle - 0.08, 50);
  strokePoints(points, colors.fleet, 1.4, 0.62, [2, 4]);
  const middle = targetPoint(angle / 2);
  drawLabel(middle.x + 8, middle.y - 9, `${Math.round(360 / count)}° SLOT`, colors.fleet, "left", 9, 0.9);
}

function drawBurn(result, point, pointAt, width) {
  const directionSign = result.circularizeType === "prograde" ? 1 : -1;
  const start = directionSign * 2 * Math.PI / 180;
  const end = directionSign * 32 * Math.PI / 180;
  drawCurvedPathArrow(pointAt, start, end, 12, colors.maneuver);
  drawCurvedCraft(pointAt, directionSign);
  const mobile = width < 500;
  const labelWidth = mobile ? 88 : 112;
  const preferredGroupX = point.x + 44;
  const groupX = Math.min(width - labelWidth / 2 - 8, preferredGroupX);
  const groupY = point.y - 2;
  drawMarker(result.circularizeType, groupX, groupY, 28);
  drawLabel(groupX, groupY - 23, "RELEASE / BURN", colors.maneuver, "center", mobile ? 8 : 10);
  drawLabel(groupX, groupY + 26, `Δv ${formatVelocity(result.burn)}`, colors.maneuver, "center", mobile ? 8 : 10);
}

function drawFailureBoundary(result, center, scale) {
  if (result.valid) return;
  const radius = phasingMode === "inner" ? result.body.radius + result.body.atmosphere : result.body.soi;
  const drawRadius = Math.max(8, radius * scale);
  ctx.save();
  ctx.strokeStyle = colors.unsafe;
  ctx.globalAlpha = 0.74;
  ctx.lineWidth = 1.5;
  ctx.setLineDash([3, 6]);
  ctx.beginPath();
  ctx.ellipse(center.x, center.y, drawRadius, drawRadius * 0.36, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
  drawLabel(center.x - drawRadius + 8, center.y + 6, result.failure, colors.unsafe, "left", 9, 0.94);
}

function drawDiagram(result) {
  const rect = els.canvas.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;
  els.canvas.width = Math.max(1, Math.floor(rect.width * dpr));
  els.canvas.height = Math.max(1, Math.floor(rect.height * dpr));
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  const width = rect.width;
  const height = rect.height;
  const center = { x: width / 2, y: height / 2 + 12 };
  const plotRadius = Math.min(width * 0.4, height * 0.4);
  const largestRadius = Math.max(result.targetRadius, result.oppositeRadius, result.body.radius * 1.2);
  const scale = plotRadius / largestRadius;
  const bodyRadius = Math.max(24, Math.min(result.body.radius * scale, plotRadius * 0.2));
  const targetPoint = (t) => orbitPoint(center, scale, result.targetRadius, result.targetRadius, t);
  const resonantPoint = (t) => orbitPoint(center, scale, result.targetRadius, result.oppositeRadius, t);

  ctx.clearRect(0, 0, width, height);
  drawReferenceRings(center, plotRadius);
  drawFailureBoundary(result, center, scale);

  strokePoints(samplePath(targetPoint, Math.PI, Math.PI * 2), colors.target, 1.6, 0.2);
  strokePoints(samplePath(resonantPoint, Math.PI, Math.PI * 2), result.valid ? colors.carrier : colors.unsafe, 1.7, result.valid ? 0.24 : 0.5);
  strokePoints(samplePath(targetPoint, 0, Math.PI), colors.target, 1.9, 0.68);
  strokePoints(samplePath(resonantPoint, 0, Math.PI), result.valid ? colors.carrier : colors.unsafe, 2, result.valid ? 0.78 : 0.86);

  drawBody(center, bodyRadius, result.body.name);

  drawTail(resonantPoint, -100, 0, result.valid ? colors.carrier : colors.unsafe);
  const firstSlotAngle = Math.PI * 2 / result.count;
  drawTail(targetPoint, firstSlotAngle * 180 / Math.PI - 100, firstSlotAngle * 180 / Math.PI, colors.target);
  drawPhaseArc(targetPoint, firstSlotAngle, result.count);

  for (let index = 0; index < result.count; index += 1) {
    const angle = Math.PI * 2 * index / result.count;
    const point = targetPoint(angle);
    drawSatellite(point, tangentAt(targetPoint, angle), index + 1, index === 0);
  }

  const sharedNode = targetPoint(0);
  drawLabel(center.x, center.y - plotRadius * 0.42, `${result.numerator}:${result.count} PERIOD RESONANCE`, result.valid ? colors.carrier : colors.unsafe, "center", 11, 0.94);
  drawLabel(center.x, center.y + plotRadius * 0.47, `FINAL ${formatKm(result.altitude)}`, colors.target, "center", 10, 0.86);
  drawLabel(center.x - 8, center.y + plotRadius * 0.64, `${phasingMode.toUpperCase()} APSIS ${formatKm(result.oppositeAltitude)}`, result.valid ? colors.carrier : colors.unsafe, "center", 10, 0.9);
  drawBurn(result, sharedNode, resonantPoint, width);
}

function updateBodyRange() {
  const body = bodies[els.body.value];
  els.altitude.min = body.min;
  els.altitude.max = body.max;
  els.altitude.step = body.step;
  els.altitude.value = body.initial;
}

function render() {
  const result = calculate();
  const theoreticalMark = result.valid ? "" : "*";
  els.altitudeOut.textContent = formatKm(result.altitude);
  els.countOut.textContent = `${result.count} craft`;
  els.title.textContent = `${result.body.name} ${result.numerator}:${result.count} ${phasingMode === "inner" ? "Inner" : "Outer"} Resonance`;
  els.radius.textContent = `Radius ${result.body.radius.toLocaleString()} km`;
  els.targetPeriodFooter.textContent = `Target period ${formatDuration(result.targetPeriod)}`;
  els.statusMetric.classList.toggle("is-invalid", !result.valid);
  els.status.textContent = result.valid ? "DEPLOYMENT SAFE" : result.failure;
  els.ratio.textContent = `${result.numerator} : ${result.count}`;
  els.apsisLabel.textContent = `Phasing ${phasingMode === "inner" ? "periapsis" : "apoapsis"}`;
  els.phasingApsis.textContent = formatKm(result.oppositeAltitude);
  els.phasingApsis.classList.toggle("is-invalid", !result.valid);
  els.satelliteDv.textContent = `${formatVelocity(result.burn)}${theoreticalMark}`;
  els.campaignTime.textContent = formatDuration(result.campaignTime);
  els.targetPeriod.textContent = formatDuration(result.targetPeriod);
  els.releaseInterval.textContent = formatDuration(result.resonantPeriod);
  els.slotAngle.textContent = `${result.slotAngle.toFixed(result.slotAngle % 1 ? 1 : 0)}°`;
  els.carrierDv.textContent = `${formatVelocity(result.burn)} ${result.injectType}`;
  els.campaignDv.textContent = `${formatVelocity(result.campaignDv)}${theoreticalMark}`;

  if (!result.valid) {
    const hazard = result.failure === "OUTSIDE SOI" ? `${result.body.name}'s sphere of influence` : result.failure === "ATMOSPHERE" ? `${result.body.name}'s atmosphere` : `${result.body.name} itself`;
    const recovery = phasingMode === "inner"
      ? "switch to the outer phasing side, raise the final orbit, or use more satellites"
      : "switch to the inner phasing side, lower the final orbit, or use more satellites";
    els.note.textContent = `This ${phasingMode} resonance crosses ${hazard}. Values marked * are theoretical; ${recovery}.`;
  } else {
    els.note.textContent = `Burn ${result.injectType} to enter the ${phasingMode} carrier orbit. Release one craft every ${formatDuration(result.resonantPeriod)}, then circularize each satellite ${result.circularizeType} for ${formatVelocity(result.burn)}.`;
  }

  drawDiagram(result);
}

els.body.addEventListener("change", () => {
  updateBodyRange();
  render();
});

els.altitude.addEventListener("input", render);
els.count.addEventListener("input", render);

els.phasingButtons.forEach((button) => {
  button.addEventListener("click", () => {
    phasingMode = button.dataset.phasing;
    els.phasingButtons.forEach((candidate) => {
      const active = candidate === button;
      candidate.classList.toggle("active", active);
      candidate.setAttribute("aria-pressed", String(active));
    });
    render();
  });
});

window.addEventListener("resize", render);

updateBodyRange();
render();
