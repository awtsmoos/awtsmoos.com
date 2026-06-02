// B"H
/**
 * @file preview-manager.js
 * @brief Non-iframe preview registry powered by Merkava + WebGL virtual DOM.
 */

import { DOM } from '../state.js';
import { renderMerkavaPreview } from '../html-preview/merkava-preview.js';

export const PreviewManager = {
  _visions: new Map(),

  show(tabId, item, content, forceReload = false) {
    const id = String(tabId);
    this.hideAll();

    let vessel = this.getPreview(id);
    let needsRender = forceReload;
    if (!vessel) {
      vessel = document.createElement('section');
      vessel.className = 'merkava-preview-vessel';
      vessel.dataset.tabId = id;
      vessel.dataset.previewEngine = 'merkava-webgl-vdom';
      vessel.style.width = '100%';
      vessel.style.height = '100%';
      vessel.style.overflow = 'auto';
      DOM.previewer.appendChild(vessel);
      this.registerPreview(id, vessel);
      needsRender = true;
    }

    vessel.style.display = 'block';
    if (needsRender) renderMerkavaPreview(vessel, item, content, id);
  },

  registerPreview(tabId, vessel) {
    this._visions.set(String(tabId), vessel);
  },

  registerIframe(tabId, vessel) {
    this.registerPreview(tabId, vessel);
  },

  getPreview(tabId) {
    const id = String(tabId);
    let vessel = this._visions.get(id);
    if (!vessel) {
      vessel = document.querySelector(`[data-merkava-preview="true"][data-tab-id="${id}"], .merkava-preview-vessel[data-tab-id="${id}"]`);
      if (vessel) this.registerPreview(id, vessel);
    }
    return vessel || null;
  },

  getIframe(tabId) {
    return this.getPreview(tabId);
  },

  hideAll() {
    document.querySelectorAll('.merkava-preview-vessel, iframe.browser-iframe').forEach(vessel => {
      vessel.style.display = 'none';
    });
  },

  remove(tabId) {
    const id = String(tabId);
    const vessel = this.getPreview(id);
    if (vessel?.parentNode) vessel.parentNode.removeChild(vessel);
    this._visions.delete(id);
  }
};
