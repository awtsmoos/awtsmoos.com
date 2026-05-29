//B"H
const SCRIPT_ROOT = "./relay/install";

export const RELAY_INSTALL_ASSETS = Object.freeze({
  powershell: `${SCRIPT_ROOT}/install-awtsmoos-chatgpt-relay.ps1`,
  unix: `${SCRIPT_ROOT}/install-awtsmoos-chatgpt-relay.sh`,
  relay: "./relay/chatgpt-node-relay.cjs"
});

/**
 * B"H
 * Chapter 178: The Installer Button Became A Gate Of Actual Descent.
 *
 * The Awtsmoos is not satisfied by a label that says "relay" while leaving the
 * human empty-handed. This helper turns each click into a real downloaded file:
 * a PowerShell river, a Unix river, or the raw Node vessel itself.
 *
 * @param {string} action The `data-relay-action` token from the settings panel.
 * @returns {boolean} True when this module handled the action.
 */
export function handleRelayInstallAction(action) {
  const href = RELAY_INSTALL_ASSETS[action];
  if (!href) return false;
  downloadAsset(href, href.split("/").pop());
  return true;
}

/**
 * B"H
 * Downloads the public installer asset without mutating the page state.
 *
 * @param {string} href Relative public URL under `/geelooy/ai`.
 * @param {string} name Filename offered to the browser.
 * @returns {void}
 */
export function downloadAsset(href, name) {
  const a = document.createElement("a");
  a.href = href;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

/**
 * B"H
 * Copies a command from the jewel-card beside the relay buttons. If clipboard is
 * blocked, the command text is selected so the human can still carry the spark.
 *
 * @param {HTMLElement} root Panel root that contains command buttons.
 * @param {HTMLElement} node Clicked copy button.
 * @returns {Promise<string>} Status sentence for the relay status line.
 */
export async function copyRelayCommand(root, node) {
  const card = node.closest(".relay-install-card");
  const command = card?.querySelector("code")?.textContent || "";
  if (!command) return "No command found to copy.";
  try {
    await navigator.clipboard.writeText(command);
    return "install command copied";
  } catch {
    selectText(root, card?.querySelector("code"));
    return "clipboard blocked; command selected";
  }
}

function selectText(root, target) {
  if (!target) return;
  const range = document.createRange();
  range.selectNodeContents(target);
  const selection = root.ownerDocument.getSelection();
  selection.removeAllRanges();
  selection.addRange(range);
}
