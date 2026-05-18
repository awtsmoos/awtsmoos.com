// B"H

import { h } from "../ui/core/html.js";
import { listRuntimes, getActiveRuntime, setActiveRuntime } from "./runtimeRegistry.js";
import { applyCapabilityGuards } from "./capabilityGuard.js";

function label(runtime) {
  if (!runtime) return "Unknown runtime";
  return runtime.label || runtime.tunnel?.name || runtime.id;
}

function badge(runtime) {
  if (runtime?.mode === "virtual-os") return "Virtual";
  if (runtime?.tunnel?.connected) return "Local";
  return "Offline";
}

/**
 * B"H
 * Creates the runtime mesh switcher.
 *
 * @returns {HTMLElement} Runtime switcher.
 */
export function createRuntimeSwitcher() {
  const active = getActiveRuntime();

  const select = h("select", {
    attrs: { id: "awtRuntimeSelect" },
    children: listRuntimes().map(runtime => h("option", {
      attrs: { value: runtime.id, selected: runtime.id === active?.id ? "selected" : undefined },
      text: `${badge(runtime)} · ${label(runtime)}`
    }))
  });

  const status = h("p", {
    classes: ["awt-runtime-caption"],
    text: active ? `${active.mode} · ${active.activeRoot || "."}` : "No runtime selected"
  });

  select.addEventListener("change", () => {
    const runtime = setActiveRuntime(select.value);
    if (!runtime) return;

    window.awtsActiveWorkspaceRuntime = runtime;
    document.body.dataset.awtRuntimeMode = runtime.mode;
    status.textContent = `${runtime.mode} · ${runtime.activeRoot || "."}`;
    applyCapabilityGuards();
  });

  return h("section", {
    classes: ["awt-runtime-switcher"],
    children: [
      h("div", { classes: ["awt-mini-kicker"], text: "Runtime Mesh" }),
      select,
      status
    ]
  });
}
