// B"H

import { mountTabs, mountCopyButtons, mountGptText, mountStatus, mountMissions } from "./ui.js";
import { mountHandoff } from "./handoff.js";
import { BrowserPageTunnel } from "./browserPageTunnel.js";
import { mountOnboarding } from "./onboarding.js";

/**
 * B"H
 * Starts the Awtsmoos Tunnel Console UI.
 */
function safeMount(name, fn) {
  try { fn(); } catch (e) { console.warn(`tunnel mount ${name} failed`, e); }
}

function main() {
  safeMount("tabs", mountTabs);
  safeMount("copy", mountCopyButtons);
  safeMount("gpt", mountGptText);
  safeMount("status", mountStatus);
  safeMount("missions", mountMissions);
  safeMount("handoff", mountHandoff);
  safeMount("onboarding", mountOnboarding);
  safeMount("browserTunnel", () => BrowserPageTunnel.init());

  const ps = document.getElementById("cmdPowerShell");
  const cmd = document.getElementById("cmdCmd");
  const unix = document.getElementById("cmdUnix");
  if (ps) ps.textContent = "irm https://awtsmoos.com/api/tunnel/install/windows | iex";
  if (cmd) cmd.textContent = "powershell -ExecutionPolicy Bypass -Command \"irm https://awtsmoos.com/api/tunnel/install/windows | iex\"";
  if (unix) unix.textContent = "curl -fsSL https://awtsmoos.com/api/tunnel/install/unix | bash";
}

main();
