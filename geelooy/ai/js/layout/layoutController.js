//B"H
import { LayoutStore } from "./layoutStore.js";
import { mountPanelFrame } from "./panelFrame.js";
import { mountResizeHandles } from "./resizeHandles.js";

/** Reveals a movable cockpit made from persistent panel geometry. */
export class LayoutController {
  constructor(dom) {
    this.dom = dom;
    this.store = new LayoutStore();
  }

  mount() {
    mountPanelFrame({ panel: this.dom.sidebar, name: "sidebar", title: "Conversations", store: this.store, onLayout: l => this.apply(l) });
    mountPanelFrame({ panel: this.dom.automationPanel, name: "automation", title: "Automation", store: this.store, onLayout: l => this.apply(l) });
    mountResizeHandles({ dom: this.dom, store: this.store, onLayout: l => this.apply(l) });
    this.apply(this.store.load());
  }

  apply(layout) {
    const root = document.documentElement;
    root.style.setProperty("--ai-sidebar", `${layout.sidebar.width}px`);
    root.style.setProperty("--ai-right", `${layout.automation.width}px`);
    root.style.setProperty("--ai-composer", `${layout.composer.height}px`);
    this.applyPanel(this.dom.sidebar, layout.sidebar);
    this.applyPanel(this.dom.automationPanel, layout.automation);
    document.body.dataset.sidebarCollapsed = String(Boolean(layout.sidebar.collapsed));
    document.body.dataset.automationCollapsed = String(Boolean(layout.automation.collapsed));
    document.body.dataset.sidebarDetached = String(Boolean(layout.sidebar.detached));
    document.body.dataset.automationDetached = String(Boolean(layout.automation.detached));
    document.body.dataset.density = layout.density || "comfy";
  }

  applyPanel(panel, state) {
    panel.classList.toggle("is-collapsed", Boolean(state.collapsed));
    panel.classList.toggle("is-detached", Boolean(state.detached));
    panel.style.left = state.detached ? `${state.x}px` : "";
    panel.style.top = state.detached ? `${state.y}px` : "";
    panel.style.height = state.detached ? `${state.h || 520}px` : "";
    panel.style.width = state.detached ? `${state.width}px` : "";
  }
}
