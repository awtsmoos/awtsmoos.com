// B"H
/**
 * @file merkava-preview.js
 * @brief Non-iframe HTML preview using Merkava synthetic runtime + WebGL VDOM.
 */

import { MerkavaRuntimeBridge } from '../vibe/runtime/MerkavaRuntimeBridge.js';
import { paintVirtualDomCanvas, renderVirtualDomMarkup, summarizeHtmlToVirtualDom } from './webgl-vdom.js';

export async function renderMerkavaPreview(container, item = {}, content = '', tabId = '') {
  if (!container) return { ok: false, error: 'preview_container_missing' };
  const html = String(content || '<html><body></body></html>');
  const summary = summarizeHtmlToVirtualDom(html);
  let result = { ok: true, runtime: 'fallback-summary', domSnapshot: summary, errors: [] };

  try {
    if (typeof window !== 'undefined') {
      result = await MerkavaRuntimeBridge.simulate({
        runtime: 'browser',
        entry: 'index.html',
        files: { 'index.html': html },
        html,
        item,
        tabId
      });
    }
  } catch (error) {
    result = { ok: false, runtime: 'merkava', errors: [{ message: error.message || String(error), stack: error.stack || '' }] };
  }

  container.innerHTML = renderVirtualDomMarkup(summary, result);
  container.dataset.tabId = String(tabId);
  container.dataset.previewEngine = 'merkava-webgl-vdom';
  paintVirtualDomCanvas(container.querySelector?.('.merkava-vdom-canvas'), summary);
  return { ...result, summary, engine: 'merkava-webgl-vdom', usesIframe: false };
}
