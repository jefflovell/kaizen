const bayesState = {
  priorSpam: 0.35,
  features: {
    prize: 88,
    sender: 18,
    link: 84,
    business: 14,
  },
};

const bayesPresets = {
  prize: { priorSpam: 0.35, prize: 88, sender: 18, link: 84, business: 14 },
  vendor: { priorSpam: 0.35, prize: 8, sender: 88, link: 24, business: 82 },
  correlated: { priorSpam: 0.35, prize: 76, sender: 22, link: 72, business: 64 },
  rare: { priorSpam: 0.35, prize: 34, sender: 28, link: 62, business: 22 },
};

const bayesFeatureInfo = {
  prize: { label: "Prize language", spam: 0.84, ham: 0.08 },
  sender: { label: "Known sender", spam: 0.18, ham: 0.82 },
  link: { label: "Risky link", spam: 0.78, ham: 0.22 },
  business: { label: "Business terms", spam: 0.24, ham: 0.74 },
};

const bayesInputs = Array.from(document.querySelectorAll("[data-bayes-feature]"));
const bayesPresetButtons = Array.from(document.querySelectorAll("[data-bayes-preset]"));
const bayesPriorInput = document.querySelector("#bayes-prior");

function bayesSetText(id, value) {
  const element = document.querySelector(id);
  if (element) element.textContent = value;
}

function mixLikelihood(activeStrength, presentLikelihood, absentLikelihood) {
  const active = activeStrength / 100;
  return active * presentLikelihood + (1 - active) * absentLikelihood;
}

function calculateBayesScores() {
  const priorSpam = bayesState.priorSpam;
  const priorHam = 1 - priorSpam;
  let spamScore = Math.log(priorSpam);
  let hamScore = Math.log(priorHam);
  const evidence = [];

  Object.entries(bayesState.features).forEach(([key, value]) => {
    const info = bayesFeatureInfo[key];
    const spamLikelihood = mixLikelihood(value, info.spam, 1 - info.spam);
    const hamLikelihood = mixLikelihood(value, info.ham, 1 - info.ham);
    const spamContribution = Math.log(spamLikelihood);
    const hamContribution = Math.log(hamLikelihood);
    spamScore += spamContribution;
    hamScore += hamContribution;
    evidence.push({
      key,
      label: info.label,
      value,
      spamContribution,
      hamContribution,
    });
  });

  const maxScore = Math.max(spamScore, hamScore);
  const spamExp = Math.exp(spamScore - maxScore);
  const hamExp = Math.exp(hamScore - maxScore);
  const spamPosterior = spamExp / (spamExp + hamExp);

  return { spamScore, hamScore, spamPosterior, evidence };
}

function updateEvidenceList(evidence) {
  const container = document.querySelector("#bayes-evidence-list");
  if (!container) return;
  container.innerHTML = evidence
    .map((item) => {
      const direction = item.spamContribution > item.hamContribution ? "spam" : "ham";
      const delta = Math.abs(item.spamContribution - item.hamContribution);
      return `<article class="${direction}"><span>${item.label}</span><strong>${direction === "spam" ? "supports spam" : "supports not-spam"}</strong><i><b style="width:${Math.min(100, delta * 42)}%"></b></i></article>`;
    })
    .join("");
}

function updateBayesLab() {
  const result = calculateBayesScores();
  const decision = result.spamPosterior >= 0.5 ? "Spam" : "Not spam";
  const gap = Math.abs(result.spamScore - result.hamScore);
  const spamWidth = Math.max(8, Math.min(100, Math.exp(result.spamScore - Math.max(result.spamScore, result.hamScore)) * 100));
  const hamWidth = Math.max(8, Math.min(100, Math.exp(result.hamScore - Math.max(result.spamScore, result.hamScore)) * 100));

  bayesSetText("#bayes-decision", decision);
  bayesSetText("#bayes-probability", `${Math.round(result.spamPosterior * 100)}%`);
  bayesSetText("#bayes-gap", gap.toFixed(2));
  bayesSetText("#bayes-spam-score", result.spamScore.toFixed(2));
  bayesSetText("#bayes-ham-score", result.hamScore.toFixed(2));
  bayesSetText("#bayes-spam-prior", bayesState.priorSpam.toFixed(2));
  bayesSetText("#bayes-prior-label", bayesState.priorSpam.toFixed(2));
  bayesSetText("#bayes-evidence-count", Object.keys(bayesState.features).length);

  const spamBar = document.querySelector("#bayes-spam-bar");
  const hamBar = document.querySelector("#bayes-ham-bar");
  if (spamBar) spamBar.style.width = `${spamWidth}%`;
  if (hamBar) hamBar.style.width = `${hamWidth}%`;
  if (bayesPriorInput) bayesPriorInput.value = Math.round(bayesState.priorSpam * 100);

  Object.entries(bayesState.features).forEach(([key, value]) => {
    bayesSetText(`#bayes-${key}-value`, value);
    const input = document.querySelector(`[data-bayes-feature="${key}"]`);
    if (input) input.value = value;
  });

  let trustTitle = "Familiar evidence";
  let trustCopy = "The features point in the same direction and are common enough to estimate.";
  if (gap < 0.7) {
    trustTitle = "Close class scores";
    trustCopy = "The class explanations are close. Priors or one feature estimate can change the winner.";
  } else if (bayesState.features.prize > 65 && bayesState.features.link > 65 && bayesState.features.business > 55) {
    trustTitle = "Correlation warning";
    trustCopy = "Several clues may be versions of the same promotional pattern. Naive Bayes may count that evidence too many times.";
  } else if (bayesState.features.link > 55 && bayesState.features.prize < 45 && bayesState.features.sender < 35) {
    trustTitle = "Sparse-history warning";
    trustCopy = "A risky link with unfamiliar language may be a new pattern. Smoothing avoids zero likelihoods, but recent data should grade it.";
  }

  bayesSetText("#bayes-trust-title", trustTitle);
  bayesSetText("#bayes-trust-copy", trustCopy);
  updateEvidenceList(result.evidence);
}

bayesInputs.forEach((input) => {
  input.addEventListener("input", () => {
    bayesState.features[input.dataset.bayesFeature] = Number(input.value);
    bayesPresetButtons.forEach((button) => button.classList.remove("is-selected"));
    updateBayesLab();
  });
});

bayesPriorInput?.addEventListener("input", () => {
  bayesState.priorSpam = Number(bayesPriorInput.value) / 100;
  updateBayesLab();
});

bayesPresetButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const preset = bayesPresets[button.dataset.bayesPreset];
    if (!preset) return;
    bayesState.priorSpam = preset.priorSpam;
    Object.keys(bayesState.features).forEach((key) => {
      bayesState.features[key] = preset[key];
    });
    bayesPresetButtons.forEach((item) => item.classList.toggle("is-selected", item === button));
    updateBayesLab();
  });
});

document.querySelector("#bayes-reset")?.addEventListener("click", () => {
  const preset = bayesPresets.prize;
  bayesState.priorSpam = preset.priorSpam;
  Object.keys(bayesState.features).forEach((key) => {
    bayesState.features[key] = preset[key];
  });
  bayesPresetButtons.forEach((button) => button.classList.toggle("is-selected", button.dataset.bayesPreset === "prize"));
  updateBayesLab();
});

bayesPresetButtons[0]?.classList.add("is-selected");
updateBayesLab();
