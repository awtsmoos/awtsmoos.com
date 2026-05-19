// B"H

import { h } from "../ui/core/html.js";
import { activatePane } from "../router/paneRouter.js";
import { remember } from "../platform/workspaceMemory.js";
import { createActiveWorkspaceRuntime } from "./activeWorkspaceRuntime.js";
import { listRuntimes, getActiveRuntime, setActiveRuntime, registerRuntime } from "./runtimeRegistry.js";
import { applyCapabilityGuards } from "./capabilityGuard.js";

function title(runtime) {
  return runtime?.label || runtime?.tunnel?.name || runtime?.id || "Unknown runtime";
}

function mark(runtime) {
  if (runtime?.mode === "virtual-os") return "Virtual OS";
  if (runtime?.mode === "browser-tab-editor") return "Code editor";
  return runtime?.tunnel?.connected ? "Connected tunnel" : "Offline vessel";
}

function activate(runtime, status) {
  const chosen = setActiveRuntime(runtime.id);
  if (!chosen) return;
  window.awtsActiveWorkspaceRuntime = chosen;
  document.body.dataset.awtRuntimeMode = chosen.mode;
  status.textContent = `${chosen.mode} · ${chosen.activeRoot || "."}`;
  applyCapabilityGuards();
  document.dispatchEvent(new CustomEvent("awt:runtime-grid-updated", { detail: { runtime: chosen } }));
}

function derivedRuntime(runtime, mode) {
  return createActiveWorkspaceRuntime({
    tunnel: {
      ok: runtime.tunnel?.connected,
      tunnelName: runtime.tunnel?.name,
      root: runtime.activeRoot,
      permissions: runtime.tunnel?.raw?.permissions || runtime.tunnel?.raw?.device?.permissions || {},
      raw: runtime.tunnel?.raw || null
    },
    activeRoot: runtime.activeRoot,
    authState: runtime.authState,
    mode,
    workspaceMode: mode === "virtual-os" ? "virtual-os" : "code-editor"
  });
}

function runtimeCard(runtime, active, preferred, status) {
  const isActive = runtime.id === active?.id;
  const isPreferred = runtime.id === preferred;
  const card = h("article", { classes: ["awt-runtime-card", isActive ? "active" : "", isPreferred ? "preferred" : ""] });
  const use = h("button", { attrs: { type: "button" }, text: isActive ? "Active" : "Use runtime" });
  const prefer = h("button", { attrs: { type: "button" }, text: isPreferred ? "Preferred" : "Make preferred" });
  const editor = h("button", { attrs: { type: "button" }, text: "Code editor" });
  const virtual = h("button", { attrs: { type: "button" }, text: "Virtual OS" });

  use.addEventListener("click", () => activate(runtime, status));
  prefer.addEventListener("click", () => { remember("preferredRuntimeId", runtime.id); activate(runtime, status); });
  editor.addEventListener("click", () => { const next = registerRuntime(derivedRuntime(runtime, "browser-tab-editor")); activate(next, status); activatePane("explorer"); });
  virtual.addEventListener("click", () => { const next = registerRuntime(derivedRuntime(runtime, "virtual-os")); activate(next, status); activatePane("mesh"); });

  card.append(
    h("div", { classes: ["awt-runtime-card-top"], children: [
      h("strong", { text: title(runtime) }),
      h("span", { text: mark(runtime) })
    ]}),
    h("p", { text: runtime.activeRoot || "." }),
    h("div", { classes: ["awt-runtime-actions"], children: [use, prefer, editor, virtual] })
  );
  return card;
}

/**
 * B"H
 * Chapter 1: The grid of living gates.
 *
 * @returns {HTMLElement} Runtime switcher with a 2D runtime grid.
 */
export function createRuntimeSwitcher() {
  const active = getActiveRuntime();
  const memory = JSON.parse(localStorage.getItem("awt-workspace-memory") || "{}");
  const status = h("p", { classes: ["awt-runtime-caption"], text: active ? `${active.mode} · ${active.activeRoot || "."}` : "No runtime selected" });
  const grid = h("div", {
    classes: ["awt-runtime-grid"],
    children: listRuntimes().map(runtime => runtimeCard(runtime, active, memory.preferredRuntimeId, status))
  });

  return h("section", { classes: ["awt-runtime-switcher", "awt-runtime-switcher-grid"], children: [
    h("div", { classes: ["awt-mini-kicker"], text: "Runtime Mesh" }),
    h("h2", { text: "Choose a vessel" }),
    grid,
    status
  ]});
}
