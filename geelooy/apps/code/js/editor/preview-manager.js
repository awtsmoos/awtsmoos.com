// B"H
/**
 * @file preview-manager.js
 * @brief Switchable preview registry: Merkava VDOM, sandbox iframe, or both.
 *
 * Chapter 19: The Awtsmoos gives the preview vessel free will. Some worlds
 * need the living iframe; some need the Merkava synthetic runtime; some need
 * both, so diagnostics and real rendering stand side by side.
 */

import { DOM, State } from '../state.js';
import { renderMerkavaPreview } from '../html-preview/merkava-preview.js';
import { HTMLPreviewProcessor } from '../html-preview/processor.js';

export const PreviewManager = {
  _visions: new Map(),

  show(tabId, item, content, forceReload = false) {
    const id = String(tabId);
    this.hideAll();
    const vessel = this.ensureVessel(id);
    vessel.style.display = 'grid';
    if (forceReload || vessel.dataset.rendered !== '1') this.renderByEngine(vessel, id, item, content);
  },

  async renderByEngine(vessel, id, item, content) {
    vessel.dataset.rendered = '1';
    vessel.dataset.previewEngine = State.previewEngine || 'merkava';
    vessel.replaceChildren();
    if (usesIframe()) await this.renderIframe(vessel, id, item, content);
    if (usesMerkava()) await this.renderMerkava(vessel, id, item, content);
  },

  async renderIframe(vessel, id, item, content) {
    const iframe = document.createElement('iframe');
    iframe.className = 'html-preview-iframe';
    iframe.dataset.tabId = id;
    iframe.title = 'HTML iframe preview';
    vessel.appendChild(wrap('Iframe Preview', iframe));
    await HTMLPreviewProcessor.orchestrate(item, iframe, content, id);
  },

  async renderMerkava(vessel, id, item, content) {
    const merkava = document.createElement('section');
    merkava.className = 'merkava-preview-vessel-inner';
    vessel.appendChild(wrap('Merkava Virtual DOM', merkava));
    await renderMerkavaPreview(merkava, item, content, id);
  },

  ensureVessel(id) {
    let vessel = this.getPreview(id);
    if (vessel) return vessel;
    vessel = document.createElement('section');
    vessel.className = 'preview-engine-vessel';
    vessel.dataset.tabId = id;
    DOM.previewer.appendChild(vessel);
    this.registerPreview(id, vessel);
    return vessel;
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
      vessel = document.querySelector(`.preview-engine-vessel[data-tab-id="${id}"], .merkava-preview-vessel[data-tab-id="${id}"]`);
      if (vessel) this.registerPreview(id, vessel);
    }
    return vessel || null;
  },

  getIframe(tabId) {
    const vessel = this.getPreview(tabId);
    return vessel?.querySelector?.('iframe') || vessel;
  },

  hideAll() {
    document.querySelectorAll('.preview-engine-vessel, .merkava-preview-vessel, iframe.browser-iframe').forEach(vessel => {
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

function usesIframe() {
  return ['iframe', 'both'].includes(State.previewEngine || 'merkava');
}

function usesMerkava() {
  return ['merkava', 'both'].includes(State.previewEngine || 'merkava');
}

function wrap(title, child) {
  const shell = document.createElement('article');
  shell.className = 'preview-engine-pane';
  shell.innerHTML = `<header>${title}</header>`;
  shell.appendChild(child);
  return shell;
}
