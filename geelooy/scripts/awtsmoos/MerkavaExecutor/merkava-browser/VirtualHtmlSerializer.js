// B"H
(function(root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else { root.Merkava = root.Merkava || {}; root.Merkava.VirtualHtmlSerializer = factory().VirtualHtmlSerializer; }
})(typeof self !== 'undefined' ? self : this, function() {
  const VOID = new Set('area base br col embed hr img input link meta param source track wbr'.split(' '));
  const esc = value => String(value ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const attrs = element => Object.entries(element.attributes || {}).map(([k, v]) => ` ${k}="${esc(v)}"`).join('');

  /**
   * B"H
   * Chapter 371: The fragment learned the difference between a gate and a jar.
   * Void tags such as input/link/meta no longer swallow the rest of the world;
   * innerHTML now creates the children that Chrome-born code expects to find.
   */
  class VirtualHtmlSerializer {
    serialize(element) {
      if (element.tagName === '#TEXT') return esc(element.textContent || '');
      const tag = String(element.tagName || 'div').toLowerCase();
      const body = `${esc(element._textContent || '')}${(element.children || []).map(child => this.serialize(child)).join('')}`;
      return VOID.has(tag) ? `<${tag}${attrs(element)}>` : `<${tag}${attrs(element)}>${body}</${tag}>`;
    }
    serializeChildren(element) {
      return `${esc(element._textContent || '')}${(element.children || []).map(child => this.serialize(child)).join('')}`;
    }
    parseInto(element, html) {
      element.replaceChildren();
      element._textContent = '';
      const stack = [element];
      for (const token of tokenize(html)) handleToken(stack, token);
    }
  }

  function handleToken(stack, token) {
    const parent = stack[stack.length - 1];
    if (token.kind === 'text') { appendText(parent, token.text); return; }
    if (token.kind === 'close') { closeStack(stack, token.name); return; }
    const child = parent.ownerDocument.createElement(token.name);
    for (const [k, v] of Object.entries(token.attrs)) child.setAttribute(k, v);
    parent.appendChild(child);
    if (!token.selfClosing && !VOID.has(token.name)) stack.push(child);
  }

  function appendText(parent, text) {
    const value = String(text || '');
    if (!value) return;
    parent.appendChild(parent.ownerDocument.createTextNode(value));
  }

  function closeStack(stack, name) {
    for (let i = stack.length - 1; i > 0; i--) {
      if (stack[i].localName === name) { stack.length = i; return; }
    }
  }

  function tokenize(html) {
    const source = String(html || ''), tokens = [];
    const re = /<!--[^]*?-->|<![^>]*>|<\/([a-zA-Z][\w:-]*)\s*>|<([a-zA-Z][\w:-]*)([^>]*)>|([^<]+)/g;
    let match;
    while ((match = re.exec(source))) {
      if (match[1]) tokens.push({ kind: 'close', name: match[1].toLowerCase() });
      else if (match[2]) tokens.push({ kind: 'open', name: match[2].toLowerCase(), attrs: parseAttrs(match[3]), selfClosing: /\/\s*$/.test(match[3] || '') });
      else if (match[4]) tokens.push({ kind: 'text', text: decode(match[4]) });
    }
    return tokens;
  }

  function parseAttrs(raw = '') {
    const out = {};
    const re = /([\w:-]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g;
    for (const m of String(raw || '').matchAll(re)) out[m[1]] = decode(m[2] ?? m[3] ?? m[4] ?? '');
    return out;
  }

  function decode(value) {
    return String(value || '').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
  }

  return { VirtualHtmlSerializer };
});
