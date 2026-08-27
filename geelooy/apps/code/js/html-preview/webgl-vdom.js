// B"H
/**
 * @file webgl-vdom.js
 * @brief WebGL-friendly virtual DOM renderer for HTML previews.
 *
 * @description
 * The preview no longer needs a normal iframe. The Merkava executor produces
 * a synthetic DOM snapshot; this module turns it into a visible, inspectable
 * panel and, when WebGL is available, paints a small virtual DOM skyline.
 */

export function summarizeHtmlToVirtualDom(html = '') {
  const source = String(html || '');
  const tags = [...source.matchAll(/<\s*([a-zA-Z0-9-]+)/g)].map(match => match[1].toLowerCase());
  return { type: 'document', nodeCount: tags.length, tags, title: titleOf(source), textPreview: source.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 500) };
}

function titleOf(html) {
  const match = String(html || '').match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  return match ? match[1].trim() : 'Merkava Preview';
}

export function renderVirtualDomMarkup(summary = {}, result = {}) {
  const tags = (summary.tags || []).slice(0, 80).map(tag => `<span class="merkava-tag">${escapeHtml(tag)}</span>`).join('');
  const errors = (result.errors || []).map(error => `<li>${escapeHtml(error.message || error)}</li>`).join('');
  return `<section class="merkava-preview-panel" data-merkava-preview="true">
    <header><strong>${escapeHtml(summary.title || 'Merkava Preview')}</strong><span>${summary.nodeCount || 0} nodes</span></header>
    <canvas class="merkava-vdom-canvas" width="640" height="180" aria-label="WebGL virtual DOM surface"></canvas>
    <div class="merkava-tag-cloud">${tags}</div>
    <pre class="merkava-preview-text">${escapeHtml(summary.textPreview || '')}</pre>
    ${errors ? `<ul class="merkava-preview-errors">${errors}</ul>` : ''}
  </section>`;
}

export function paintVirtualDomCanvas(canvas, summary = {}) {
  if (!canvas?.getContext) return false;
  const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
  if (!gl) return false;
  const value = Math.min(1, Math.max(0.05, (summary.nodeCount || 1) / 80));
  gl.clearColor(0.02, value, 0.12 + value / 2, 1);
  gl.clear(gl.COLOR_BUFFER_BIT);
  return true;
}

function escapeHtml(text = '') {
  return String(text).replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
}
