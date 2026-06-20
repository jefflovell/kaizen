const homes = [
  { name: "Hot apartment · occupied", actual: 44 },
  { name: "Solar home · empty", actual: 16 },
  { name: "Older house · occupied", actual: 39 },
  { name: "Efficient condo · empty", actual: 18 },
  { name: "Large home · evening", actual: 35 },
  { name: "Shaded townhouse", actual: 24 },
  { name: "Pool pump · afternoon", actual: 33 },
  { name: "Solar home · occupied", actual: 23 },
];
const initialActuals = homes.map((home) => home.actual);
const rounds = [
  { focus: "temperature", weights: [0.72, 0.18, 0.45, 0.2, 0.35, 0.3, 0.65, 0.25] },
  { focus: "occupancy", weights: [0.62, 0.3, 0.58, 0.34, 0.64, 0.28, 0.38, 0.55] },
  { focus: "solar generation", weights: [0.32, 0.7, 0.3, 0.45, 0.28, 0.35, 0.32, 0.68] },
  { focus: "insulation", weights: [0.4, 0.32, 0.72, 0.58, 0.42, 0.62, 0.38, 0.42] },
  { focus: "home size", weights: [0.36, 0.28, 0.48, 0.32, 0.7, 0.4, 0.52, 0.36] },
  { focus: "appliance load", weights: [0.42, 0.35, 0.4, 0.34, 0.55, 0.38, 0.74, 0.4] },
  { focus: "remaining hot homes", weights: [0.58, 0.3, 0.5, 0.34, 0.5, 0.42, 0.6, 0.38] },
  { focus: "remaining residuals", weights: [0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5] },
  { focus: "high-demand edge cases", weights: [0.62, 0.3, 0.55, 0.32, 0.54, 0.4, 0.58, 0.38] },
  { focus: "low-demand edge cases", weights: [0.38, 0.62, 0.4, 0.6, 0.42, 0.56, 0.4, 0.6] },
  { focus: "small residual pockets", weights: [0.55, 0.45, 0.52, 0.48, 0.54, 0.46, 0.52, 0.48] },
  { focus: "training-set details", weights: [0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7] },
];
const state = { count: 0, rate: 0.4, selected: 0, depth: 1 };
const ui = {
  steps: document.querySelector("#boost-steps"), prediction: document.querySelector("#boost-prediction"),
  total: document.querySelector("#boost-total"), mae: document.querySelector("#boost-mae"),
  actual: document.querySelector("#boost-actual"), residual: document.querySelector("#boost-residual"),
  heldOut: document.querySelector("#boost-heldout"),
  treeCount: document.querySelector("#boost-tree-count"), stateTitle: document.querySelector("#boost-state-title"),
  stateCopy: document.querySelector("#boost-state-copy"), rounds: document.querySelector("#boost-rounds"),
  roundsOutput: document.querySelector("#boost-rounds-output"), rate: document.querySelector("#boost-rate"),
  rateOutput: document.querySelector("#boost-rate-output"), residuals: document.querySelector("#boost-residuals"),
  homeName: document.querySelector("#boost-home-name"), next: document.querySelector("#boost-next"),
  reset: document.querySelector("#boost-reset"), errorCurve: document.querySelector("#boost-error-curve"),
};
function baselineValue() {
  return homes.reduce((sum, home) => sum + home.actual, 0) / homes.length;
}
function calculateModel(count = state.count, rate = state.rate, depth = state.depth) {
  const baseline = baselineValue();
  const predictions = homes.map(() => baseline);
  const corrections = [];
  for (let round = 0; round < count; round += 1) {
    const residuals = homes.map((home, index) => home.actual - predictions[index]);
    const scaled = residuals.map((residual, index) => {
      const fitStrength = Math.min(0.96, rounds[round].weights[index] + (depth - 1) * 0.12);
      return rate * residual * fitStrength;
    });
    scaled.forEach((value, index) => { predictions[index] += value; });
    corrections.push({ focus: rounds[round].focus, scaled });
  }
  return { predictions, corrections, baseline };
}
function errorsAt(count) {
  const { predictions } = calculateModel(count);
  const training = homes.reduce((sum, home, index) => sum + Math.abs(home.actual - predictions[index]), 0) / homes.length;
  const safeRounds = 7 / (state.rate * Math.sqrt(state.depth));
  const overfit = Math.pow(Math.max(0, count - safeRounds), 2) * 0.16 * state.rate * state.depth;
  return { training, heldOut: training + 1.6 + overfit };
}
function renderErrorCurve() {
  const width = 300; const height = 150;
  const samples = Array.from({ length: 13 }, (_, count) => ({ count, ...errorsAt(count) }));
  const max = Math.max(...samples.map((sample) => sample.heldOut), 11);
  const x = (count) => 28 + (count / 12) * 252;
  const y = (value) => 118 - (value / max) * 92;
  const path = (field) => samples.map((sample) => `${x(sample.count)},${y(sample[field])}`).join(" ");
  const current = samples[state.count];
  ui.errorCurve.innerHTML = `<svg viewBox="0 0 ${width} ${height}" role="img" aria-label="Training error falls while held-out error may rise after too many aggressive rounds">
    <path class="boost-chart-grid" d="M28 26V118H280"></path>
    <polyline class="boost-training-line" points="${path("training")}"></polyline>
    <polyline class="boost-heldout-line" points="${path("heldOut")}"></polyline>
    <line class="boost-current-round" x1="${x(state.count)}" y1="26" x2="${x(state.count)}" y2="118"></line>
    <circle class="boost-training-dot" cx="${x(state.count)}" cy="${y(current.training)}" r="4"></circle>
    <circle class="boost-heldout-dot" cx="${x(state.count)}" cy="${y(current.heldOut)}" r="4"></circle>
    <text x="32" y="18">Training error</text><text x="182" y="18">Held-out error</text><text x="28" y="138">0</text><text x="266" y="138">12 rounds</text>
  </svg>`;
}
function render() {
  const { predictions, corrections, baseline } = calculateModel();
  const residuals = homes.map((home, index) => home.actual - predictions[index]);
  const mae = residuals.reduce((sum, residual) => sum + Math.abs(residual), 0) / homes.length;
  const selectedPrediction = predictions[state.selected];
  const selectedResidual = residuals[state.selected];
  ui.steps.innerHTML = `<article class="boost-step baseline"><span>Baseline mean</span><strong>${baseline.toFixed(1)} kWh</strong><small>same start for every home</small></article>` +
    corrections.map((round, index) => `<article class="boost-step"><span>Tree ${index + 1} · ${round.focus}</span><strong>${round.scaled[state.selected] >= 0 ? "+" : ""}${round.scaled[state.selected].toFixed(1)} kWh</strong><small>scaled residual correction</small></article>`).join("");
  ui.prediction.textContent = `${selectedPrediction.toFixed(1)} kWh`;
  ui.total.textContent = `${selectedPrediction.toFixed(1)} kWh`;
  ui.mae.textContent = `${mae.toFixed(1)} kWh`;
  ui.actual.textContent = `${homes[state.selected].actual.toFixed(1)} kWh`;
  ui.residual.textContent = `${selectedResidual >= 0 ? "+" : ""}${selectedResidual.toFixed(1)} kWh`;
  ui.treeCount.textContent = state.count;
  ui.heldOut.textContent = `${errorsAt(state.count).heldOut.toFixed(1)} kWh`;
  ui.homeName.textContent = homes[state.selected].name;
  ui.roundsOutput.textContent = `${state.count} ${state.count === 1 ? "tree" : "trees"}`;
  ui.rateOutput.textContent = state.rate.toFixed(1);
  ui.next.disabled = state.count >= 12;
  ui.residuals.innerHTML = homes.map((home, index) => {
    const residual = residuals[index];
    const width = Math.min(100, (Math.abs(residual) / 18) * 100);
    return `<article class="${index === state.selected ? "is-selected" : ""}">
      <button type="button" data-home="${index}"><span>${home.name}</span><div><i class="${residual >= 0 ? "positive" : "negative"}" style="width:${width}%"></i></div><strong>${residual >= 0 ? "+" : ""}${residual.toFixed(1)}</strong></button>
      <input type="range" min="10" max="50" step="1" value="${home.actual}" data-actual="${index}" aria-label="Actual demand for ${home.name}" />
    </article>`;
  }).join("");
  renderErrorCurve();
  if (state.count === 0) {
    ui.stateTitle.textContent = "Baseline only"; ui.stateCopy.textContent = "Every home receives the mean. Large systematic residuals remain.";
  } else if (state.rate >= 0.8 && state.count >= 6) {
    ui.stateTitle.textContent = "Aggressive corrections"; ui.stateCopy.textContent = "Large steps fit quickly, but leave less room for later trees to correct gracefully.";
  } else if (state.count < 4) {
    ui.stateTitle.textContent = "Early revisions"; ui.stateCopy.textContent = "The largest patterns are shrinking, but meaningful residuals remain.";
  } else {
    ui.stateTitle.textContent = "Refined ensemble"; ui.stateCopy.textContent = "Several modest trees have converted a crude baseline into tailored forecasts.";
  }
}
ui.rounds.addEventListener("input", () => { state.count = Number(ui.rounds.value); render(); });
ui.rate.addEventListener("input", () => { state.rate = Number(ui.rate.value) / 10; render(); });
ui.residuals.addEventListener("click", (event) => { const button = event.target.closest("[data-home]"); if (!button) return; state.selected = Number(button.dataset.home); render(); });
ui.residuals.addEventListener("change", (event) => {
  const slider = event.target.closest("[data-actual]");
  if (!slider) return;
  homes[Number(slider.dataset.actual)].actual = Number(slider.value);
  state.selected = Number(slider.dataset.actual);
  render();
});
ui.next.addEventListener("click", () => { state.count = Math.min(12, state.count + 1); ui.rounds.value = state.count; render(); });
document.querySelectorAll("[data-depth]").forEach((button) => button.addEventListener("click", () => {
  state.depth = Number(button.dataset.depth);
  document.querySelectorAll("[data-depth]").forEach((item) => item.classList.toggle("is-selected", item === button));
  render();
}));
ui.reset.addEventListener("click", () => {
  homes.forEach((home, index) => { home.actual = initialActuals[index]; });
  state.count = 0; state.rate = 0.4; state.depth = 1; state.selected = 0;
  ui.rounds.value = 0; ui.rate.value = 4;
  document.querySelectorAll("[data-depth]").forEach((item) => item.classList.toggle("is-selected", item.dataset.depth === "1"));
  render();
});
render();
