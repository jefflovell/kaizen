const features = [
  { name: "Tone match", base: 0.34, penalty: 0.7, contribution: 18 },
  { name: "Star power", base: 0.28, penalty: 0.85, contribution: 13 },
  { name: "Franchise", base: 0.23, penalty: 0.95, contribution: 11 },
  { name: "Runtime", base: -0.19, penalty: 1.1, contribution: 8 },
  { name: "Release timing", base: 0.14, penalty: 1.25, contribution: 7 },
  { name: "Social buzz", base: 0.1, penalty: 1.5, contribution: 10 },
];

const state = { model: "ridge", lambda: 0.3 };
const ui = {
  board: document.querySelector("#coefficient-board"),
  modelName: document.querySelector("#model-name"),
  modelBehavior: document.querySelector("#model-behavior"),
  prediction: document.querySelector("#regularized-prediction"),
  trainingError: document.querySelector("#training-error"),
  unseenError: document.querySelector("#unseen-error"),
  trainingBar: document.querySelector("#training-error-bar"),
  unseenBar: document.querySelector("#unseen-error-bar"),
  balance: document.querySelector("#balance-callout"),
  modelReadout: document.querySelector("#regularized-model-readout"),
  lambdaReadout: document.querySelector("#lambda-readout"),
  activeCount: document.querySelector("#active-feature-count"),
  modelButtons: [...document.querySelectorAll("[data-model]")],
  lambdaButtons: [...document.querySelectorAll("[data-lambda]")],
};

function coefficient(feature) {
  if (state.model === "ridge") return feature.base / (1 + state.lambda * feature.penalty);
  const threshold = state.lambda * 0.055 * feature.penalty;
  return Math.sign(feature.base) * Math.max(Math.abs(feature.base) - threshold, 0);
}

function errors() {
  const scale = Math.log10(1 + state.lambda * 3);
  const training = 7.4 + scale * 3.5 + (state.model === "lasso" ? 0.35 : 0);
  const optimum = state.model === "ridge" ? 0.7 : 0.45;
  const unseen = 11.8 - Math.min(state.lambda, optimum) * 4.2 + Math.max(0, state.lambda - optimum) * 1.15 + (state.model === "lasso" && state.lambda > 3 ? 1.2 : 0);
  return { training, unseen };
}

function modelState(unseen) {
  if (state.lambda === 0) return { title: "No regularization", copy: "The model is free to chase every pattern in the training catalog." };
  if (unseen <= 9.5) return { title: "Best balance", copy: "Some training fit is traded for a cleaner rule on unseen titles." };
  if (state.lambda >= 3) return { title: "Too constrained", copy: "Useful signal is being suppressed along with the noise." };
  return { title: "Moderate regularization", copy: "The model is becoming less sensitive to fragile coefficients." };
}

function renderBoard(values) {
  ui.board.innerHTML = values.map(({ feature, value }) => {
    const height = Math.max(2, (Math.abs(value) / 0.36) * 150);
    const inactive = Math.abs(value) < 0.001;
    return `<article class="coefficient-channel ${inactive ? "is-muted" : ""}">
      <div class="coefficient-value">${value >= 0 ? "+" : ""}${value.toFixed(2)}</div>
      <div class="coefficient-rail"><i class="${value >= 0 ? "positive" : "negative"}" style="height:${height}px"></i><span class="coefficient-zero"></span></div>
      <strong>${feature.name}</strong>
    </article>`;
  }).join("");
}

function render() {
  const values = features.map((feature) => ({ feature, value: coefficient(feature) }));
  const active = values.filter(({ value }) => Math.abs(value) >= 0.001).length;
  const { training, unseen } = errors();
  const completion = Math.round(42 + values.reduce((sum, { feature, value }) => sum + value * feature.contribution, 0));
  const balance = modelState(unseen);
  renderBoard(values);
  ui.modelName.textContent = state.model === "ridge" ? "Ridge Regression" : "Lasso Regression";
  ui.modelBehavior.textContent = state.model === "ridge" ? "All signals stay in the mix." : active < features.length ? `${features.length - active} weak signal${features.length - active === 1 ? "" : "s"} muted.` : "Weak signals are approaching zero.";
  ui.prediction.textContent = `${completion}%`;
  ui.trainingError.textContent = training.toFixed(1);
  ui.unseenError.textContent = unseen.toFixed(1);
  ui.trainingBar.style.width = `${Math.min(100, training * 6.2)}%`;
  ui.unseenBar.style.width = `${Math.min(100, unseen * 6.2)}%`;
  ui.balance.innerHTML = `<span>Model state</span><strong>${balance.title}</strong><p>${balance.copy}</p>`;
  ui.modelReadout.textContent = state.model === "ridge" ? "Ridge" : "Lasso";
  ui.lambdaReadout.textContent = state.lambda;
  ui.activeCount.textContent = `${active} / ${features.length}`;
}

ui.modelButtons.forEach((button) => button.addEventListener("click", () => {
  state.model = button.dataset.model;
  ui.modelButtons.forEach((item) => item.classList.toggle("is-selected", item === button));
  render();
}));
ui.lambdaButtons.forEach((button) => button.addEventListener("click", () => {
  state.lambda = Number(button.dataset.lambda);
  ui.lambdaButtons.forEach((item) => item.classList.toggle("is-selected", item === button));
  render();
}));
render();
