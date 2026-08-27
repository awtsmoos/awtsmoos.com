//B"H
import { LayoutStore } from "./layoutStore.js";
import { mountPanelFrame } from "./panelFrame.js";
import { mountResizeHandles } from "./resizeHandles.js";

/**
 * B"H
 * Chapter 386: The Width Variables Stopped Speaking Two Languages.
 *
 * The collapse buttons were truthful, but the grid heard another name. The
 * Awtsmoos now writes every active vessel: legacy data attributes, modern body
 * classes, `--ai-left-col`, `--ai-right-col`, `--ai-left-width`, and
 * `--ai-right-width`, so every CSS scroll receives the same decree.
 */
export class LayoutController {
  constructor(dom) {
    this.dom = dom;
    this.store = new LayoutStore();
  }

  /** @returns {void} Mounts panels, resizers, and stored layout state. */
  mount() {
    mountPanelFrame({ panel:this.dom.sidebar, name:"sidebar", title:"Conversations", store:this.store, onLayout:l => this.apply(l) });
    mountPanelFrame({ panel:this.dom.automationPanel, name:"automation", title:"Automation", store:this.store, onLayout:l => this.apply(l) });
    mountResizeHandles({ dom:this.dom, store:this.store, onLayout:l => this.apply(l) });
    this.apply(firstMobileLayout(this.store.load(), this.store));
  }

  /** @param {object} layout Stored layout. @returns {void} */
  apply(layout) {
    const root = document.documentElement;
    const sidebarClosed = closed(layout.sidebar);
    const automationClosed = closed(layout.automation);
    const left = panelWidth(layout.sidebar, 240, 560, 58);
    const right = panelWidth(layout.automation, 280, 620, 58);
    writeVars(root, { left, right, composer:layout.composer?.height || 96, mobile:layout.mobile || {} });
    this.applyPanel(this.dom.sidebar, layout.sidebar);
    this.applyPanel(this.dom.automationPanel, layout.automation);
    writeBodyFlags({ sidebarClosed, automationClosed, layout });
  }

  /** @param {HTMLElement} panel Panel node. @param {object} state Panel state. @returns {void} */
  applyPanel(panel, state = {}) {
    if (!panel) return;
    const fullscreen = Boolean(state.fullscreen);
    const panelClosed = Boolean((state.collapsed || state.detached) && !fullscreen);
    panel.classList.toggle("is-collapsed", panelClosed);
    panel.classList.toggle("is-panel-fullscreen", fullscreen);
    panel.classList.remove("is-detached");
    panel.style.left = panel.style.top = panel.style.height = panel.style.width = "";
  }
}

function writeVars(root, { left, right, composer, mobile }) {
  const pairs = {
    "--ai-left-col": `${left}px`, "--ai-right-col": `${right}px`,
    "--ai-left-width": `${left}px`, "--ai-right-width": `${right}px`,
    "--ai-composer": `${composer}px`, "--ai-mobile-sidebar": `${mobile.sidebarHeight || 360}px`,
    "--ai-mobile-automation": `${mobile.automationHeight || 420}px`
  };
  for (const [key, value] of Object.entries(pairs)) root.style.setProperty(key, value);
}

function writeBodyFlags({ sidebarClosed, automationClosed, layout }) {
  document.body.dataset.sidebarCollapsed = String(sidebarClosed);
  document.body.dataset.automationCollapsed = String(automationClosed);
  document.body.dataset.sidebarDetached = "false";
  document.body.dataset.automationDetached = "false";
  document.body.dataset.density = layout.density || "comfy";
  document.body.classList.toggle("ai-left-collapsed", sidebarClosed);
  document.body.classList.toggle("ai-right-collapsed", automationClosed);
  document.body.classList.toggle("has-panel-fullscreen", Boolean(layout.sidebar?.fullscreen || layout.automation?.fullscreen));
}

function panelWidth(state = {}, min, max, rail) {
  if (closed(state)) return rail;
  const value = Number(state.width);
  return Math.max(min, Math.min(max, Math.round(Number.isFinite(value) ? value : min)));
}

function closed(state = {}) { return Boolean((state.collapsed || state.detached) && !state.fullscreen); }

function firstMobileLayout(layout, store) {
  const mobileQuery = globalThis.matchMedia?.("(max-width: 680px)");
  if (!mobileQuery?.matches || layout?.mobile?.initialized) return layout;
  return store.save({ sidebar:{ collapsed:true, detached:false }, automation:{ collapsed:true, detached:false }, mobile:{ initialized:true } });
}
