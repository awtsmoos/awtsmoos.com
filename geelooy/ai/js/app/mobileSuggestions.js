//B"H
/**
 * @file mobileSuggestions.js
 * @brief Prompt chips for mobile and embedded AI scenes only.
 *
 * Chapter 12: The Awtsmoos restrained the sparks. In direct desktop /ai, the
 * conversation must not be crushed by phone chips; in mobile and embedded
 * chambers, the chips float where they help the thumb.
 */

const MOBILE_QUERY = "(max-width: 900px)";
const CHIPS = Object.freeze([
  "Explain the Awtsmoos",
  "Summarize this code",
  "Help me debug"
]);

/** B"H. Mounts prompt suggestions only in compact vessels. */
export function mountMobileSuggestions() {
  syncSuggestions();
  window.addEventListener("awtsmoos-ai-vessel", syncSuggestions);
  matchMedia(MOBILE_QUERY)?.addEventListener?.("change", syncSuggestions);
}

function syncSuggestions() {
  if (shouldShowSuggestions()) return ensureSuggestions();
  removeSuggestions();
}

function shouldShowSuggestions() {
  return document.body.classList.contains("is-awtsmoos-embedded-ai") || matchMedia(MOBILE_QUERY)?.matches;
}

function ensureSuggestions() {
  const main = document.querySelector(".main");
  const input = document.getElementById("message-input");
  const composer = main?.querySelector(".input-area");
  if (!main || !input || !composer || document.querySelector(".mobile-suggestion-rail")) return;
  const rail = document.createElement("div");
  rail.className = "mobile-suggestion-rail";
  rail.innerHTML = CHIPS.map(chip => `<button type="button">${escapeHtml(chip)}</button>`).join("");
  main.insertBefore(rail, composer);
  rail.addEventListener("click", event => {
    const button = event.target?.closest?.("button");
    if (!button) return;
    input.value = button.textContent || "";
    input.focus();
  });
}

function removeSuggestions() {
  document.querySelector(".mobile-suggestion-rail")?.remove();
}

function escapeHtml(text) {
  return String(text || "").replace(/[&<>"]/g, char => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;" }[char]));
}
