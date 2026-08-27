//B"H
/**
 * @file layoutState.js
 * @brief Direct desktop layout controls for the Awtsmoos AI cockpit.
 *
 * Chapter 14: The Awtsmoos gave motion to the walls. The side panels can
 * collapse into clean icon rails and the resizer bars now write CSS variables
 * instead of pretending to be decoration.
 */

const STORE_KEY = "awtsmoosAiDesktopLayout";
const LIMITS = Object.freeze({ leftMin: 230, leftMax: 430, rightMin: 280, rightMax: 520 });

/** B"H. Mounts desktop resizers and collapse controls. */
export function mountLayoutState() {
  const state = readState();
  applyState(state);
  bindCollapse("left", state);
  bindCollapse("right", state);
  bindDrag("left", state);
  bindDrag("right", state);
}

function bindCollapse(side, state) {
  const panel = side === "left" ? document.getElementById("sidebar") : document.getElementById("automation-panel");
  const button = findCollapseButton(panel) || createCollapseButton(panel, side);
  if (!button) return;
  button.addEventListener("click", () => {
    state[side + "Collapsed"] = !state[side + "Collapsed"];
    applyState(state);
    saveState(state);
  });
}

function findCollapseButton(panel) {
  return panel?.querySelector?.("[data-ai-layout-collapse]");
}

function createCollapseButton(panel, side) {
  if (!panel) return null;
  const button = document.createElement("button");
  button.type = "button";
  button.className = "ai-layout-collapse";
  button.dataset.aiLayoutCollapse = side;
  button.textContent = side === "left" ? "⇤" : "⇥";
  panel.prepend(button);
  return button;
}

function bindDrag(side, state) {
  const bar = document.getElementById(side === "left" ? "left-resizer" : "right-resizer");
  if (!bar || bar.dataset.aiDragReady) return;
  bar.dataset.aiDragReady = "1";
  bar.addEventListener("pointerdown", event => startDrag(event, side, state));
}

function startDrag(event, side, state) {
  if (document.body.classList.contains("is-awtsmoos-embedded-ai")) return;
  event.preventDefault();
  const startX = event.clientX;
  const start = side === "left" ? state.left : state.right;
  document.body.classList.add("is-ai-resizing");
  const move = next => {
    const delta = next.clientX - startX;
    const value = side === "left" ? start + delta : start - delta;
    state[side] = clamp(value, LIMITS[side + "Min"], LIMITS[side + "Max"]);
    state[side + "Collapsed"] = false;
    applyState(state);
  };
  const up = () => {
    document.body.classList.remove("is-ai-resizing");
    saveState(state);
    window.removeEventListener("pointermove", move);
    window.removeEventListener("pointerup", up);
  };
  window.addEventListener("pointermove", move);
  window.addEventListener("pointerup", up, { once: true });
}

function applyState(state) {
  const root = document.documentElement;
  root.style.setProperty("--ai-left-width", `${state.left}px`);
  root.style.setProperty("--ai-right-width", `${state.right}px`);
  document.body.classList.toggle("ai-left-collapsed", Boolean(state.leftCollapsed));
  document.body.classList.toggle("ai-right-collapsed", Boolean(state.rightCollapsed));
}

function readState() {
  try {
    return { ...defaults(), ...JSON.parse(localStorage.getItem(STORE_KEY) || "{}") };
  } catch (_error) {
    return defaults();
  }
}

function saveState(state) {
  localStorage.setItem(STORE_KEY, JSON.stringify(state));
}

function defaults() {
  return { left: 310, right: 370, leftCollapsed: false, rightCollapsed: false };
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, Math.round(value)));
}
