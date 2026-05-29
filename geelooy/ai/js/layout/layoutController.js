//B"H
import { LayoutStore } from "./layoutStore.js";
import { mountPanelFrame } from "./panelFrame.js";
import { mountResizeHandles } from "./resizeHandles.js";

/**
 * B"H
 * Chapter 130: The Columns Remembered The Width The Human Drew.
 *
 * The previous controller saved widths into variables the active shell never
 * read. Resizers therefore appeared alive but moved nothing. This controller
 * writes `--ai-left-col`, `--ai-right-col`, and `--ai-composer`, the actual CSS
 * vessels used by the grid and composer.
 */
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
    const left = panelWidth(layout.sidebar, 220, 560, 58);
    const right = panelWidth(layout.automation, 240, 600, 58);
    root.style.setProperty("--ai-left-col", `${left}px`);
    root.style.setProperty("--ai-right-col", `${right}px`);
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

function panelWidth(state = {}, min, max, rail) {
  if ((state.collapsed || state.detached) && !state.fullscreen) return rail;
  const value = Number(state.width);
  if (!Number.isFinite(value)) return min;
  return Math.max(min, Math.min(max, Math.round(value)));
}

/**
 * B"H — Determines whether the first narrow-screen revelation should fold.
 * @param {object} layout The merged layout vessel from localStorage/defaults.
 * @returns {boolean} True only on the first mobile encounter.
 */
function isFirstMobileVessel(layout) {
  const mobileQuery = globalThis.matchMedia?.("(max-width: 680px)");
  return Boolean(mobileQuery?.matches && !layout?.mobile?.initialized);
}
