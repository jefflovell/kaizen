const tailWidths = [
  0.5, 0.7, 0.9, 1.1, 1.3, 1.55, 1.8, 2.05,
  2.35, 2.65, 2.95, 3.25, 3.55, 3.85, 4.15, 4.5,
];

const tailOpacities = [
  0.04, 0.08, 0.13, 0.19, 0.26, 0.34, 0.43, 0.52,
  0.61, 0.7, 0.78, 0.84, 0.89, 0.93, 0.96, 0.98,
];

document.querySelectorAll(".planner-tail-source").forEach((source) => {
  const totalLength = source.getTotalLength();
  const segmentLength = totalLength / tailWidths.length;
  const color = source.dataset.tailColor || "#5bd7eb";

  tailWidths.forEach((width, index) => {
    const segment = source.cloneNode(false);
    segment.removeAttribute("data-tail-color");
    segment.classList.remove("planner-tail-source");
    segment.classList.add("planner-tail-segment");
    segment.style.stroke = color;
    segment.style.strokeWidth = width;
    segment.style.strokeOpacity = tailOpacities[index];
    segment.style.strokeDasharray = `${segmentLength + 0.18} ${totalLength + segmentLength}`;
    segment.style.strokeDashoffset = `${-index * segmentLength}`;
    source.parentNode.insertBefore(segment, source);
  });
});
