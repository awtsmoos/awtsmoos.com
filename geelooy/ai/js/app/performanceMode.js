//B"H
/**
 * @file performanceMode.js
 * @brief Chooses how much visual fire the AI cockpit may safely carry.
 *
 * Chapter 21: The Awtsmoos seals both html and body so the cascade knows the
 * vessel's strength before and after boot. Smoothness is the default covenant.
 */

const QUERY_KEY = "awtsmoosFx";
const VALID = new Set(["off", "low", "high"]);
const CLASSES = ["awts-fx-off", "awts-fx-low", "awts-fx-high"];

/** B"H. Mounts performance mode before visual chrome becomes expensive. */
export function mountPerformanceMode() {
  const sync = () => applyMode(resolveMode());
  sync();
  matchMedia("(prefers-reduced-motion: reduce)")?.addEventListener?.("change", sync);
  matchMedia("(max-width: 900px)")?.addEventListener?.("change", sync);
}

function resolveMode() {
  const forced = new URLSearchParams(location.search).get(QUERY_KEY);
  if (VALID.has(forced)) return forced;
  if (matchMedia("(prefers-reduced-motion: reduce)")?.matches) return "off";
  if (matchMedia("(max-width: 900px)")?.matches) return "low";
  if (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4) return "low";
  return "low";
}

function applyMode(mode) {
  [document.documentElement, document.body].forEach(node => {
    if (!node) return;
    node.dataset.awtsmoosFx = mode;
    node.classList.remove(...CLASSES);
    node.classList.add(`awts-fx-${mode}`);
  });
}
