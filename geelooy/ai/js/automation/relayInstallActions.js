//B"H
const SCRIPT_ROOT = "./relay/install";
const TUNNEL_CONTROL_URL = "https://awtsmoos.com/apps/tunnel-control/";

export const RELAY_INSTALL_ASSETS = Object.freeze({
  powershell: `${SCRIPT_ROOT}/install-awtsmoos-chatgpt-relay.ps1`,
  unix: `${SCRIPT_ROOT}/install-awtsmoos-chatgpt-relay.sh`,
  relay: "./relay/chatgpt-node-relay.cjs"
});

/**
 * Chapter 12: The Installer Split Into Relay And Tunnel.
 *
 * The ChatGPT relay remains downloadable, while Awtsmoos Tunnel install opens
 * the hosted control gate. Commands are visible in the card so the human can
 * copy them for Windows, macOS, Linux, or Termux without guessing.
 *
 * @param {string} action The `data-relay-action` token from the settings panel.
 * @returns {boolean} True when this module handled the action.
 */
export function handleRelayInstallAction(action) {
  if (action === "tunnel-control" || action === "tunnel-install") {
    globalThis.open?.(TUNNEL_CONTROL_URL, "_blank", "noopener,noreferrer");
    return true;
  }
  const href = RELAY_INSTALL_ASSETS[action];
  if (!href) return false;
  downloadAsset(href, href.split("/").pop());
  return true;
}

export function downloadAsset(href, name) {
  const a = document.createElement("a");
  a.href = href;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

/**
 * B"H — Copies a command from the jewel-card beside the relay buttons.
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
