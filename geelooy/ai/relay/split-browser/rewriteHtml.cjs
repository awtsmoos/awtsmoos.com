//B"H

/**
 * Chapter 21: The Mirror Became Still Water.
 *
 * React hydration punishes even beautiful decorations. To match ChatGPT, the
 * document must arrive as ChatGPT wrote it: no banner, no injected base tag, no
 * diagnostics script, no altered DOM. Dynamic routing now belongs to the server
 * layer, not mutations inside the sacred HTML stream.
 *
 * @param {string} html Incoming HTML from ChatGPT.
 * @param {string} _targetOrigin Real upstream origin, intentionally unused.
 * @returns {string} Original HTML, byte-shape preserved as text.
 */
function rewriteHtml(html, _targetOrigin) {
  return String(html);
}

module.exports = { rewriteHtml };
