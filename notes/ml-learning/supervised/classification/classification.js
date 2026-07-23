const canvas = document.querySelector("#classifier-canvas");
const ctx = canvas.getContext("2d");

const ui = {
  epoch: document.querySelector("#epoch-count"),
  mistakes: document.querySelector("#mistake-count"),
  accuracy: document.querySelector("#accuracy-count"),
  tracePoint: document.querySelector("#trace-point"),
  traceScore: document.querySelector("#trace-score"),
  traceGuess: document.querySelector("#trace-guess"),
  traceUpdate: document.querySelector("#trace-update"),
  step: document.querySelector("#step-training"),
  train: document.querySelector("#train-epoch"),
  reset: document.querySelector("#reset-data"),
  classToggles: [...document.querySelectorAll(".class-toggle")],
};

const state = {
  points: [],
  selectedClass: 1,
  weights: { x: 0.45, y: 0, bias: 0 },
  learningRate: 0.18,
  cursor: 0,
  epoch: 0,
  activeIndex: 0,
  lastStep: null,
};

function seedPoints() {
  state.points = [
    [-0.72, -0.44, -1],
    [-0.6, -0.2, -1],
    [-0.48, -0.56, -1],
    [-0.32, -0.34, -1],
    [-0.22, -0.64, -1],
    [0.18, 0.52, 1],
    [0.34, 0.28, 1],
    [0.48, 0.62, 1],
    [0.64, 0.36, 1],
    [0.72, 0.14, 1],
    [-0.28, 0.42, 1],
    [0.3, -0.28, -1],
  ];
  state.weights = { x: 0.45, y: 0, bias: 0 };
  state.cursor = 0;
  state.activeIndex = 0;
  state.epoch = 0;
  state.lastStep = null;
  update();
}

function toCanvas(point) {
  const [x, y] = point;
  return [
    ((x + 1) / 2) * canvas.width,
    ((1 - y) / 2) * canvas.height,
  ];
}

function fromCanvas(x, y) {
  return [
    (x / canvas.clientWidth) * 2 - 1,
    1 - (y / canvas.clientHeight) * 2,
  ];
}

function predict([x, y]) {
  const score = scorePoint([x, y]);
  return score >= 0 ? 1 : -1;
}

function scorePoint([x, y]) {
  return state.weights.x * x + state.weights.y * y + state.weights.bias;
}

function signedDistance(rawScore, weights = state.weights) {
  const magnitude = Math.hypot(weights.x, weights.y);
  return magnitude ? rawScore / magnitude : 0;
}

function trainOne() {
  if (!state.points.length) return;

  const activeIndex = state.cursor;
  const point = state.points[activeIndex];
  const [x, y, label] = point;
  const score = scorePoint(point);
  const guess = score >= 0 ? 1 : -1;
  const before = { ...state.weights };
  let adjusted = false;

  if (guess !== label) {
    state.weights.x += state.learningRate * label * x;
    state.weights.y += state.learningRate * label * y;
    state.weights.bias += state.learningRate * label;
    adjusted = true;
  }

  state.activeIndex = activeIndex;
  state.lastStep = { point, score, guess, label, adjusted, before, after: { ...state.weights } };
  state.cursor = (state.cursor + 1) % state.points.length;
  if (state.cursor === 0) state.epoch += 1;
  update();
}

function trainEpoch() {
  const count = state.points.length;
  for (let index = 0; index < count; index += 1) {
    trainOne();
  }
}

function metrics() {
  const mistakes = state.points.filter((point) => predict(point) !== point[2]).length;
  const accuracy = state.points.length
    ? Math.round(((state.points.length - mistakes) / state.points.length) * 100)
    : 0;
  return { mistakes, accuracy };
}

function drawGrid() {
  ctx.fillStyle = "#07101f";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const cellSize = 24;
  for (let x = 0; x < canvas.width; x += cellSize) {
    for (let y = 0; y < canvas.height; y += cellSize) {
      const featureX = ((x + cellSize / 2) / canvas.width) * 2 - 1;
      const featureY = 1 - ((y + cellSize / 2) / canvas.height) * 2;
      ctx.fillStyle =
        predict([featureX, featureY]) === 1
          ? "rgba(75, 243, 255, 0.075)"
          : "rgba(255, 117, 95, 0.075)";
      ctx.fillRect(x, y, cellSize, cellSize);
    }
  }

  ctx.strokeStyle = "rgba(75, 243, 255, 0.09)";
  ctx.lineWidth = 1;
  for (let x = 0; x <= canvas.width; x += 40) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvas.height);
    ctx.stroke();
  }
  for (let y = 0; y <= canvas.height; y += 40) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
    ctx.stroke();
  }
}

function drawBoundary() {
  const { x: wx, y: wy, bias } = state.weights;
  const intersections = [];
  const addIntersection = (point) => {
    if (
      point.every((value) => value >= -1.001 && value <= 1.001) &&
      !intersections.some(
        (existing) =>
          Math.abs(existing[0] - point[0]) < 0.001 &&
          Math.abs(existing[1] - point[1]) < 0.001,
      )
    ) {
      intersections.push(point);
    }
  };

  if (Math.abs(wy) > 0.001) {
    addIntersection([-1, -(wx * -1 + bias) / wy]);
    addIntersection([1, -(wx * 1 + bias) / wy]);
  }
  if (Math.abs(wx) > 0.001) {
    addIntersection([-(wy * -1 + bias) / wx, -1]);
    addIntersection([-(wy * 1 + bias) / wx, 1]);
  }
  if (intersections.length < 2) return;

  const [x1, y1] = toCanvas(intersections[0]);
  const [x2, y2] = toCanvas(intersections[1]);

  ctx.strokeStyle = "#f7f6f1";
  ctx.lineWidth = 3;
  ctx.shadowBlur = 18;
  ctx.shadowColor = "rgba(75, 243, 255, 0.62)";
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
  ctx.shadowBlur = 0;
}

function drawPoints() {
  state.points.forEach((point, index) => {
    const [x, y] = toCanvas(point);
    const label = point[2];
    const isCurrent = index === state.activeIndex;

    ctx.fillStyle = label === 1 ? "#4bf3ff" : "#ff755f";
    ctx.shadowBlur = isCurrent ? 20 : 10;
    ctx.shadowColor = label === 1 ? "rgba(75, 243, 255, 0.7)" : "rgba(255, 117, 95, 0.7)";
    ctx.beginPath();
    ctx.arc(x, y, isCurrent ? 9 : 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    if (predict(point) !== label) {
      ctx.strokeStyle = "#f7f6f1";
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  });
}

function render() {
  drawGrid();
  drawBoundary();
  drawPoints();
}

function update() {
  const { mistakes, accuracy } = metrics();
  ui.epoch.textContent = state.epoch;
  ui.mistakes.textContent = mistakes;
  ui.accuracy.textContent = `${accuracy}%`;
  updateTrace();
  render();
}

function formatClass(label) {
  return label === 1 ? "cyan" : "coral";
}

function updateTrace() {
  const step = state.lastStep;
  const point = step?.point ?? state.points[state.activeIndex] ?? [0, 0, 1];
  const score = step?.score ?? scorePoint(point);
  const guess = step?.guess ?? (score >= 0 ? 1 : -1);
  const label = step?.label ?? point[2];
  const distance = step ? signedDistance(step.score, step.before) : signedDistance(score);

  ui.tracePoint.textContent = `x-axis = ${point[0].toFixed(2)} | y-axis = ${point[1].toFixed(2)}`;
  ui.traceScore.textContent = distance.toFixed(2);
  ui.traceGuess.textContent = `${formatClass(guess)} (${formatClass(label)})`;

  if (!step) {
    ui.traceUpdate.textContent = "Press Step to evaluate the first point.";
    return;
  }

  ui.traceUpdate.textContent = step.adjusted
    ? `Wrong guess. Boundary nudged toward ${formatClass(label)}.`
    : "Correct guess. No boundary change.";
}

ui.step.addEventListener("click", trainOne);
ui.train.addEventListener("click", trainEpoch);
ui.reset.addEventListener("click", seedPoints);

ui.classToggles.forEach((button) => {
  button.addEventListener("click", () => {
    state.selectedClass = Number(button.dataset.class);
    ui.classToggles.forEach((item) => item.classList.toggle("is-selected", item === button));
  });
});

canvas.addEventListener("click", (event) => {
  const rect = canvas.getBoundingClientRect();
  const [x, y] = fromCanvas(event.clientX - rect.left, event.clientY - rect.top);
  state.points.push([x, y, state.selectedClass]);
  update();
});

seedPoints();
