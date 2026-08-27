// B"H

/**
 * B"H
 * Chapter 380: Crumbs Became Buttons Of Living Text.
 */
function separator(mark) {
  const node = document.createElement("span");
  node.className = "crumb-sep";
  node.textContent = mark;
  return node;
}

function crumbButton(part, onPick) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "crumb-btn";
  button.dataset.path = part.path;
  button.textContent = part.label;
  button.onclick = () => onPick(button.dataset.path);
  return button;
}

export function renderCrumbs(container, parts, mark, onPick) {
  const nodes = [];

  for (const [index, part] of parts.entries()) {
    if (index) nodes.push(separator(mark));
    nodes.push(crumbButton(part, onPick));
  }

  container.replaceChildren(...nodes);
}
