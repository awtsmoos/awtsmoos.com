//B"H
/**
 * @file embeddedMode.js
 * @brief Detects the special /apps/code iframe vessel for the AI cockpit.
 *
 * Chapter 12: The Awtsmoos corrected a false prophecy. Localhost alone does
 * not mean embedded. A standalone /ai tab is its own throne room; only an
 * explicit query seal, iframe parentage, or code referrer opens the embedded
 * chamber.
 */

const QUERY_KEY = "awtsmoosAiEmbed";
const EMBEDDED_CLASS = "is-awtsmoos-embedded-ai";
const EMBEDDED_QUERY = "(min-width: 640px)";

/**
 * B"H. Mounts embedded layout detection.
 * @returns {void} Adds responsive body state for embedded rendering.
 */
export function mountEmbeddedMode() {
  const sync = () => applyEmbeddedState(shouldUseEmbeddedMode());
  sync();
  matchMedia(EMBEDDED_QUERY)?.addEventListener?.("change", sync);
  window.addEventListener("resize", sync, { passive: true });
}

/**
 * B"H. Determines whether the app should use embedded layout.
 * @returns {boolean} True only for the Code browser chamber.
 */
export function shouldUseEmbeddedMode() {
  const params = new URLSearchParams(location.search);
  if (params.get(QUERY_KEY) === "1") return true;
  if (params.get(QUERY_KEY) === "0") return false;
  const parented = window.self !== window.top;
  const wideEnough = matchMedia(EMBEDDED_QUERY)?.matches;
  const codeLikeReferrer = /\/apps\/code|\/geelooy\/apps\/code/i.test(document.referrer || "");
  return Boolean(wideEnough && (parented || codeLikeReferrer));
}

/**
 * B"H. Applies the revealed vessel mode.
 * @param {boolean} embedded Whether embedded mode is active.
 * @returns {void}
 */
function applyEmbeddedState(embedded) {
  document.body.classList.toggle(EMBEDDED_CLASS, embedded);
  document.body.dataset.aiVessel = embedded ? "embedded" : "normal";
  window.dispatchEvent(new CustomEvent("awtsmoos-ai-vessel", { detail: { embedded } }));
}
