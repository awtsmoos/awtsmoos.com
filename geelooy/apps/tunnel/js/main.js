// B"H

import { mountTabs, mountCopyButtons, mountGptText, mountStatus } from "./ui.js";
import { mountHandoff } from "./handoff.js";
import { BrowserPageTunnel } from "./browserPageTunnel.js";

/**
 * B"H
 * Starts the Awtsmoos Tunnel Console UI.
 */
function main() {
  mountTabs();
  mountCopyButtons();
  mountGptText();
  mountStatus();
  mountHandoff();
  BrowserPageTunnel.init();

  const ps = document.getElementById("cmdPowerShell");
  const cmd = document.getElementById("cmdCmd");
  const unix = document.getElementById("cmdUnix");
  if (ps) ps.textContent = "irm https://awtsmoos.com/api/tunnel/install/windows | iex";
  if (cmd) cmd.textContent = "powershell -ExecutionPolicy Bypass -Command \"irm https://awtsmoos.com/api/tunnel/install/windows | iex\"";
  if (unix) unix.textContent = "curl -fsSL https://awtsmoos.com/api/tunnel/install/unix | bash";
}

main();
