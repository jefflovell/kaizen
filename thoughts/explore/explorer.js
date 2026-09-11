const GRAPH_URL = "../../data/thoughts/graph.json";
const SVG_NS = "http://www.w3.org/2000/svg";
const DEFAULT_STATE = {
  start: "odysseus-ajax",
  dimension: "adaptation",
  minutes: 15,
  view: "map",
};

const elements = {
  start: document.querySelector("#start-node"),
  dimension: document.querySelector("#dimension"),
  find: document.querySelector("#find-path"),
  surprise: document.querySelector("#surprise-me"),
  reset: document.querySelector("#reset-map"),
  copy: document.querySelector("#copy-route"),
  status: document.querySelector("#explorer-status"),
  routeTitle: document.querySelector("#route-title"),
  routeQuestion: document.querySelector("#route-question"),
  routeList: document.querySelector("#route-list"),
  routeSummary: document.querySelector("#route-summary"),
  graphMap: document.querySelector("#graph-map"),
  graphList: document.querySelector("#graph-list"),
  graphEdges: document.querySelector("#graph-edges"),
  graphNodes: document.querySelector("#graph-nodes"),
  viewButtons: [...document.querySelectorAll("[data-view]")],
};

let graph;
let nodesById;
let adjacency;
let activeRoute = [];
let activeEdges = [];
let surpriseCount = 0;

function option(value, label) {
  const item = document.createElement("option");
  item.value = value;
  item.textContent = label;
  return item;
}

function readState() {
  const params = new URLSearchParams(window.location.search);
  const minutes = Number(params.get("minutes"));
  return {
    start: nodesById.has(params.get("start")) ? params.get("start") : DEFAULT_STATE.start,
    dimension: graph.dimensions.some(({ id }) => id === params.get("dimension"))
      ? params.get("dimension")
      : DEFAULT_STATE.dimension,
    minutes: [5, 15, 30].includes(minutes) ? minutes : DEFAULT_STATE.minutes,
    view: ["map", "list"].includes(params.get("view")) ? params.get("view") : DEFAULT_STATE.view,
  };
}

function currentMinutes() {
  return Number(document.querySelector('input[name="minutes"]:checked')?.value || 15);
}

function updateUrl({ replace = false } = {}) {
  const params = new URLSearchParams({
    start: elements.start.value,
    dimension: elements.dimension.value,
    minutes: String(currentMinutes()),
    view: currentView(),
  });
  const method = replace ? "replaceState" : "pushState";
  window.history[method]({}, "", `${window.location.pathname}?${params}`);
}

function currentView() {
  return elements.viewButtons.find((button) => button.getAttribute("aria-pressed") === "true")?.dataset.view || "map";
}

function setView(view, { update = true } = {}) {
  const selected = view === "list" ? "list" : "map";
  elements.viewButtons.forEach((button) => {
    button.setAttribute("aria-pressed", String(button.dataset.view === selected));
  });
  elements.graphMap.hidden = selected !== "map";
  elements.graphList.hidden = selected !== "list";
  if (update) updateUrl({ replace: true });
}

function buildAdjacency() {
  adjacency = new Map(graph.nodes.map((node) => [node.id, []]));
  graph.edges.forEach((edge, index) => {
    adjacency.get(edge.source)?.push({ nodeId: edge.target, edge, index });
    adjacency.get(edge.target)?.push({ nodeId: edge.source, edge, index });
  });
}

function explorationCost(node) {
  return node.type === "thought" ? 3 : 2;
}

function semanticSimilarity(firstNode, secondNode) {
  const vector = graph.dimensions.map(({ id }) => [
    firstNode.dimensions[id] || 0,
    secondNode.dimensions[id] || 0,
  ]);
  const dotProduct = vector.reduce((sum, [first, second]) => sum + first * second, 0);
  const firstMagnitude = Math.sqrt(vector.reduce((sum, [first]) => sum + first * first, 0));
  const secondMagnitude = Math.sqrt(vector.reduce((sum, [, second]) => sum + second * second, 0));
  return firstMagnitude && secondMagnitude ? dotProduct / (firstMagnitude * secondMagnitude) : 0;
}

function scoreExtension(state, nextNode, edge, dimension) {
  const currentNode = nodesById.get(state.path[state.path.length - 1]);
  const edgeDimensionBonus = edge.dimensions?.includes(dimension) ? 1.1 : 0;
  const affinity = nextNode.dimensions[dimension] || 0;
  const semanticProximity = semanticSimilarity(currentNode, nextNode);
  const freshType = state.types.has(nextNode.type) ? 0 : 0.38;
  const freshRelation = state.relations.has(edge.type) ? 0 : 0.28;
  const sharedTags = nextNode.tags?.filter((tag) => state.tags.has(tag)).length || 0;
  const novelty = Math.max(0, 0.32 - sharedTags * 0.08);
  return edge.weight * 2.7 + affinity * 2.35 + semanticProximity * 0.55 + edgeDimensionBonus + freshType + freshRelation + novelty;
}

function finalScore(state, budget, dimension) {
  const coverage = state.path.reduce(
    (sum, nodeId) => sum + (nodesById.get(nodeId).dimensions[dimension] || 0),
    0,
  );
  const budgetMiss = Math.abs(budget - state.cost);
  const usefulLength = Math.min(state.path.length, 6) * 0.18;
  return state.score + coverage * 0.34 + usefulLength - budgetMiss * 0.42;
}

function findRoute(startId, dimension, budget) {
  const startNode = nodesById.get(startId);
  const initial = {
    path: [startId],
    edgeIndexes: [],
    cost: explorationCost(startNode),
    score: (startNode.dimensions[dimension] || 0) * 1.5,
    types: new Set([startNode.type]),
    relations: new Set(),
    tags: new Set(startNode.tags || []),
  };

  let frontier = [initial];
  const candidates = [initial];
  const maxDepth = Math.min(10, Math.ceil(budget / 2) + 1);

  for (let depth = 1; depth < maxDepth; depth += 1) {
    const expanded = [];
    frontier.forEach((state) => {
      const tail = state.path[state.path.length - 1];
      (adjacency.get(tail) || []).forEach(({ nodeId, edge, index }) => {
        if (state.path.includes(nodeId)) return;
        const nextNode = nodesById.get(nodeId);
        const nextCost = state.cost + explorationCost(nextNode);
        if (nextCost > budget + 1) return;

        expanded.push({
          path: [...state.path, nodeId],
          edgeIndexes: [...state.edgeIndexes, index],
          cost: nextCost,
          score: state.score + scoreExtension(state, nextNode, edge, dimension),
          types: new Set([...state.types, nextNode.type]),
          relations: new Set([...state.relations, edge.type]),
          tags: new Set([...state.tags, ...(nextNode.tags || [])]),
        });
      });
    });

    expanded.sort((a, b) => finalScore(b, budget, dimension) - finalScore(a, budget, dimension));
    frontier = expanded.slice(0, 240);
    candidates.push(...frontier);
    if (!frontier.length) break;
  }

  const valid = candidates.filter((candidate) => candidate.path.length >= 2);
  valid.sort((a, b) => finalScore(b, budget, dimension) - finalScore(a, budget, dimension));
  return valid[0] || initial;
}

function edgeBetween(firstId, secondId) {
  return graph.edges.find(
    (edge) =>
      (edge.source === firstId && edge.target === secondId) ||
      (edge.source === secondId && edge.target === firstId),
  );
}

function statusLabel(node) {
  if (node.status === "published") return "Published";
  if (node.status === "planned") return "In the library plan";
  return node.type === "work" ? "Reference work" : "Connecting concept";
}

function typeLabel(type) {
  return type.charAt(0).toUpperCase() + type.slice(1);
}

function renderRoute(routeState, { announce = true } = {}) {
  const dimension = graph.dimensions.find(({ id }) => id === elements.dimension.value);
  activeRoute = routeState.path;
  activeEdges = routeState.edgeIndexes;
  elements.routeTitle.textContent = `A path through ${dimension.label.toLowerCase()}`;
  elements.routeQuestion.textContent = dimension.question;
  elements.routeList.replaceChildren();

  activeRoute.forEach((nodeId, index) => {
    const node = nodesById.get(nodeId);
    const item = document.createElement("li");
    item.className = "route-stop";

    const meta = document.createElement("div");
    meta.className = "route-stop-meta";
    const type = document.createElement("span");
    type.textContent = typeLabel(node.type);
    const status = document.createElement("span");
    status.className = `status-${node.status}`;
    status.textContent = statusLabel(node);
    meta.append(type, status);

    const title = document.createElement("h3");
    if (node.status === "published" && node.url) {
      const link = document.createElement("a");
      link.href = node.url;
      link.textContent = node.title;
      title.append(link);
    } else {
      title.textContent = node.title;
    }

    const summary = document.createElement("p");
    summary.textContent = node.summary;
    item.append(meta, title, summary);

    if (index > 0) {
      const edge = edgeBetween(activeRoute[index - 1], nodeId);
      const reason = document.createElement("p");
      reason.className = "route-reason";
      reason.textContent = `${typeLabel(edge.type)}: ${edge.reason}`;
      item.append(reason);
    }

    elements.routeList.append(item);
  });

  const readingMinutes = activeRoute.reduce((total, nodeId) => total + explorationCost(nodesById.get(nodeId)), 0);
  const publishedCount = activeRoute.filter((nodeId) => nodesById.get(nodeId).status === "published").length;
  elements.routeSummary.textContent = `${activeRoute.length} stops · about ${readingMinutes} min to explore · ${publishedCount} published`;

  updateGraphState();
  updateUrl({ replace: true });
  if (announce) {
    elements.status.textContent = `Built a ${activeRoute.length}-stop path through ${dimension.label}, beginning with ${nodesById.get(activeRoute[0]).title}.`;
  }
}

function svgElement(name, attributes = {}) {
  const element = document.createElementNS(SVG_NS, name);
  Object.entries(attributes).forEach(([key, value]) => element.setAttribute(key, value));
  return element;
}

function nodePosition(node) {
  return {
    x: Math.min(915, Math.max(85, node.position.x * 10)),
    y: Math.min(625, Math.max(35, node.position.y * 6.6)),
  };
}

function truncateTitle(title, length = 22) {
  return title.length > length ? `${title.slice(0, length - 1)}…` : title;
}

function renderGraph() {
  elements.graphEdges.replaceChildren();
  graph.edges.forEach((edge, index) => {
    const source = nodePosition(nodesById.get(edge.source));
    const target = nodePosition(nodesById.get(edge.target));
    const middleX = (source.x + target.x) / 2;
    const bend = Math.min(55, Math.abs(target.x - source.x) * 0.12);
    const path = svgElement("path", {
      d: `M ${source.x} ${source.y} C ${middleX - bend} ${source.y}, ${middleX + bend} ${target.y}, ${target.x} ${target.y}`,
      class: `graph-edge ${edge.type}`,
      "data-edge-index": index,
      "aria-hidden": "true",
    });
    elements.graphEdges.append(path);
  });

  elements.graphNodes.replaceChildren();
  graph.nodes.forEach((node) => {
    const { x, y } = nodePosition(node);
    const width = node.type === "thought" ? 168 : 150;
    const height = node.type === "thought" ? 50 : 44;
    const group = svgElement("g", {
      class: `graph-node type-${node.type}`,
      transform: `translate(${x} ${y})`,
      tabindex: "0",
      role: "button",
      "data-node-id": node.id,
      "aria-label": `${node.title}. ${typeLabel(node.type)}. ${statusLabel(node)}. Start a path here.`,
    });
    const rect = svgElement("rect", {
      x: -width / 2,
      y: -height / 2,
      width,
      height,
    });
    const title = svgElement("text", { x: 0, y: -2 });
    title.textContent = truncateTitle(node.title);
    const meta = svgElement("text", { x: 0, y: 13, class: "node-meta" });
    meta.textContent = node.status === "planned" ? "planned thought" : typeLabel(node.type);
    const tooltip = svgElement("title");
    tooltip.textContent = `${node.title}: ${node.question}`;
    group.append(rect, title, meta, tooltip);
    group.addEventListener("click", () => startFromNode(node.id));
    group.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        startFromNode(node.id);
      }
    });
    elements.graphNodes.append(group);
  });
}

function renderGraphList() {
  elements.graphList.replaceChildren();
  graph.nodes.forEach((node) => {
    const button = document.createElement("button");
    button.type = "button";
    button.dataset.nodeId = node.id;
    const title = document.createElement("strong");
    title.textContent = node.title;
    const meta = document.createElement("small");
    meta.textContent = `${typeLabel(node.type)} · ${statusLabel(node)}`;
    button.append(title, meta);
    button.addEventListener("click", () => startFromNode(node.id));
    elements.graphList.append(button);
  });
}

function updateGraphState() {
  const routeNodes = new Set(activeRoute);
  const routeEdges = new Set(activeEdges);
  document.querySelectorAll(".graph-edge").forEach((edge) => {
    const isRoute = routeEdges.has(Number(edge.dataset.edgeIndex));
    edge.classList.toggle("is-route", isRoute);
    edge.classList.toggle("is-muted", activeEdges.length > 0 && !isRoute);
  });
  document.querySelectorAll(".graph-node").forEach((node) => {
    const id = node.dataset.nodeId;
    node.classList.toggle("is-route", routeNodes.has(id));
    node.classList.toggle("is-start", id === activeRoute[0]);
    node.classList.toggle("is-muted", activeRoute.length > 0 && !routeNodes.has(id));
  });
  elements.graphList.querySelectorAll("button").forEach((button) => {
    const id = button.dataset.nodeId;
    button.classList.toggle("is-route", routeNodes.has(id));
    button.classList.toggle("is-start", id === activeRoute[0]);
  });
}

function buildRoute({ announce = true } = {}) {
  const route = findRoute(elements.start.value, elements.dimension.value, currentMinutes());
  renderRoute(route, { announce });
}

function startFromNode(nodeId) {
  elements.start.value = nodeId;
  buildRoute();
  document.querySelector(".route-panel")?.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

function seededNumber(seedText) {
  let hash = 2166136261;
  for (const character of seedText) {
    hash ^= character.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0) / 4294967296;
}

function surpriseMe() {
  surpriseCount += 1;
  const day = new Date().toISOString().slice(0, 10);
  const nodeIndex = Math.floor(seededNumber(`${day}-node-${surpriseCount}`) * graph.nodes.length);
  const dimensionIndex = Math.floor(seededNumber(`${day}-dimension-${surpriseCount}`) * graph.dimensions.length);
  elements.start.value = graph.nodes[nodeIndex].id;
  elements.dimension.value = graph.dimensions[dimensionIndex].id;
  buildRoute();
}

async function copyRoute() {
  updateUrl({ replace: true });
  const shareUrl = window.location.href;
  try {
    await navigator.clipboard.writeText(shareUrl);
    elements.copy.textContent = "Path copied";
  } catch {
    window.prompt("Copy this path link:", shareUrl);
  }
  window.setTimeout(() => {
    elements.copy.textContent = "Copy path link";
  }, 1800);
}

function resetExplorer() {
  elements.start.value = DEFAULT_STATE.start;
  elements.dimension.value = DEFAULT_STATE.dimension;
  document.querySelector(`#minutes-${DEFAULT_STATE.minutes}`).checked = true;
  setView(DEFAULT_STATE.view, { update: false });
  buildRoute();
}

function populateControls() {
  const thoughts = graph.nodes.filter((node) => node.type === "thought");
  const others = graph.nodes.filter((node) => node.type !== "thought");
  const thoughtGroup = document.createElement("optgroup");
  thoughtGroup.label = "Thoughts";
  thoughts.forEach((node) => thoughtGroup.append(option(node.id, node.title)));
  const ideaGroup = document.createElement("optgroup");
  ideaGroup.label = "Concepts and works";
  others.forEach((node) => ideaGroup.append(option(node.id, node.title)));
  elements.start.append(thoughtGroup, ideaGroup);
  graph.dimensions.forEach((dimension) => {
    elements.dimension.append(option(dimension.id, dimension.label));
  });
}

function bindEvents() {
  elements.find.addEventListener("click", () => buildRoute());
  elements.surprise.addEventListener("click", surpriseMe);
  elements.reset.addEventListener("click", resetExplorer);
  elements.copy.addEventListener("click", copyRoute);
  elements.viewButtons.forEach((button) => {
    button.addEventListener("click", () => setView(button.dataset.view));
  });
  window.addEventListener("popstate", () => {
    const state = readState();
    applyState(state);
    buildRoute({ announce: false });
  });
}

function applyState(state) {
  elements.start.value = state.start;
  elements.dimension.value = state.dimension;
  document.querySelector(`#minutes-${state.minutes}`).checked = true;
  setView(state.view, { update: false });
}

function showError() {
  const workspace = document.querySelector(".explorer-workspace");
  workspace.className = "explorer-error";
  workspace.innerHTML = `
    <div>
      <h2>The map is temporarily folded.</h2>
      <p>The explorer data could not be loaded. The published Thoughts are still available.</p>
      <p><a href="../">Browse all Thoughts →</a></p>
    </div>
  `;
}

async function initialize() {
  try {
    const response = await fetch(GRAPH_URL);
    if (!response.ok) throw new Error(`Graph request failed: ${response.status}`);
    graph = await response.json();
    nodesById = new Map(graph.nodes.map((node) => [node.id, node]));
    buildAdjacency();
    populateControls();
    renderGraph();
    renderGraphList();
    applyState(readState());
    bindEvents();
    buildRoute({ announce: false });
  } catch (error) {
    console.error(error);
    showError();
  }
}

initialize();
