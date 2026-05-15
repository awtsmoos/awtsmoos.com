
// B"H

/**
 * B"H
 * Human button text aliases to pane names.
 *
 * The old top buttons are not always data-tab buttons. This map lets
 * visible buttons like "Install / Restart" and "API Docs" navigate.
 */
export const BUTTON_ALIASES = [
  [/install|restart/i, "install"],
  [/api\s*docs|docs|agent\s*docs/i, "docs"],
  [/login|account/i, "account"],
  [/setup|root|permission/i, "setup"],
  [/api\s*keys|key/i, "apiKeys"],
  [/explorer|files|browser/i, "explorer"],
  [/terminal|command/i, "terminal"],
  [/chrome/i, "chrome"],
  [/usage|limits/i, "usage"]
];

/**
 * B"H
 * Resolves a button to a pane.
 *
 * @param {HTMLElement} button Button or link.
 * @returns {string} Pane name.
 */
export function paneFromButton(button) {
  const explicit =
    button.dataset?.targetTab ||
    button.dataset?.pane ||
    button.getAttribute("href")?.replace(/^#/, "");

  if (explicit && /^[a-zA-Z][\w-]*$/.test(explicit)) return explicit;

  const text = (button.textContent || "").trim();

  for (const [pattern, pane] of BUTTON_ALIASES) {
    if (pattern.test(text)) return pane;
  }

  return "";
}
