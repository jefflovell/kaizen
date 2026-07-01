const logisticState = {
  threshold: 0.5,
  features: {
    flagged: 84,
    sender: 72,
    link: 88,
    reports: 66,
  },
};

const logisticWeights = {
  bias: -4.25,
  flagged: 2.2,
  sender: 1.35,
  link: 2.05,
  reports: 1.65,
};

const logisticPresets = {
  highRisk: { flagged: 84, sender: 72, link: 88, reports: 66, threshold: 0.5 },
  borderline: { flagged: 48, sender: 51, link: 57, reports: 36, threshold: 0.5 },
  routine: { flagged: 10, sender: 18, link: 12, reports: 8, threshold: 0.5 },
  novel: { flagged: 24, sender: 62, link: 78, reports: 14, threshold: 0.62 },
};

const logisticFeatureInputs = Array.from(document.querySelectorAll("[data-logistic-feature]"));
const logisticPresetButtons = Array.from(document.querySelectorAll("[data-logistic-preset]"));
const logisticThresholdInput = document.querySelector("#logistic-threshold");
const logisticChart = document.querySelector("#logistic-chart");

function sigmoid(value) {
  return 1 / (1 + Math.exp(-value));
}

function featureScale(value) {
  return Number(value) / 100;
}

function calculateScore() {
  return (
    logisticWeights.bias +
    logisticWeights.flagged * featureScale(logisticState.features.flagged) +
    logisticWeights.sender * featureScale(logisticState.features.sender) +
    logisticWeights.link * featureScale(logisticState.features.link) +
    logisticWeights.reports * featureScale(logisticState.features.reports)
  );
}

function setText(id, value) {
  const element = document.querySelector(id);
  if (element) element.textContent = value;
}

function drawLogisticChart(score, probability) {
  if (!logisticChart) return;

  const width = 720;
  const height = 430;
  const left = 64;
  const right = 670;
  const top = 42;
  const bottom = 344;
  const scoreMin = -6;
  const scoreMax = 6;

  const xForScore = (value) => left + ((value - scoreMin) / (scoreMax - scoreMin)) * (right - left);
  const yForProbability = (value) => bottom - value * (bottom - top);
  const probabilityForThreshold = Math.log(logisticState.threshold / (1 - logisticState.threshold));
  const currentX = xForScore(Math.max(scoreMin, Math.min(scoreMax, score)));
  const currentY = yForProbability(probability);
  const thresholdX = xForScore(Math.max(scoreMin, Math.min(scoreMax, probabilityForThreshold)));

  const curve = [];
  for (let i = 0; i <= 120; i += 1) {
    const raw = scoreMin + (i / 120) * (scoreMax - scoreMin);
    const command = i === 0 ? "M" : "L";
    curve.push(`${command}${xForScore(raw).toFixed(1)} ${yForProbability(sigmoid(raw)).toFixed(1)}`);
  }

  logisticChart.innerHTML = `
    <path class="classifier-axis" d="M${left} ${bottom}H${right}M${left} ${bottom}V${top}" />
    <path class="classifier-gridline" d="M${left} ${yForProbability(0.5)}H${right}" />
    <path class="classifier-gridline" d="M${xForScore(0)} ${bottom}V${top}" />
    <path class="logistic-curve" d="${curve.join(" ")}" />
    <path class="logistic-threshold-line" d="M${thresholdX} ${bottom}V${top}" />
    <path class="logistic-score-line" d="M${currentX} ${bottom}V${currentY}" />
    <circle class="logistic-point" cx="${currentX}" cy="${currentY}" r="12" />
    <text class="classifier-axis-label" x="${right}" y="${bottom + 34}">linear score z</text>
    <text class="classifier-axis-label" x="${left}" y="${top - 14}">probability p</text>
    <text class="classifier-chart-label" x="${Math.min(currentX + 16, right - 170)}" y="${Math.max(currentY - 18, top + 18)}">p = ${Math.round(probability * 100)}%</text>
    <text class="classifier-chart-label threshold" x="${Math.min(thresholdX + 10, right - 150)}" y="${bottom - 16}">threshold t</text>
    <text class="classifier-tick" x="${left}" y="${bottom + 22}">-6</text>
    <text class="classifier-tick" x="${xForScore(0)}" y="${bottom + 22}">0</text>
    <text class="classifier-tick" x="${right}" y="${bottom + 22}">6</text>
    <text class="classifier-tick" x="${left - 12}" y="${bottom + 4}">0</text>
    <text class="classifier-tick" x="${left - 20}" y="${yForProbability(0.5) + 4}">0.5</text>
    <text class="classifier-tick" x="${left - 12}" y="${top + 4}">1</text>
  `;
}

function updateLogisticLab() {
  const score = calculateScore();
  const probability = sigmoid(score);
  const decision = probability >= logisticState.threshold ? "Review" : "No review";
  const margin = probability - logisticState.threshold;
  const distance = Math.abs(margin);

  setText("#logistic-decision", decision);
  setText("#logistic-probability", `${Math.round(probability * 100)}%`);
  setText("#logistic-score", score.toFixed(2));
  setText("#logistic-threshold-readout", logisticState.threshold.toFixed(2));
  setText("#logistic-threshold-label", logisticState.threshold.toFixed(2));
  setText("#logistic-margin", `${margin >= 0 ? "+" : ""}${margin.toFixed(2)}`);

  Object.entries(logisticState.features).forEach(([key, value]) => {
    setText(`#logistic-${key}-value`, value);
    const input = document.querySelector(`[data-logistic-feature="${key}"]`);
    if (input) input.value = value;
  });

  if (logisticThresholdInput) logisticThresholdInput.value = Math.round(logisticState.threshold * 100);

  let trustTitle = "Clear probability";
  let trustCopy = "The probability is far from the threshold. The class is stable if this case resembles held-out examples.";
  if (distance < 0.08) {
    trustTitle = "Threshold-sensitive";
    trustCopy = "The probability is close to the cutoff. A small feature change or a different review threshold can flip the action.";
  } else if (probability > 0.9 || probability < 0.1) {
    trustTitle = "Confident, but check calibration";
    trustCopy = "The model is far from the threshold. Trust the number only if similar held-out examples were predicted at matching frequencies.";
  } else if (logisticState.features.link > 70 && logisticState.features.reports < 20) {
    trustTitle = "Novel-pattern warning";
    trustCopy = "Link risk is high but user reports are low. This may be a new pattern, so recent held-out traffic matters more than the clean probability.";
  }

  setText("#logistic-trust-title", trustTitle);
  setText("#logistic-trust-copy", trustCopy);
  drawLogisticChart(score, probability);
}

logisticFeatureInputs.forEach((input) => {
  input.addEventListener("input", () => {
    logisticState.features[input.dataset.logisticFeature] = Number(input.value);
    logisticPresetButtons.forEach((button) => button.classList.remove("is-selected"));
    updateLogisticLab();
  });
});

if (logisticThresholdInput) {
  logisticThresholdInput.addEventListener("input", () => {
    logisticState.threshold = Number(logisticThresholdInput.value) / 100;
    updateLogisticLab();
  });
}

logisticPresetButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const preset = logisticPresets[button.dataset.logisticPreset];
    if (!preset) return;
    logisticState.threshold = preset.threshold;
    Object.assign(logisticState.features, preset);
    delete logisticState.features.threshold;
    logisticPresetButtons.forEach((item) => item.classList.toggle("is-selected", item === button));
    updateLogisticLab();
  });
});

document.querySelector("#logistic-reset")?.addEventListener("click", () => {
  const preset = logisticPresets.highRisk;
  logisticState.threshold = preset.threshold;
  Object.assign(logisticState.features, preset);
  delete logisticState.features.threshold;
  logisticPresetButtons.forEach((button) => button.classList.toggle("is-selected", button.dataset.logisticPreset === "highRisk"));
  updateLogisticLab();
});

logisticPresetButtons[0]?.classList.add("is-selected");
updateLogisticLab();
