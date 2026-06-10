//B"H
/**
 * @file mobileChrome.js
 * @brief Retractable phone chrome for the Awtsmoos AI cockpit.
 *
 * Chapter 4: The Awtsmoos made the crown humble. The header can retreat into a
 * thin glowing rail, returning height to the chat river while the bottom dock
 * keeps the main rooms one thumb away.
 */

const COLLAPSED_KEY = "awtsmoosAiMobileChromeCollapsed";

/** B"H. Mounts the retractable mobile header. */
export function mountMobileChrome() {
  const crown = document.querySelector(".mobile-app-crown");
  const button = document.querySelector(".mobile-crown-collapse");
  if (!crown || !button) return;
  apply(localStorage.getItem(COLLAPSED_KEY) === "1");
  button.addEventListener("click", () => apply(!document.body.classList.contains("mobile-crown-collapsed")));
  crown.addEventListener("dblclick", () => apply(false));
}

function apply(collapsed) {
  document.body.classList.toggle("mobile-crown-collapsed", collapsed);
  localStorage.setItem(COLLAPSED_KEY, collapsed ? "1" : "0");
  const button = document.querySelector(".mobile-crown-collapse");
  if (button) button.textContent = collapsed ? "⌄" : "⌃";
  if (button) button.setAttribute("aria-label", collapsed ? "Expand header" : "Collapse header");
}
