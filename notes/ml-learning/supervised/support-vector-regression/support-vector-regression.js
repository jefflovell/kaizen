const pickups = [
  { name: "Driver around the corner", distance: 0.4, actual: 0.9 },
  { name: "Busy downtown corner", distance: 0.7, actual: 7.1 },
  { name: "Downtown side street", distance: 1.0, actual: 6.7 },
  { name: "Driver finishing nearby drop-off", distance: 1.3, actual: 2.8 },
  { name: "Stadium district with event traffic", distance: 1.6, actual: 14.8 },
  { name: "Residential shortcut", distance: 1.9, actual: 10.1 },
  { name: "Rainy cross-town pickup", distance: 2.2, actual: 13.1 },
  { name: "Transit hub pickup zone", distance: 2.5, actual: 11.7 },
  { name: "Airport queue", distance: 2.8, actual: 19.4 },
  { name: "Expressway approach, no traffic", distance: 3.1, actual: 7.3 },
  { name: "Bridge congestion", distance: 3.4, actual: 23.0 },
  { name: "Driver already headed toward rider", distance: 3.7, actual: 12.1 },
  { name: "Event district clearing out", distance: 4.0, actual: 19.2 },
  { name: "Open highway, driver already moving", distance: 4.3, actual: 18.3 },
  { name: "Construction zone", distance: 4.6, actual: 27.4 },
  { name: "Outer-neighborhood pickup", distance: 4.9, actual: 19.9 },
];

const initialActuals = pickups.map((pickup) => pickup.actual);
const state = { epsilon: 3, c: 5, selected: 4, model: { intercept: 3, slope: 3.7 }, dragging: null };
const ui = {
  chart: document.querySelector("#svr-chart"),
  epsilon: document.querySelector("#epsilon-slider"),
  epsilonOutput: document.querySelector("#epsilon-output"),
  c: document.querySelector("#c-slider"),
  cOutput: document.querySelector("#c-output"),
  supportCount: document.querySelector("#svr-support-count"),
  prediction: document.querySelector("#svr-prediction"),
  range: document.querySelector("#svr-range"),
  loss: document.querySelector("#svr-loss"),
  modelState: document.querySelector("#svr-state"),
  selectedName: document.querySelector("#svr-selected-name"),
  selectedCopy: document.querySelector("#svr-selected-copy"),
  reset: document.querySelector("#svr-reset"),
};

function fitModel() {
  const meanDistance = pickups.reduce((sum, pickup) => sum + pickup.distance, 0) / pickups.length;
  const meanActual = pickups.reduce((sum, pickup) => sum + pickup.actual, 0) / pickups.length;
  let slope = 3.5;
  let intercept = meanActual - slope * meanDistance;

  for (let iteration = 0; iteration < 1600; iteration += 1) {
    let interceptGradient = 0;
    let slopeGradient = 0.35 * slope;

    pickups.forEach((pickup) => {
      const residual = pickup.actual - (intercept + slope * pickup.distance);
      if (Math.abs(residual) <= state.epsilon) return;
      const direction = Math.sign(residual);
      interceptGradient -= (state.c * direction) / pickups.length;
      slopeGradient -= (state.c * direction * pickup.distance) / pickups.length;
    });

    const learningRate = 0.008 / (1 + iteration / 500);
    intercept -= learningRate * interceptGradient;
    slope -= learningRate * slopeGradient;
  }

  return { intercept, slope };
}

function predict(distance) {
  const { intercept, slope } = state.model;
  return intercept + slope * distance;
}

function pickupMetrics(pickup) {
  const predicted = predict(pickup.distance);
  const residual = pickup.actual - predicted;
  const violation = Math.max(0, Math.abs(residual) - state.epsilon);
  return { predicted, residual, violation, support: Math.abs(residual) >= state.epsilon - 0.08 };
}

function modelDescription(supportCount) {
  if (state.epsilon >= 5) return { title: "Very forgiving", copy: "The wide tube ignores substantial pickup variation. The model is stable, but its promise may be too vague to help a rider." };
  if (state.epsilon <= 1.5 && state.c >= 7) return { title: "Chasing precision", copy: "A narrow tube and high penalty make many arrivals influential. The model reacts strongly to unusual pickup conditions." };
  if (state.epsilon <= 1.5) return { title: "Almost no room for noise", copy: "Nearly every pickup becomes a support vector. The model is treating ordinary arrival variation as something it must explain." };
  if (state.c <= 2) return { title: "Soft consequences", copy: "Unusually fast and slow arrivals remain visible, but the low penalty lets larger violations persist." };
  if (supportCount <= 3) return { title: "Sparse guidance", copy: "Only a few unusual arrival times shape the function. That can be elegant—or too detached from operational reality." };
  return { title: "Balanced tolerance", copy: "Ordinary arrival variation is ignored while unusually fast and slow pickups still shape the model." };
}

function renderChart() {
  const width = 720;
  const height = 430;
  const plot = { left: 58, right: 694, top: 24, bottom: 374 };
  const x = (distance) => plot.left + (distance / 5.2) * (plot.right - plot.left);
  const y = (minutes) => plot.bottom - (minutes / 28) * (plot.bottom - plot.top);
  const startPrediction = predict(0);
  const endPrediction = predict(5.2);
  const upperStart = startPrediction + state.epsilon;
  const upperEnd = endPrediction + state.epsilon;
  const lowerStart = Math.max(0, startPrediction - state.epsilon);
  const lowerEnd = Math.max(0, endPrediction - state.epsilon);

  const grid = [0, 5, 10, 15, 20, 25].map((minute) =>
    `<line x1="${plot.left}" y1="${y(minute)}" x2="${plot.right}" y2="${y(minute)}"></line><text x="18" y="${y(minute) + 4}">${minute}</text>`
  ).join("");
  const xLabels = [0, 1, 2, 3, 4, 5].map((distance) =>
    `<text x="${x(distance)}" y="404">${distance}</text>`
  ).join("");
  const pointMarkup = pickups.map((pickup, index) => {
    const metrics = pickupMetrics(pickup);
    const classes = [
      "svr-point",
      metrics.support ? "is-support" : "",
      metrics.support && metrics.residual < 0 ? "is-below" : "",
      index === state.selected ? "is-selected" : "",
    ].filter(Boolean).join(" ");
    return `<button type="button" class="${classes}" data-pickup="${index}" aria-label="${pickup.name}: actual arrival ${pickup.actual.toFixed(1)} minutes. Drag vertically or use the arrow keys to change the arrival time.">
      <span style="left:${(x(pickup.distance) / width) * 100}%;top:${(y(pickup.actual) / height) * 100}%"></span>
    </button>`;
  }).join("");

  ui.chart.innerHTML = `<svg viewBox="0 0 ${width} ${height}" role="img" aria-labelledby="svr-chart-title svr-chart-desc">
    <title id="svr-chart-title">Rideshare pickup predictions with an epsilon tolerance tube</title>
    <desc id="svr-chart-desc">Pickup observations are plotted by driver distance and actual arrival time. The center line is the model prediction and the shaded band is the acceptable error tube.</desc>
    <g class="svr-grid">${grid}<line x1="${plot.left}" y1="${plot.bottom}" x2="${plot.right}" y2="${plot.bottom}"></line></g>
    <polygon class="svr-tube" points="${x(0)},${y(upperStart)} ${x(5.2)},${y(upperEnd)} ${x(5.2)},${y(lowerEnd)} ${x(0)},${y(lowerStart)}"></polygon>
    <line class="svr-boundary" x1="${x(0)}" y1="${y(upperStart)}" x2="${x(5.2)}" y2="${y(upperEnd)}"></line>
    <line class="svr-boundary" x1="${x(0)}" y1="${y(lowerStart)}" x2="${x(5.2)}" y2="${y(lowerEnd)}"></line>
    <line class="svr-fit-line" x1="${x(0)}" y1="${y(startPrediction)}" x2="${x(5.2)}" y2="${y(endPrediction)}"></line>
    <text class="svr-axis-title" x="286" y="426">Driver distance (miles)</text>
    <text class="svr-axis-title" transform="translate(12 260) rotate(-90)">Actual pickup time (minutes)</text>
    <g class="svr-x-labels">${xLabels}</g>
  </svg>${pointMarkup}`;
}

function render() {
  state.model = fitModel();
  const metrics = pickups.map(pickupMetrics);
  const supportCount = metrics.filter((item) => item.support).length;
  const averageViolation = metrics.reduce((sum, item) => sum + item.violation, 0) / pickups.length;
  const riderDistance = 2.8;
  const riderPrediction = predict(riderDistance);
  const selectedPickup = pickups[state.selected];
  const selected = metrics[state.selected];
  const model = modelDescription(supportCount);

  renderChart();
  ui.epsilonOutput.value = state.epsilon.toFixed(1);
  ui.cOutput.value = state.c;
  ui.supportCount.textContent = `${supportCount} / ${pickups.length}`;
  ui.prediction.textContent = `${Math.round(riderPrediction)} min`;
  ui.range.textContent = `${Math.max(0, riderPrediction - state.epsilon).toFixed(1)}–${(riderPrediction + state.epsilon).toFixed(1)} min`;
  ui.loss.textContent = `${averageViolation.toFixed(1)} min`;
  ui.modelState.innerHTML = `<span>Model state</span><strong>${model.title}</strong><p>${model.copy}</p>`;
  ui.selectedName.textContent = selectedPickup.name;
  const direction = selected.residual >= 0 ? "later" : "earlier";
  const status = selected.support
    ? `It sits ${selected.violation.toFixed(1)} minutes beyond the tube and helps shape the model.`
    : "It falls inside the tolerance tube, so its ε-insensitive loss is zero.";
  ui.selectedCopy.textContent = `Actual arrival: ${selectedPickup.actual.toFixed(1)} min. Predicted: ${selected.predicted.toFixed(1)} min—${Math.abs(selected.residual).toFixed(1)} min ${direction}. ${status}`;
}

ui.epsilon.addEventListener("input", () => {
  state.epsilon = Number(ui.epsilon.value);
  render();
});

ui.c.addEventListener("input", () => {
  state.c = Number(ui.c.value);
  render();
});

ui.chart.addEventListener("click", (event) => {
  const point = event.target.closest("[data-pickup]");
  if (!point) return;
  state.selected = Number(point.dataset.pickup);
  render();
});

function actualFromPointer(clientY) {
  const chartBox = ui.chart.getBoundingClientRect();
  const viewBoxY = ((clientY - chartBox.top) / chartBox.height) * 430;
  const minutes = ((374 - viewBoxY) / (374 - 24)) * 28;
  return Math.max(0, Math.min(28, Math.round(minutes * 10) / 10));
}

ui.chart.addEventListener("pointerdown", (event) => {
  const point = event.target.closest("[data-pickup]");
  if (!point) return;
  event.preventDefault();
  state.dragging = Number(point.dataset.pickup);
  state.selected = state.dragging;
  pickups[state.dragging].actual = actualFromPointer(event.clientY);
  ui.chart.classList.add("is-dragging");
  render();
});

window.addEventListener("pointermove", (event) => {
  if (state.dragging === null) return;
  event.preventDefault();
  pickups[state.dragging].actual = actualFromPointer(event.clientY);
  render();
});

window.addEventListener("pointerup", () => {
  if (state.dragging === null) return;
  state.dragging = null;
  ui.chart.classList.remove("is-dragging");
});

ui.chart.addEventListener("keydown", (event) => {
  const point = event.target.closest("[data-pickup]");
  if (!point || !["ArrowUp", "ArrowDown"].includes(event.key)) return;
  event.preventDefault();
  const index = Number(point.dataset.pickup);
  const direction = event.key === "ArrowUp" ? 0.5 : -0.5;
  state.selected = index;
  pickups[index].actual = Math.max(0, Math.min(28, pickups[index].actual + direction));
  render();
  ui.chart.querySelector(`[data-pickup="${index}"]`).focus();
});

ui.reset.addEventListener("click", () => {
  pickups.forEach((pickup, index) => {
    pickup.actual = initialActuals[index];
  });
  state.selected = 4;
  render();
});

render();
