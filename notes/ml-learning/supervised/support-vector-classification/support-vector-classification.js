const svcState = {
  c: 1,
  features: { strength: 74, defect: 28 },
};

const svcPresets = {
  clean: { strength: 74, defect: 28, c: 1 },
  border: { strength: 57, defect: 47, c: 1 },
  noisy: { strength: 42, defect: 62, c: 0.4 },
  curved: { strength: 68, defect: 70, c: 2.4 },
};

const svcPoints = [
  { x: 78, y: 26, label: "Pass", sv: false },
  { x: 70, y: 38, label: "Pass", sv: true },
  { x: 62, y: 34, label: "Pass", sv: true },
  { x: 84, y: 18, label: "Pass", sv: false },
  { x: 54, y: 58, label: "Fail", sv: true },
  { x: 42, y: 68, label: "Fail", sv: false },
  { x: 36, y: 76, label: "Fail", sv: false },
  { x: 48, y: 50, label: "Fail", sv: true },
];

const svcChart = document.querySelector("#svc-chart");
const svcFeatureInputs = Array.from(document.querySelectorAll("[data-svc-feature]"));
const svcPresetButtons = Array.from(document.querySelectorAll("[data-svc-preset]"));
const svcCInput = document.querySelector("#svc-c");

function svcSetText(id, value) {
  const element = document.querySelector(id);
  if (element) element.textContent = value;
}

function svcScore(features = svcState.features) {
  return (features.strength - features.defect - 20) / 18;
}

function drawSvcChart(score) {
  if (!svcChart) return;
  const left = 70;
  const right = 664;
  const top = 42;
  const bottom = 346;
  const xFor = (value) => left + (value / 100) * (right - left);
  const yFor = (value) => bottom - (value / 100) * (bottom - top);
  const boundaryY = (x) => x - 20;
  const margin = 14 + (3 - svcState.c) * 5;

  const line = (offset) => `M${xFor(25)} ${yFor(boundaryY(25) + offset)}L${xFor(94)} ${yFor(boundaryY(94) + offset)}`;
  const points = svcPoints
    .map((point) => {
      const cls = point.label === "Pass" ? "pass" : "fail";
      return `<circle class="svc-point ${cls}${point.sv ? " is-support" : ""}" cx="${xFor(point.x)}" cy="${yFor(point.y)}" r="${point.sv ? 11 : 8}" />`;
    })
    .join("");
  const currentX = xFor(svcState.features.strength);
  const currentY = yFor(svcState.features.defect);

  svcChart.innerHTML = `
    <path class="classifier-axis" d="M${left} ${bottom}H${right}M${left} ${bottom}V${top}" />
    <path class="classifier-gridline" d="M${left} ${yFor(50)}H${right}M${xFor(50)} ${bottom}V${top}" />
    <path class="svc-margin-line" d="${line(margin)}" />
    <path class="svc-boundary-line" d="${line(0)}" />
    <path class="svc-margin-line" d="${line(-margin)}" />
    ${points}
    <circle class="svc-current" cx="${currentX}" cy="${currentY}" r="15" />
    <text class="classifier-axis-label" x="${right}" y="${bottom + 34}">strength test</text>
    <text class="classifier-axis-label" x="${left}" y="${top - 14}">defect signal</text>
    <text class="classifier-chart-label" x="${Math.min(currentX + 18, right - 120)}" y="${Math.max(currentY - 18, top + 20)}">current part</text>
  `;
}

function updateSvcLab() {
  const score = svcScore();
  const decision = score >= 0 ? "Pass" : "Fail";
  const distance = Math.abs(score);
  const supportCount = svcPoints.filter((point) => point.sv).length;

  svcSetText("#svc-decision", decision);
  svcSetText("#svc-score", score.toFixed(2));
  svcSetText("#svc-margin-distance", distance.toFixed(2));
  svcSetText("#svc-vector-count", supportCount);
  svcSetText("#svc-c-readout", svcState.c.toFixed(1));
  svcSetText("#svc-c-label", svcState.c.toFixed(1));
  svcSetText("#svc-strength-value", svcState.features.strength);
  svcSetText("#svc-defect-value", svcState.features.defect);
  if (svcCInput) svcCInput.value = Math.round(svcState.c * 10);
  svcFeatureInputs.forEach((input) => {
    input.value = svcState.features[input.dataset.svcFeature];
  });

  let trustTitle = "Wide margin";
  let trustCopy = "The part is comfortably away from the boundary.";
  if (distance < 0.45) {
    trustTitle = "Margin-sensitive";
    trustCopy = "The class is close to the boundary. Small measurement noise can change the decision.";
  } else if (svcState.c < 0.7) {
    trustTitle = "Soft-margin tolerance";
    trustCopy = "Lower C tolerates violations, which can protect the boundary from one noisy point.";
  } else if (svcState.features.strength > 62 && svcState.features.defect > 62) {
    trustTitle = "Kernel candidate";
    trustCopy = "Both signals are high. If this pattern repeats, a nonlinear kernel may separate it better than one straight boundary.";
  }
  svcSetText("#svc-trust-title", trustTitle);
  svcSetText("#svc-trust-copy", trustCopy);
  drawSvcChart(score);
}

svcFeatureInputs.forEach((input) => {
  input.addEventListener("input", () => {
    svcState.features[input.dataset.svcFeature] = Number(input.value);
    svcPresetButtons.forEach((button) => button.classList.remove("is-selected"));
    updateSvcLab();
  });
});

svcCInput?.addEventListener("input", () => {
  svcState.c = Number(svcCInput.value) / 10;
  updateSvcLab();
});

svcPresetButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const preset = svcPresets[button.dataset.svcPreset];
    if (!preset) return;
    svcState.c = preset.c;
    svcState.features.strength = preset.strength;
    svcState.features.defect = preset.defect;
    svcPresetButtons.forEach((item) => item.classList.toggle("is-selected", item === button));
    updateSvcLab();
  });
});

document.querySelector("#svc-reset")?.addEventListener("click", () => {
  const preset = svcPresets.clean;
  svcState.c = preset.c;
  svcState.features.strength = preset.strength;
  svcState.features.defect = preset.defect;
  svcPresetButtons.forEach((button) => button.classList.toggle("is-selected", button.dataset.svcPreset === "clean"));
  updateSvcLab();
});

svcPresetButtons[0]?.classList.add("is-selected");
updateSvcLab();
