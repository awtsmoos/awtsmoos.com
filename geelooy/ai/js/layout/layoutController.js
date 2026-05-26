//B"H
import { LayoutStore } from "./layoutStore.js";
import { mountPanelFrame } from "./panelFrame.js";
import { mountResizeHandles } from "./resizeHandles.js";

/** Reveals a cockpit made from persistent panel geometry. */
export class LayoutController {
  constructor(dom) {
    this.dom = dom;
    this.store = new LayoutStore();
  }

  mount() {
    mountPanelFrame({ panel: this.dom.sidebar, name: "sidebar", title: "Conversations", store: this.store, onLayout: l => this.apply(l) });
    mountPanelFrame({ panel: this.dom.automationPanel, name: "automation", title: "Automation", store: this.store, onLayout: l => this.apply(l) });
    mountResizeHandles({ dom: this.dom, store: this.store, onLayout: l => this.apply(l) });
    let layout = this.store.load();
    if (isFirstMobileVessel(layout)) {
      layout = this.store.save({
        sidebar: { collapsed: true, detached: false },
        automation: { collapsed: true, detached: false },
        mobile: { initialized: true }
      });
    }
    this.apply(layout);
  }

  apply(layout) {
    const root = document.documentElement;
    root.style.setProperty("--ai-sidebar", `${layout.sidebar.width}px`);
    root.style.setProperty("--ai-right", `${layout.automation.width}px`);
    root.style.setProperty("--ai-composer", `${layout.composer.height}px`);
    root.style.setProperty("--ai-mobile-sidebar", `${layout.mobile?.sidebarHeight || 360}px`);
    root.style.setProperty("--ai-mobile-automation", `${layout.mobile?.automationHeight || 420}px`);
    this.applyPanel(this.dom.sidebar, layout.sidebar);
    this.applyPanel(this.dom.automationPanel, layout.automation);
    document.body.dataset.sidebarCollapsed = String(Boolean((layout.sidebar.collapsed || layout.sidebar.detached) && !layout.sidebar.fullscreen));
    document.body.dataset.automationCollapsed = String(Boolean((layout.automation.collapsed || layout.automation.detached) && !layout.automation.fullscreen));
    document.body.classList.toggle("has-panel-fullscreen", Boolean(layout.sidebar.fullscreen || layout.automation.fullscreen));
    document.body.dataset.sidebarDetached = "false";
    document.body.dataset.automationDetached = "false";
    document.body.dataset.density = layout.density || "comfy";
  }

  applyPanel(panel, state) {
    const fullscreen = Boolean(state.fullscreen);
    const collapsed = Boolean((state.collapsed || state.detached) && !fullscreen);
    panel.classList.toggle("is-collapsed", collapsed);
    panel.classList.toggle("is-panel-fullscreen", fullscreen);
    panel.classList.remove("is-detached");
    panel.style.left = "";
    panel.style.top = "";
    panel.style.height = "";
    panel.style.width = "";
  }
}

/**
 * B"H — Determines whether the first narrow-screen revelation should fold.
 *
 * @param {object} layout The merged layout vessel from localStorage/defaults.
 * @returns {boolean} True only on the first mobile encounter, so future user
 * expansions are remembered instead of being crushed back into rails.
 */
function isFirstMobileVessel(layout) {
  const mobileQuery = globalThis.matchMedia?.("(max-width: 680px)");
  return Boolean(mobileQuery?.matches && !layout?.mobile?.initialized);
}
