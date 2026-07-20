const bodies = {
  kerbin: { name: "Kerbin", radius: 600, mu: 3531.6, rotation: 21549.4251830898, soi: 84159.286, atmosphere: 70 },
  mun: { name: "Mun", radius: 200, mu: 65.138, rotation: 138984.376574476, soi: 2429.559, atmosphere: 0 },
  minmus: { name: "Minmus", radius: 60, mu: 1.7658, rotation: 40400, soi: 2247.428, atmosphere: 0 },
  duna: { name: "Duna", radius: 320, mu: 301.363, rotation: 65517.859375, soi: 47921.949, atmosphere: 50 },
  eve: { name: "Eve", radius: 700, mu: 8171.73, rotation: 80500, soi: 85109.365, atmosphere: 90 },
  moho: { name: "Moho", radius: 250, mu: 168.609, rotation: 1210000, soi: 9646.663, atmosphere: 0 },
  ike: { name: "Ike", radius: 130, mu: 18.568, rotation: 65517.8621348081, soi: 1049.599, atmosphere: 0 },
  jool: { name: "Jool", radius: 6000, mu: 282528, rotation: 36000, soi: 2455985.185, atmosphere: 200 },
};

const colors = {
  track: "#5bd7eb",
  tail: "#d8f36a",
  node: "#ff18b0",
  craft: "#ff704d",
  craftOutline: "#ffd7cc",
  grid: "rgba(91, 215, 235, 0.12)",
  gridStrong: "rgba(91, 215, 235, 0.28)",
  text: "#edf7f8",
  muted: "#9bb0b8",
  unsafe: "#ff6f4c",
};

const els = {
  body: document.querySelector("#body-select"),
  orbitCount: document.querySelector("#orbit-count"),
  orbitOut: document.querySelector("#orbit-output"),
  dayCount: document.querySelector("#day-count"),
  dayOut: document.querySelector("#day-output"),
  inclination: document.querySelector("#inclination"),
  inclinationOut: document.querySelector("#inclination-output"),
  note: document.querySelector("#orbit-note"),
  title: document.querySelector("#diagram-title"),
  bodyPeriod: document.querySelector("#body-period"),
  cycleFooter: document.querySelector("#cycle-footer"),
  statusMetric: document.querySelector("#status-metric"),
  status: document.querySelector("#orbit-status"),
  altitude: document.querySelector("#target-altitude"),
  ratio: document.querySelector("#effective-ratio"),
  repeatInterval: document.querySelector("#repeat-interval"),
  longitudeStep: document.querySelector("#longitude-step"),
  orbitalPeriod: document.querySelector("#orbital-period"),
  speed: document.querySelector("#orbital-speed"),
  latitudeBand: document.querySelector("#latitude-band"),
  trackSpacing: document.querySelector("#track-spacing"),
  direction: document.querySelector("#orbit-direction"),
  canvas: document.querySelector("#ground-canvas"),
};

const ctx = els.canvas.getContext("2d");

function greatestCommonDivisor(a, b) {
  let x = Math.abs(a);
  let y = Math.abs(b);
  while (y) [x, y] = [y, x % y];
  return x || 1;
}

function wrapRadians(angle) {
  return ((angle + Math.PI) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI) - Math.PI;
}

function calculate() {
  const body = bodies[els.body.value];
  const requestedOrbits = Number(els.orbitCount.value);
  const requestedDays = Number(els.dayCount.value);
  const divisor = greatestCommonDivisor(requestedOrbits, requestedDays);
  const repeatOrbits = requestedOrbits / divisor;
  const repeatDays = requestedDays / divisor;
  const inclination = Number(els.inclination.value);
  const orbitalPeriod = body.rotation * requestedDays / requestedOrbits;
  const orbitRadius = Math.cbrt(body.mu * (orbitalPeriod / (2 * Math.PI)) ** 2);
  const altitude = orbitRadius - body.radius;
  const orbitalSpeed = Math.sqrt(body.mu / orbitRadius);
  const repeatInterval = body.rotation * repeatDays;
  const rawLongitudeStep = 360 * repeatDays / repeatOrbits;
  const longitudeStep = ((rawLongitudeStep % 360) + 360) % 360;
  const trackSpacing = 360 / repeatOrbits;
  const latitudeLimit = Math.min(inclination, 180 - inclination);
  const direction = inclination < 90 ? "Prograde" : inclination > 90 ? "Retrograde" : "Polar";
  const aboveSurface = orbitRadius > body.radius;
  const aboveAtmosphere = altitude > body.atmosphere;
  const insideSoi = orbitRadius < body.soi;
  const valid = aboveSurface && aboveAtmosphere && insideSoi;
  let failure = "";
  if (!aboveSurface) failure = "INTERSECTS BODY";
  else if (!aboveAtmosphere) failure = "INSIDE ATMOSPHERE";
  else if (!insideSoi) failure = "OUTSIDE SOI";

  return {
    body,
    requestedOrbits,
    requestedDays,
    divisor,
    repeatOrbits,
    repeatDays,
    inclination,
    orbitalPeriod,
    orbitRadius,
    altitude,
    orbitalSpeed,
    repeatInterval,
    longitudeStep,
    trackSpacing,
    latitudeLimit,
    direction,
    valid,
    failure,
  };
}

function formatVelocity(value) {
  return `${Math.round(value * 1000).toLocaleString()} m/s`;
}

function formatKm(value) {
  const rounded = Math.round(value);
  const sign = rounded < 0 ? "−" : "";
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

function groundState(result, time) {
  const orbitalAngle = 2 * Math.PI * time / result.orbitalPeriod;
  const inclination = result.inclination * Math.PI / 180;
  const x = Math.cos(orbitalAngle);
  const y = Math.sin(orbitalAngle) * Math.cos(inclination);
  const z = Math.sin(orbitalAngle) * Math.sin(inclination);
  const inertialLongitude = Math.atan2(y, x);
  const rotationAngle = 2 * Math.PI * time / result.body.rotation;
  return {
    longitude: wrapRadians(inertialLongitude - rotationAngle),
    latitude: Math.asin(Math.max(-1, Math.min(1, z))),
  };
}

function mapPoint(map, state) {
  return {
    x: map.x + (state.longitude + Math.PI) / (2 * Math.PI) * map.width,
    y: map.y + (Math.PI / 2 - state.latitude) / Math.PI * map.height,
  };
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

function drawMapFrame(map, result) {
  ctx.save();
  ctx.fillStyle = "rgba(4, 12, 17, 0.72)";
  ctx.strokeStyle = "rgba(91, 215, 235, 0.24)";
  ctx.lineWidth = 1;
  ctx.fillRect(map.x, map.y, map.width, map.height);
  ctx.strokeRect(map.x, map.y, map.width, map.height);

  const northY = map.y + (90 - result.latitudeLimit) / 180 * map.height;
  const southY = map.y + (90 + result.latitudeLimit) / 180 * map.height;
  ctx.fillStyle = "rgba(91, 215, 235, 0.035)";
  ctx.fillRect(map.x, northY, map.width, southY - northY);

  for (let longitude = -150; longitude <= 150; longitude += 30) {
    const x = map.x + (longitude + 180) / 360 * map.width;
    ctx.strokeStyle = longitude === 0 ? colors.gridStrong : colors.grid;
    ctx.setLineDash(longitude === 0 ? [] : [2, 7]);
    ctx.beginPath();
    ctx.moveTo(x, map.y);
    ctx.lineTo(x, map.y + map.height);
    ctx.stroke();
    if (longitude % 60 === 0) drawLabel(x, map.y + map.height + 17, `${Math.abs(longitude)}°${longitude < 0 ? "W" : longitude > 0 ? "E" : ""}`, colors.muted, "center", 8, 0.62);
  }

  for (let latitude = -60; latitude <= 60; latitude += 30) {
    const y = map.y + (90 - latitude) / 180 * map.height;
    ctx.strokeStyle = latitude === 0 ? colors.gridStrong : colors.grid;
    ctx.setLineDash(latitude === 0 ? [] : [2, 7]);
    ctx.beginPath();
    ctx.moveTo(map.x, y);
    ctx.lineTo(map.x + map.width, y);
    ctx.stroke();
    drawLabel(map.x - 8, y + 3, `${Math.abs(latitude)}°${latitude < 0 ? "S" : latitude > 0 ? "N" : ""}`, colors.muted, "right", 8, 0.62);
  }
  ctx.restore();

  drawLabel(map.x + map.width / 2, map.y + map.height / 2 + 5, result.body.name.toUpperCase(), colors.text, "center", Math.max(12, Math.min(20, map.width / 36)), 0.1);
  drawLabel(map.x, map.y - 14, `EQUIRECTANGULAR SURFACE TRACE // ±${result.latitudeLimit}° COVERAGE`, colors.track, "left", 9, 0.78);
}

function drawGroundTrack(map, result) {
  const steps = Math.min(4800, Math.max(360, result.repeatOrbits * 180));
  const duration = result.repeatInterval;
  const trackColor = result.valid ? colors.track : colors.unsafe;
  ctx.save();
  ctx.strokeStyle = trackColor;
  ctx.globalAlpha = result.valid ? 0.74 : 0.82;
  ctx.lineWidth = 1.55;
  ctx.setLineDash([4, 5]);
  ctx.beginPath();
  let previous = null;
  for (let index = 0; index <= steps; index += 1) {
    const time = duration * index / steps;
    const point = mapPoint(map, groundState(result, time));
    if (!previous || Math.abs(point.x - previous.x) > map.width * 0.5) ctx.moveTo(point.x, point.y);
    else ctx.lineTo(point.x, point.y);
    previous = point;
  }
  ctx.stroke();
  ctx.restore();
}

function drawTail(map, result) {
  const widths = [0.5, 0.65, 0.8, 0.95, 1.1, 1.3, 1.55, 1.8, 2.1, 2.4, 2.75, 3.1, 3.45, 3.8, 4.15, 4.5];
  const endTime = result.orbitalPeriod * 0.28;
  const startTime = endTime - result.orbitalPeriod * (100 / 360);
  ctx.save();
  widths.forEach((width, index) => {
    const timeA = startTime + (endTime - startTime) * index / widths.length;
    const timeB = startTime + (endTime - startTime) * (index + 1) / widths.length;
    const pointA = mapPoint(map, groundState(result, timeA));
    const pointB = mapPoint(map, groundState(result, timeB));
    if (Math.abs(pointB.x - pointA.x) > map.width * 0.5) return;
    ctx.strokeStyle = result.valid ? colors.tail : colors.unsafe;
    ctx.globalAlpha = 0.04 + index / (widths.length - 1) * 0.94;
    ctx.lineWidth = width;
    ctx.beginPath();
    ctx.moveTo(pointA.x, pointA.y);
    ctx.lineTo(pointB.x, pointB.y);
    ctx.stroke();
  });
  ctx.restore();

  const point = mapPoint(map, groundState(result, endTime));
  const before = mapPoint(map, groundState(result, endTime - result.orbitalPeriod * 0.001));
  const after = mapPoint(map, groundState(result, endTime + result.orbitalPeriod * 0.001));
  let dx = after.x - before.x;
  const dy = after.y - before.y;
  if (Math.abs(dx) > map.width * 0.5) dx += dx > 0 ? -map.width : map.width;
  const length = Math.hypot(dx, dy) || 1;
  drawCraft(point, { x: dx / length, y: dy / length });
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

function drawArrow(origin, end, color) {
  const dx = end.x - origin.x;
  const dy = end.y - origin.y;
  const length = Math.hypot(dx, dy) || 1;
  const unit = { x: dx / length, y: dy / length };
  const perpendicular = { x: -unit.y, y: unit.x };
  const shaftEnd = { x: end.x - unit.x * 7, y: end.y - unit.y * 7 };
  ctx.save();
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(origin.x, origin.y);
  ctx.lineTo(shaftEnd.x, shaftEnd.y);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(end.x, end.y);
  ctx.lineTo(shaftEnd.x + perpendicular.x * 4, shaftEnd.y + perpendicular.y * 4);
  ctx.lineTo(shaftEnd.x - perpendicular.x * 4, shaftEnd.y - perpendicular.y * 4);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawRepeatNodes(map, result) {
  const start = mapPoint(map, groundState(result, 0));
  const next = mapPoint(map, groundState(result, result.orbitalPeriod));
  ctx.save();
  ctx.strokeStyle = colors.node;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(start.x, start.y, 7, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(start.x, start.y, 2, 0, Math.PI * 2);
  ctx.fillStyle = colors.node;
  ctx.fill();
  ctx.restore();
  drawLabel(start.x + 12, start.y - 11, "REPEAT NODE", colors.node, "left", 9, 0.94);

  if (Math.abs(next.x - start.x) < map.width * 0.5 && Math.abs(next.x - start.x) > 4) {
    const y = start.y + 28;
    drawArrow({ x: start.x, y }, { x: next.x, y }, colors.tail);
    drawLabel((start.x + next.x) / 2, y + 18, `${result.longitudeStep.toFixed(result.longitudeStep % 1 ? 1 : 0)}° / ORBIT`, colors.tail, "center", 9, 0.9);
  }

  for (let orbit = 1; orbit < result.repeatOrbits; orbit += 1) {
    const node = mapPoint(map, groundState(result, result.orbitalPeriod * orbit));
    ctx.save();
    ctx.fillStyle = colors.tail;
    ctx.globalAlpha = 0.72;
    ctx.beginPath();
    ctx.arc(node.x, node.y, 2.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

function drawDiagram(result) {
  const rect = els.canvas.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;
  els.canvas.width = Math.max(1, Math.floor(rect.width * dpr));
  els.canvas.height = Math.max(1, Math.floor(rect.height * dpr));
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, rect.width, rect.height);

  const mobile = rect.width < 500;
  const map = {
    x: mobile ? 34 : 58,
    y: mobile ? 86 : 82,
    width: rect.width - (mobile ? 56 : 92),
    height: rect.height - (mobile ? 176 : 164),
  };
  drawMapFrame(map, result);
  drawGroundTrack(map, result);
  drawRepeatNodes(map, result);
  drawTail(map, result);

  if (!result.valid) {
    drawLabel(map.x + map.width / 2, map.y + 28, `${result.failure} // THEORETICAL TRACK`, colors.unsafe, "center", mobile ? 9 : 12, 0.96);
  }
}

function render() {
  const result = calculate();
  const reduced = result.divisor > 1;
  els.orbitOut.textContent = `${result.requestedOrbits} ${result.requestedOrbits === 1 ? "orbit" : "orbits"}`;
  els.dayOut.textContent = `${result.requestedDays} ${result.requestedDays === 1 ? "day" : "days"}`;
  els.inclinationOut.textContent = `${result.inclination}°`;
  els.title.textContent = `${result.body.name} ${result.repeatOrbits}:${result.repeatDays} Repeat Track`;
  els.bodyPeriod.textContent = `Sidereal day ${formatDuration(result.body.rotation)}`;
  els.cycleFooter.textContent = `Cycle ${result.repeatOrbits} ${result.repeatOrbits === 1 ? "orbit" : "orbits"} / ${result.repeatDays} ${result.repeatDays === 1 ? "day" : "days"}`;
  els.statusMetric.classList.toggle("is-invalid", !result.valid);
  els.status.textContent = result.valid ? "TRACK VALID" : result.failure;
  els.altitude.textContent = `${formatKm(result.altitude)}${result.valid ? "" : "*"}`;
  els.altitude.classList.toggle("is-invalid", !result.valid);
  els.ratio.textContent = `${result.repeatOrbits} : ${result.repeatDays}`;
  els.repeatInterval.textContent = formatDuration(result.repeatInterval);
  els.longitudeStep.textContent = result.longitudeStep < 0.05 ? "0°" : `${result.longitudeStep.toFixed(result.longitudeStep % 1 ? 1 : 0)}° west`;
  els.orbitalPeriod.textContent = formatDuration(result.orbitalPeriod);
  els.speed.textContent = `${formatVelocity(result.orbitalSpeed)}${result.valid ? "" : "*"}`;
  els.latitudeBand.textContent = `±${result.latitudeLimit}°`;
  els.trackSpacing.textContent = `${result.trackSpacing.toFixed(result.trackSpacing % 1 ? 1 : 0)}°`;
  els.direction.textContent = result.direction;

  if (!result.valid) {
    const recovery = result.failure === "OUTSIDE SOI" ? "increase the orbit count or reduce the body-rotation count" : "reduce the orbit count or increase the body-rotation count";
    els.note.textContent = `This timing ratio puts the circular orbit ${result.failure === "OUTSIDE SOI" ? "beyond the SOI" : "below a usable altitude"}. Values marked * are theoretical; ${recovery}.`;
  } else if (reduced) {
    els.note.textContent = `${result.requestedOrbits}:${result.requestedDays} reduces to ${result.repeatOrbits}:${result.repeatDays}, so the ground pattern closes after ${formatDuration(result.repeatInterval)} instead of using the duplicate laps in the requested cycle.`;
  } else {
    els.note.textContent = `${result.repeatOrbits} ${result.repeatOrbits === 1 ? "inclined pass closes" : "inclined passes close"} after ${result.repeatDays} ${result.repeatDays === 1 ? `${result.body.name} day` : `${result.body.name} days`}, revisiting the same longitude pattern every ${formatDuration(result.repeatInterval)}.`;
  }

  drawDiagram(result);
}

els.body.addEventListener("change", render);
els.orbitCount.addEventListener("input", render);
els.dayCount.addEventListener("input", render);
els.inclination.addEventListener("input", render);
window.addEventListener("resize", render);

render();
