const scenarios = {
  hot: { title: "Hot weekday", center: 38, truth: 37, spread: 12, features: ["temperature", "occupancy", "solar", "hour"] },
  mild: { title: "Mild weekend", center: 21, truth: 22, spread: 7, features: ["occupancy", "temperature", "appliances", "hour"] },
  storm: { title: "Storm evening", center: 31, truth: 34, spread: 16, features: ["weather", "solar", "temperature", "occupancy"] },
};
const trainingHomes = ["Apartment", "Solar ranch", "Older house", "Efficient condo", "Large home", "Townhouse", "Pool home", "Duplex", "Loft", "Bungalow", "Farmhouse", "New build", "Shaded home", "Corner unit"];
const state = { count: 7, scenario: "hot", seed: 0, diversity: 0.7, adjustments: {}, selectedTree: 0 };
const ui = {
  votes: document.querySelector("#tree-votes"), prediction: document.querySelector("#forest-prediction"),
  range: document.querySelector("#forest-range"), marker: document.querySelector("#forest-marker"),
  spread: document.querySelector("#forest-spread"), singleError: document.querySelector("#single-error"),
  forestError: document.querySelector("#forest-error"), title: document.querySelector("#forest-scenario-title"),
  truth: document.querySelector("#forest-truth"),
  stateTitle: document.querySelector("#forest-state-title"), stateCopy: document.querySelector("#forest-state-copy"),
  count: document.querySelector("#tree-count"), countOutput: document.querySelector("#tree-count-output"),
  diversity: document.querySelector("#forest-diversity"), diversityOutput: document.querySelector("#forest-diversity-output"),
  resample: document.querySelector("#forest-resample"), reset: document.querySelector("#forest-reset"),
  inspectorTitle: document.querySelector("#forest-inspector-title"), inspectorSample: document.querySelector("#forest-inspector-sample"),
  inspectorFeatures: document.querySelector("#forest-inspector-features"),
};

function seededNoise(index, scenario) {
  const seed = Math.sin((index + 1) * 91.17 + scenario.center * 3.1 + state.seed * 27.31) * 43758.5453;
  const independent = ((seed - Math.floor(seed)) * 2 - 1) * scenario.spread;
  const shared = Math.sin(scenario.center + state.seed * 1.7) * scenario.spread * 0.62;
  return independent * state.diversity + shared * (1 - state.diversity);
}

function treeDetails(index, scenario) {
  const sample = Array.from({ length: 14 }, (_, draw) => {
    const seed = Math.abs(Math.sin((index + 2) * 18.73 + scenario.truth + state.seed * 4.9 + draw * 12.41));
    return Math.floor((seed * 10000) % trainingHomes.length);
  });
  const counts = sample.reduce((map, homeIndex) => ({ ...map, [homeIndex]: (map[homeIndex] || 0) + 1 }), {});
  const uniqueHomes = Object.keys(counts).length;
  const repeated = Object.entries(counts).filter(([, count]) => count > 1).map(([homeIndex, count]) => `${trainingHomes[homeIndex]} ×${count}`);
  const omitted = trainingHomes.filter((_, homeIndex) => !counts[homeIndex]);
  const featureOffset = state.diversity < 0.35 ? 0 : (index + state.seed) % scenario.features.length;
  const firstFeature = scenario.features[featureOffset];
  const secondFeature = state.diversity < 0.35
    ? scenario.features[0]
    : scenario.features[(featureOffset + 2) % scenario.features.length];
  return { uniqueHomes, firstFeature, secondFeature, repeated, omitted };
}

function render() {
  const scenario = scenarios[state.scenario];
  const values = Array.from({ length: state.count }, (_, index) =>
    scenario.center + seededNoise(index, scenario) + (state.adjustments[index] || 0));
  const average = values.reduce((sum, value) => sum + value, 0) / values.length;
  const averageTreeError = values.reduce((sum, value) => sum + Math.abs(value - scenario.truth), 0) / values.length;
  const min = Math.min(...values); const max = Math.max(...values);
  ui.votes.innerHTML = values.map((value, index) => {
    const details = treeDetails(index, scenario);
    return `<article data-tree="${index}" class="${index === state.selectedTree ? "is-selected" : ""}">
      <span>Tree ${index + 1}</span>
      <strong>${value.toFixed(1)} kWh</strong>
      <small>${details.uniqueHomes}/14 unique homes</small>
      <small>first split: ${details.firstFeature} or ${details.secondFeature}</small>
      <input type="range" min="-12" max="12" step="1" value="${state.adjustments[index] || 0}" data-tree-vote="${index}" aria-label="Adjust Tree ${index + 1} prediction" />
      <button type="button" data-inspect-tree="${index}">Inspect sample</button>
    </article>`;
  }).join("");
  ui.prediction.textContent = `${average.toFixed(1)} kWh`;
  ui.spread.textContent = `${(max - min).toFixed(1)} kWh`;
  ui.truth.textContent = `${scenario.truth.toFixed(1)} kWh`;
  ui.singleError.textContent = `${averageTreeError.toFixed(1)} kWh`;
  ui.forestError.textContent = `${Math.abs(average - scenario.truth).toFixed(1)} kWh`;
  ui.title.textContent = scenario.title;
  ui.countOutput.textContent = `${state.count} ${state.count === 1 ? "tree" : "trees"}`;
  ui.diversityOutput.textContent = state.diversity < 0.35 ? "Low diversity" : state.diversity < 0.7 ? "Medium diversity" : "High diversity";
  const position = (value) => Math.max(0, Math.min(100, (value / 55) * 100));
  ui.range.style.left = `${position(min)}%`; ui.range.style.width = `${Math.max(0, position(max) - position(min))}%`;
  ui.marker.style.left = `${position(average)}%`;
  const selectedDetails = treeDetails(Math.min(state.selectedTree, state.count - 1), scenario);
  ui.inspectorTitle.textContent = `Tree ${Math.min(state.selectedTree, state.count - 1) + 1}`;
  ui.inspectorSample.textContent = `Repeated: ${selectedDetails.repeated.join(", ") || "none"}. Omitted: ${selectedDetails.omitted.join(", ") || "none"}.`;
  ui.inspectorFeatures.textContent = `Candidate features: ${selectedDetails.firstFeature} and ${selectedDetails.secondFeature}.`;
  if (state.count === 1) {
    ui.stateTitle.textContent = "One opinion";
    ui.stateCopy.textContent = "This is a decision tree, not yet a forest. Its quirks pass directly into the forecast.";
  } else if (state.count < 9) {
    ui.stateTitle.textContent = "Small committee";
    ui.stateCopy.textContent = "A few trees soften individual mistakes, but one unusual vote can still move the average.";
  } else {
    ui.stateTitle.textContent = "Stable chorus";
    ui.stateCopy.textContent = "Many varied trees make the average less sensitive to any single tree.";
  }
}

ui.count.addEventListener("input", () => {
  state.count = Number(ui.count.value);
  state.selectedTree = Math.min(state.selectedTree, state.count - 1);
  render();
});
ui.diversity.addEventListener("input", () => { state.diversity = Number(ui.diversity.value) / 100; state.adjustments = {}; render(); });
ui.votes.addEventListener("change", (event) => {
  const slider = event.target.closest("[data-tree-vote]");
  if (!slider) return;
  state.adjustments[Number(slider.dataset.treeVote)] = Number(slider.value);
  render();
});
ui.votes.addEventListener("click", (event) => {
  const button = event.target.closest("[data-inspect-tree]");
  if (!button) return;
  state.selectedTree = Number(button.dataset.inspectTree);
  render();
});
ui.resample.addEventListener("click", () => { state.seed += 1; state.adjustments = {}; render(); });
ui.reset.addEventListener("click", () => {
  state.count = 7; state.scenario = "hot"; state.seed = 0; state.diversity = 0.7; state.adjustments = {}; state.selectedTree = 0;
  ui.count.value = 7; ui.diversity.value = 70;
  document.querySelectorAll("[data-scenario]").forEach((item) => item.classList.toggle("is-selected", item.dataset.scenario === "hot"));
  render();
});
document.querySelectorAll("[data-scenario]").forEach((button) => button.addEventListener("click", () => {
  state.scenario = button.dataset.scenario;
  document.querySelectorAll("[data-scenario]").forEach((item) => item.classList.toggle("is-selected", item === button));
  render();
}));
render();
