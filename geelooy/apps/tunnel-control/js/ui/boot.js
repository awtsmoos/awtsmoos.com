
// B"H
import { h, $ } from "./dom.js";
import { hero, tabs } from "./shell.js";
import { dashboard } from "../features/dashboard.js";
import { setup } from "../features/setup.js";
import { keys } from "../features/keys.js";
import { explorer } from "../features/explorer.js";
import { terminal } from "../features/terminal.js";
import { chrome } from "../features/chrome.js";
import { promptPage } from "../features/prompt.js";
import { usage } from "../features/usage.js";
import { account } from "../features/account.js";
import { install } from "../features/install.js";
import { rootPicker } from "../features/rootPicker.js";
import { mountAll } from "./mount.js";

function rememberedTunnel() {
  const p = new URLSearchParams(location.search);
  return p.get("tunnelName") || p.get("tunnel") ||
    localStorage.getItem("awtTunnelName") ||
    localStorage.getItem("awtsmoos.tunnelName") || "";
}

export function boot() {
  const app = h("main", { className: "app-shell" }, [
    hero(), tabs(), dashboard(), setup(), keys(), explorer(),
    terminal(), chrome(), promptPage(), usage(), account(), install()
  ]);
  document.body.append(app, rootPicker());

  const tunnel = rememberedTunnel();
  if ($("tunnelName")) $("tunnelName").value = tunnel;
  if ($("miniTunnel")) $("miniTunnel").textContent = tunnel || "Discovering...";

  mountAll();
}
