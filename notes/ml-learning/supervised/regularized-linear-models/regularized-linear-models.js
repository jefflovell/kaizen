const features = [
  { name: "Tone match", base: 0.34, penalty: 0.7, contribution: 18 },
  { name: "Star power", base: 0.28, penalty: 0.85, contribution: 13 },
  { name: "Franchise", base: 0.23, penalty: 0.95, contribution: 11 },
  { name: "Runtime", base: -0.19, penalty: 1.1, contribution: 8 },
  { name: "Release timing", base: 0.14, penalty: 1.25, contribution: 7 },
  { name: "Social buzz", base: 0.1, penalty: 1.5, contribution: 10 },
];

const state = { model: "ridge", lambda: 0.3 };
const baselineComplexity = features.reduce((sum, feature) => sum + Math.abs(feature.base), 0);
const fittedBases = features.map((feature) => feature.base);
const ui = {
  board: document.querySelector("#coefficient-board"),
  modelName: document.querySelector("#model-name"),
  modelBehavior: document.querySelector("#model-behavior"),
  prediction: document.querySelector("#regularized-prediction"),
  trainingError: document.querySelector("#training-error"),
  unseenError: document.querySelector("#unseen-error"),
  errorCurves: document.querySelector("#error-curves"),
  balance: document.querySelector("#balance-callout"),
  modelReadout: document.querySelector("#regularized-model-readout"),
  lambdaReadout: document.querySelector("#lambda-readout"),
  activeCount: document.querySelector("#active-feature-count"),
  modelButtons: [...document.querySelectorAll("[data-model]")],
  lambdaButtons: [...document.querySelectorAll("[data-lambda]")],
  lambdaSlider: document.querySelector("#lambda-slider"),
  lambdaSliderOutput: document.querySelector("#lambda-slider-output"),
};

function coefficient(feature) {
  if (state.model === "ridge") return feature.base / (1 + state.lambda * feature.penalty);
  const threshold = state.lambda * 0.055 * feature.penalty;
  return Math.sign(feature.base) * Math.max(Math.abs(feature.base) - threshold, 0);
}

function lambdaPosition(lambda) {
  return Math.log1p(lambda) / Math.log(11);
}

function lambdaFromPosition(position) {
  return Math.expm1((position / 100) * Math.log(11));
}

function sliderPosition(lambda) {
  return Math.round(lambdaPosition(lambda) * 100);
}

function errorsFor(lambda, model = state.model) {
  const position = lambdaPosition(lambda);
  const optimum = model === "ridge" ? lambdaPosition(0.35) : lambdaPosition(0.55);
  const distance = position - optimum;
  const complexity = features.reduce((sum, feature) => sum + Math.abs(feature.base), 0) / baselineComplexity;
  const weightShift = features.reduce((sum, feature, index) => sum + Math.abs(feature.base - fittedBases[index]), 0);
  const training = 7.4 + position * 7.2 + (1 - complexity) * 1.4 + weightShift * 1.2 + (model === "lasso" ? 0.35 : 0);
  const unseen = 9.15
    + Math.pow(distance, 2) * (distance < 0 ? 80 : 13)
    + Math.max(0, complexity - 1) * 2
    + Math.max(0, 0.7 - complexity) * 3
    + weightShift * 2
    + (model === "lasso" ? 0.15 : 0);
  return { training, unseen };
}

function modelState(unseen) {
  if (state.lambda === 0) return { title: "No regularization", copy: "The model is free to chase every pattern in the training catalog." };
  if (unseen <= 9.5) return { title: "Best balance", copy: "Some training fit is traded for a cleaner rule on unseen titles." };
  if (state.lambda >= 3) return { title: "Too constrained", copy: "Useful signal is being suppressed along with the noise." };
  return { title: "Moderate regularization", copy: "The model is becoming less sensitive to fragile coefficients." };
}

function renderBoard(values) {
  if (!ui.board.children.length) {
    ui.board.innerHTML = values.map(({ feature }, index) => `<article class="coefficient-channel" data-channel="${index}">
      <div class="coefficient-value"></div>
      <div class="coefficient-rail">
        <i></i><span class="coefficient-zero"></span>
        <input class="coefficient-slider" type="range" min="-0.4" max="0.4" step="0.01" value="${feature.base}" data-feature="${index}" aria-label="${feature.name} starting coefficient">
      </div>
      <strong>${feature.name}</strong>
    </article>`).join("");
  }
  values.forEach(({ feature, value }, index) => {
    const channel = ui.board.querySelector(`[data-channel="${index}"]`);
    const height = Math.max(2, Math.min(96, (Math.abs(value) / 0.4) * 96));
    const inactive = Math.abs(value) < 0.001;
    const bar = channel.querySelector(".coefficient-rail i");
    channel.classList.toggle("is-muted", inactive);
    channel.querySelector(".coefficient-value").textContent = `${value >= 0 ? "+" : ""}${value.toFixed(2)}`;
    channel.querySelector(".coefficient-slider").value = feature.base;
    bar.className = value >= 0 ? "positive" : "negative";
    bar.style.height = `${height}px`;
  });
}

function chartPath(points, width, top, height) {
  const min = 7;
  const max = 20;
  return points.map(({ lambda, value }) => {
    const x = 34 + lambdaPosition(lambda) * (width - 48);
    const y = top + height - ((value - min) / (max - min)) * height;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(" ");
}

function chartMarker(value, top, height) {
  const min = 7;
  const max = 20;
  return {
    x: 34 + lambdaPosition(state.lambda) * 252,
    y: top + height - ((value - min) / (max - min)) * height,
  };
}

function renderCurves(training, unseen) {
  const samples = [0, 0.04, 0.1, 0.2, 0.3, 0.5, 0.8, 1.2, 2, 3, 5, 7.5, 10];
  const checkpoints = [0, 0.1, 0.3, 1, 3, 10];
  const trainingPoints = samples.map((lambda) => ({ lambda, value: errorsFor(lambda).training }));
  const unseenPoints = samples.map((lambda) => ({ lambda, value: errorsFor(lambda).unseen }));
  const checkpointNodes = checkpoints.map((lambda) => {
    const checkpointErrors = errorsFor(lambda);
    const trainingPoint = {
      x: 34 + lambdaPosition(lambda) * 252,
      y: 24 + 58 - ((checkpointErrors.training - 7) / 13) * 58,
    };
    const unseenPoint = {
      x: trainingPoint.x,
      y: 117 + 58 - ((checkpointErrors.unseen - 7) / 13) * 58,
    };
    return `<circle class="curve-node training-node" cx="${trainingPoint.x}" cy="${trainingPoint.y}" r="2.8"></circle>
      <circle class="curve-node unseen-node" cx="${unseenPoint.x}" cy="${unseenPoint.y}" r="2.8"></circle>`;
  }).join("");
  const trainingMarker = chartMarker(training, 24, 58);
  const unseenMarker = chartMarker(unseen, 117, 58);
  const selectedX = trainingMarker.x;
  ui.errorCurves.innerHTML = `<svg viewBox="0 0 300 202" role="img" aria-labelledby="error-chart-title error-chart-desc">
    <title id="error-chart-title">Training and unseen error by regularization strength</title>
    <desc id="error-chart-desc">The highlighted points show the current lambda setting. Training error rises while unseen error first falls and then rises.</desc>
    <g class="chart-grid"><path d="M34 24V175M34 82H286M34 117H286M34 175H286"></path></g>
    <text x="34" y="14">Training error</text>
    <text x="34" y="107">Unseen error</text>
    <line class="current-lambda-line" x1="${selectedX}" y1="24" x2="${selectedX}" y2="175"></line>
    <polyline class="training-curve" points="${chartPath(trainingPoints, 300, 24, 58)}"></polyline>
    <polyline class="unseen-curve" points="${chartPath(unseenPoints, 300, 117, 58)}"></polyline>
    ${checkpointNodes}
    <circle class="training-marker" cx="${trainingMarker.x}" cy="${trainingMarker.y}" r="5"></circle>
    <circle class="unseen-marker" cx="${unseenMarker.x}" cy="${unseenMarker.y}" r="5"></circle>
    <text class="axis-label" x="34" y="195">0</text><text class="axis-label" x="273" y="195">10 λ</text>
  </svg>`;
}

function render() {
  const values = features.map((feature) => ({ feature, value: coefficient(feature) }));
  const active = values.filter(({ value }) => Math.abs(value) >= 0.001).length;
  const { training, unseen } = errorsFor(state.lambda);
  const completion = Math.round(42 + values.reduce((sum, { feature, value }) => sum + value * feature.contribution, 0));
  const balance = modelState(unseen);
  renderBoard(values);
  ui.modelName.textContent = state.model === "ridge" ? "Ridge Regression" : "Lasso Regression";
  ui.modelBehavior.textContent = state.model === "ridge" ? "All signals stay in the mix." : active < features.length ? `${features.length - active} weak signal${features.length - active === 1 ? "" : "s"} muted.` : "Weak signals are approaching zero.";
  ui.prediction.textContent = `${completion}%`;
  ui.trainingError.textContent = training.toFixed(1);
  ui.unseenError.textContent = unseen.toFixed(1);
  renderCurves(training, unseen);
  ui.balance.innerHTML = `<span>Model state</span><strong>${balance.title}</strong><p>${balance.copy}</p>`;
  ui.modelReadout.textContent = state.model === "ridge" ? "Ridge" : "Lasso";
  ui.lambdaReadout.textContent = state.lambda;
  ui.activeCount.textContent = `${active} / ${features.length}`;
  ui.lambdaSlider.value = sliderPosition(state.lambda);
  ui.lambdaSliderOutput.value = state.lambda < 1 ? state.lambda.toFixed(2) : state.lambda.toFixed(1);
  ui.lambdaButtons.forEach((item) => item.classList.toggle("is-selected", Number(item.dataset.lambda) === state.lambda));
}

ui.modelButtons.forEach((button) => button.addEventListener("click", () => {
  state.model = button.dataset.model;
  ui.modelButtons.forEach((item) => item.classList.toggle("is-selected", item === button));
  render();
}));
ui.lambdaButtons.forEach((button) => button.addEventListener("click", () => {
  state.lambda = Number(button.dataset.lambda);
  render();
}));
ui.lambdaSlider.addEventListener("input", () => {
  state.lambda = Number(lambdaFromPosition(Number(ui.lambdaSlider.value)).toFixed(2));
  render();
});
ui.board.addEventListener("input", (event) => {
  const slider = event.target.closest("[data-feature]");
  if (!slider) return;
  features[Number(slider.dataset.feature)].base = Number(slider.value);
  render();
});
render();
