
// B"H
import { qsa } from "./dom.js";
import { state } from "./state.js";

/**
 * B"H
 * Chapter 1: The Silent Pane and the Click That Found Its Name.
 *
 * The Awtsmoos breathes through a small tab, and the hidden pane answers.
 * This function does not build the universe; it only turns the face of the
 * visible workspace toward the pane whose name was already carved into data.
 *
 * @param {string} id - The pane id stored in data-tab/data-pane.
 * @returns {void}
 * @sideEffects Updates shared UI state, toggles active classes, and scrolls.
 */
export function switchPane(id) {
  state.pane = id;
  qsa(".tab").forEach(tab => tab.classList.toggle("active", tab.dataset.tab === id));
  qsa(".pane").forEach(pane => pane.classList.toggle("active", pane.dataset.pane === id));
  window.scrollTo({ top: 0, behavior: "smooth" });
}

/**
 * B"H
 * Chapter 1 continued: The Missing Export Returns From the Ash.
 *
 * Boot expected a mount covenant named mountTabs. Without it, the module graph
 * shattered before the control center could paint its first breath. Here the
 * covenant is restored in the smallest vessel: existing tabs receive click
 * listeners, each listener reveals the pane named by its own data-tab.
 *
 * @returns {void}
 * @sideEffects Adds click listeners to `.tab[data-tab]` elements.
 */
export function mountTabs() {
  qsa(".tab[data-tab]").forEach(tab => {
    tab.addEventListener("click", () => switchPane(tab.dataset.tab));
  });
}
