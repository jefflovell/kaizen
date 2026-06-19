const canvas = document.querySelector("#tree-regression-canvas");
const ctx = canvas.getContext("2d");

const ui = {
  diagram: document.querySelector("#tree-diagram"),
  depth: document.querySelector("#tree-depth"),
  leaves: document.querySelector("#leaf-count"),
  error: document.querySelector("#tree-error"),
  grow: document.querySelector("#grow-split"),
  fit: document.querySelector("#fit-tree"),
  reset: document.querySelector("#reset-tree"),
  depthButtons: [...document.querySelectorAll("[data-depth]")],
};

const points = [
  { performance: 45, price: 95 },
  { performance: 50, price: 120 },
  { performance: 58, price: 150 },
  { performance: 64, price: 175 },
  { performance: 68, price: 205 },
  { performance: 72, price: 220 },
  { performance: 78, price: 235 },
  { performance: 84, price: 260 },
  { performance: 91, price: 285 },
  { performance: 96, price: 315 },
  { performance: 101, price: 330 },
  { performance: 108, price: 345 },
  { performance: 113, price: 375 },
  { performance: 118, price: 390 },
  { performance: 124, price: 425 },
  { performance: 132, price: 470 },
  { performance: 139, price: 485 },
  { performance: 145, price: 525 },
  { performance: 151, price: 560 },
  { performance: 157, price: 610 },
  { performance: 164, price: 650 },
  { performance: 170, price: 625 },
  { performance: 178, price: 710 },
  { performance: 184, price: 745 },
  { performance: 196, price: 830 },
  { performance: 203, price: 910 },
  { performance: 210, price: 1090 },
  { performance: 218, price: 1375 },
];

const chart = {
  left: 72,
  right: 28,
  top: 28,
  bottom: 62,
  minX: 40,
  maxX: 220,
  minY: 0,
  maxY: 1500,
};

const state = {
  maxDepth: 1,
  splitBudget: 0,
  tree: null,
};

function mean(rows) {
  return rows.reduce((sum, row) => sum + row.price, 0) / rows.length;
}

function squaredError(rows) {
  const prediction = mean(rows);
  return rows.reduce((sum, row) => sum + (row.price - prediction) ** 2, 0);
}

function bestSplit(rows) {
  if (rows.length < 2) return null;
  const sorted = [...rows].sort((a, b) => a.performance - b.performance);
  let winner = null;

  for (let index = 1; index < sorted.length; index += 1) {
    const threshold = (sorted[index - 1].performance + sorted[index].performance) / 2;
    const left = sorted.filter((row) => row.performance < threshold);
    const right = sorted.filter((row) => row.performance >= threshold);
    const error = squaredError(left) + squaredError(right);
    if (!winner || error < winner.error) winner = { threshold, left, right, error };
  }

  return winner;
}

function buildNode(rows, depth, budget) {
  const node = {
    rows,
    depth,
    prediction: mean(rows),
    min: Math.min(...rows.map((row) => row.performance)),
    max: Math.max(...rows.map((row) => row.performance)),
    left: null,
    right: null,
    threshold: null,
  };

  if (depth >= state.maxDepth || budget.remaining <= 0 || rows.length < 2) return node;
  const split = bestSplit(rows);
  if (!split) return node;
  budget.remaining -= 1;
  node.threshold = split.threshold;
  node.left = buildNode(split.left, depth + 1, budget);
  node.right = buildNode(split.right, depth + 1, budget);
  return node;
}

function rebuild() {
  state.tree = buildNode(points, 0, { remaining: state.splitBudget });
  update();
}

function collectLeaves(node, output = []) {
  if (!node.left || !node.right) {
    output.push(node);
    return output;
  }
  collectLeaves(node.left, output);
  collectLeaves(node.right, output);
  return output;
}

function collectSplits(node, output = []) {
  if (!node.left || !node.right) return output;
  output.push(node);
  collectSplits(node.left, output);
  collectSplits(node.right, output);
  return output;
}

function collectRegions(node, min = chart.minX, max = chart.maxX, output = []) {
  if (!node.left || !node.right) {
    output.push({ node, min, max });
    return output;
  }
  collectRegions(node.left, min, node.threshold, output);
  collectRegions(node.right, node.threshold, max, output);
  return output;
}

function treeDepth(node) {
  if (!node.left || !node.right) return node.depth;
  return Math.max(treeDepth(node.left), treeDepth(node.right));
}

function predict(performance, node = state.tree) {
  if (!node.left || !node.right) return node.prediction;
  return performance < node.threshold
    ? predict(performance, node.left)
    : predict(performance, node.right);
}

function meanAbsoluteError() {
  return (
    points.reduce((sum, point) => sum + Math.abs(point.price - predict(point.performance)), 0) /
    points.length
  );
}

function plotWidth() {
  return canvas.width - chart.left - chart.right;
}

function plotHeight() {
  return canvas.height - chart.top - chart.bottom;
}

function toCanvas(performance, price) {
  return [
    chart.left + ((performance - chart.minX) / (chart.maxX - chart.minX)) * plotWidth(),
    chart.top + (1 - (price - chart.minY) / (chart.maxY - chart.minY)) * plotHeight(),
  ];
}

function drawGrid() {
  ctx.fillStyle = "#07101f";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.font = "500 13px DM Sans, sans-serif";
  ctx.textBaseline = "middle";

  [0, 300, 600, 900, 1200, 1500].forEach((price) => {
    const [, y] = toCanvas(chart.minX, price);
    ctx.strokeStyle = "rgba(75, 243, 255, 0.1)";
    ctx.beginPath();
    ctx.moveTo(chart.left, y);
    ctx.lineTo(canvas.width - chart.right, y);
    ctx.stroke();
    ctx.fillStyle = "rgba(247, 246, 241, 0.66)";
    ctx.textAlign = "right";
    ctx.fillText(`$${price}`, chart.left - 12, y);
  });

  [40, 80, 120, 160, 200, 220].forEach((performance) => {
    const [x] = toCanvas(performance, 0);
    ctx.strokeStyle = "rgba(75, 243, 255, 0.08)";
    ctx.beginPath();
    ctx.moveTo(x, chart.top);
    ctx.lineTo(x, canvas.height - chart.bottom);
    ctx.stroke();
    ctx.fillStyle = "rgba(247, 246, 241, 0.66)";
    ctx.textAlign = "center";
    ctx.fillText(performance, x, canvas.height - chart.bottom + 22);
  });

  ctx.fillStyle = "#f7f6f1";
  ctx.textAlign = "center";
  ctx.fillText(
    "Relative gaming performance (reference = 100)",
    chart.left + plotWidth() / 2,
    canvas.height - 18,
  );
  ctx.save();
  ctx.translate(18, chart.top + plotHeight() / 2);
  ctx.rotate(-Math.PI / 2);
  ctx.fillText("Used price", 0, 0);
  ctx.restore();
}

function drawPredictions() {
  collectRegions(state.tree).forEach((region) => {
    const [x1, y] = toCanvas(region.min, region.node.prediction);
    const [x2] = toCanvas(region.max, region.node.prediction);
    ctx.strokeStyle = "#f7f6f1";
    ctx.lineWidth = 4;
    ctx.shadowBlur = 14;
    ctx.shadowColor = "rgba(75, 243, 255, 0.58)";
    ctx.beginPath();
    ctx.moveTo(x1, y);
    ctx.lineTo(x2, y);
    ctx.stroke();
    ctx.shadowBlur = 0;
  });

  collectSplits(state.tree).forEach((node) => {
    const [x] = toCanvas(node.threshold, 0);
    ctx.strokeStyle = "#4bf3ff";
    ctx.lineWidth = 2;
    ctx.setLineDash([7, 7]);
    ctx.beginPath();
    ctx.moveTo(x, chart.top);
    ctx.lineTo(x, canvas.height - chart.bottom);
    ctx.stroke();
    ctx.setLineDash([]);
  });
}

function drawPoints() {
  points.forEach((point) => {
    const [x, y] = toCanvas(point.performance, point.price);
    const [, predictionY] = toCanvas(point.performance, predict(point.performance));
    ctx.strokeStyle = "rgba(255, 117, 95, 0.55)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x, predictionY);
    ctx.stroke();
    ctx.fillStyle = "#ff755f";
    ctx.shadowBlur = 11;
    ctx.shadowColor = "rgba(255, 117, 95, 0.7)";
    ctx.beginPath();
    ctx.arc(x, y, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  });
}

function renderChart() {
  drawGrid();
  drawPredictions();
  drawPoints();
}

function nodeMarkup(node) {
  if (!node.left || !node.right) {
    return `<div class="tree-node leaf-node"><span>predict</span><strong>$${Math.round(
      node.prediction,
    )}</strong><small>${node.rows.length} GPU${node.rows.length === 1 ? "" : "s"}</small></div>`;
  }

  const leafCount = collectLeaves(node).length;
  return `<div class="tree-branch" style="width:${Math.max(104, leafCount * 112)}px">
    <div class="tree-node split-node"><span>question</span><strong>performance &lt; ${Math.round(
      node.threshold,
    )}?</strong></div>
    <div class="tree-children">
      <div><span class="branch-label">yes</span>${nodeMarkup(node.left)}</div>
      <div><span class="branch-label">no</span>${nodeMarkup(node.right)}</div>
    </div>
  </div>`;
}

function renderDiagram() {
  ui.diagram.style.minWidth = `${Math.max(360, collectLeaves(state.tree).length * 112)}px`;
  ui.diagram.innerHTML = nodeMarkup(state.tree);
}

function update() {
  ui.depth.textContent = treeDepth(state.tree);
  ui.leaves.textContent = collectLeaves(state.tree).length;
  ui.error.textContent = `$${Math.round(meanAbsoluteError())}`;
  renderChart();
  renderDiagram();
}

function maxSplitsForDepth(depth) {
  return 2 ** depth - 1;
}

ui.grow.addEventListener("click", () => {
  state.splitBudget = Math.min(state.splitBudget + 1, maxSplitsForDepth(state.maxDepth));
  rebuild();
});

ui.fit.addEventListener("click", () => {
  state.splitBudget = maxSplitsForDepth(state.maxDepth);
  rebuild();
});

ui.reset.addEventListener("click", () => {
  state.splitBudget = 0;
  rebuild();
});

ui.depthButtons.forEach((button) => {
  button.addEventListener("click", () => {
    state.maxDepth = Number(button.dataset.depth);
    state.splitBudget = Math.min(state.splitBudget, maxSplitsForDepth(state.maxDepth));
    ui.depthButtons.forEach((item) => item.classList.toggle("is-selected", item === button));
    rebuild();
  });
});

rebuild();
