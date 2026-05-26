// B"H
(function(root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory(require('./RuntimeLog.js'));
  else { root.Merkava = root.Merkava || {}; root.Merkava.RetainedLayoutEngine = factory(root.Merkava).RetainedLayoutEngine; }
})(typeof self !== 'undefined' ? self : this, function(logMod) {
  const RuntimeLog = logMod.RuntimeLog;
  const hidden = new Set(['head','style','script','meta','link','title','option']);
  const inline = new Set(['#text','span','a','b','i','strong','em','small','label']);
  const px = v => Number(String(v || '0').replace(/px$/, '')) || 0;

  class RetainedLayoutEngine {
    constructor(document, options = {}) { this.document = document; this.log = options.log || new RuntimeLog('layout'); this.tree = null; this.ops = []; this.clips = []; }
    layout(viewport = { width: 760, height: 600 }) {
      this.ops = []; this.clips = [];
      this.tree = this.layoutNode(this.document.body, 0, 0, viewport.width, null);
      this.log.push('layout', 'final tree', { nodes: countLayout(this.tree), width: viewport.width, height: Math.round(this.tree.height) });
      return this.tree;
    }
    layoutNode(node, x, y, containingWidth, parentStyle) {
      const style = this.computed(node);
      if (!node || hidden.has(node.localName) || style.display === 'none' || node.hidden) return box(node, x, y, 0, 0, style, []);
      if (style.display === 'flex') return this.layoutFlex(node, x, y, containingWidth, style);
      if (style.display === 'inline' || inline.has(node.localName)) return this.layoutInline(node, x, y, containingWidth, style);
      return this.layoutBlock(node, x, y, containingWidth, style);
    }
    layoutBlock(node, x, y, containingWidth, style) {
      const margin = px(style.margin), padding = px(style.padding), border = px(style['border-width']);
      const width = px(style.width) || intrinsicWidth(node) || Math.max(0, containingWidth - margin * 2);
      let cursorY = y + margin + padding + border;
      const children = [];
      const text = directText(node);
      if (text) { const line = this.textLine(text, x + padding + border, cursorY, width - padding * 2 - border * 2, style); children.push(line); cursorY += line.height; }
      for (const child of node.children || []) {
        if (child.nodeType === 3 && !child.textContent.trim()) continue;
        const childBox = this.layoutNode(child, x + padding + border, cursorY, width - padding * 2 - border * 2, style);
        if (childBox.height || childBox.width) { children.push(childBox); cursorY += childBox.height; }
      }
      const explicitHeight = px(style.height) || intrinsicHeight(node), minHeight = px(style['min-height']);
      const contentHeight = Math.max(explicitHeight, minHeight, cursorY - y + padding + border + margin);
      const out = box(node, x, y, width, explicitHeight || contentHeight, style, children);
      if (style.overflow === 'hidden' || style.overflow === 'clip') { out.clip = { x, y, width: out.width, height: out.height }; this.clips.push(out.clip); this.log.push('layout', 'overflow clip', { rect: `${x},${y},${out.width},${out.height}` }); }
      this.emitBox(out);
      return out;
    }
    layoutInline(node, x, y, containingWidth, style) {
      const text = directText(node);
      const measured = measureText(text || node.textContent || '', style, containingWidth);
      const out = box(node, x, y, px(style.width) || measured.width, px(style.height) || measured.height, style, []);
      if (text) out.children.push(this.textLine(text, x + 2, y + 14, containingWidth, style));
      this.emitBox(out);
      return out;
    }
    layoutFlex(node, x, y, containingWidth, style) {
      const padding = px(style.padding), gap = px(style.gap) || 0;
      const width = px(style.width) || containingWidth;
      const direction = style['flex-direction'] || 'row';
      let cx = x + padding, cy = y + padding, maxCross = 0;
      const children = [];
      const realChildren = (node.children || []).filter(c => !hidden.has(c.localName));
      this.log.push('layout', `flex ${direction}`, { width, children: realChildren.length });
      for (const child of realChildren) {
        const childBox = this.layoutNode(child, cx, cy, width - padding * 2, style);
        children.push(childBox);
        if (direction === 'column') { cy += childBox.height + gap; maxCross = Math.max(maxCross, childBox.width); }
        else { cx += childBox.width + gap; maxCross = Math.max(maxCross, childBox.height); }
      }
      const height = px(style.height) || (direction === 'column' ? cy - y + padding : maxCross + padding * 2);
      const out = box(node, x, y, width, height, style, children);
      this.emitBox(out);
      return out;
    }
    textLine(text, x, y, width, style) {
      const measured = measureText(text, style, width);
      if (measured.lines > 1) this.log.push('layout', 'linebreak', { x: Math.round(x + width), lines: measured.lines });
      const node = { localName: '#text-line', textContent: text };
      const out = box(node, x, y, Math.min(width || measured.width, measured.width), measured.height, style, []);
      out.text = text; return out;
    }
    computed(node) { return node?.ownerDocument?.cssEngine?.compute(node) || node?.style?.toJSON?.() || {}; }
    emitBox(b) { this.ops.push({ op: 'layoutBox', tag: b.tag, id: b.id, x: b.x, y: b.y, width: b.width, height: b.height, background: b.style['background-color'] || '', color: b.style.color || '' }); if (b.text) this.ops.push({ op: 'layoutText', text: b.text, x: b.x, y: b.y, color: b.style.color || '#111111' }); }
  }
  function directText(node) { if (!node) return ''; if (node.localName === 'input') return String(node.value || node.placeholder || '').trim(); if (node.localName === 'textarea') return String(node.value || node.textContent || '').trim(); if (node.localName === 'select') return String((node.children || []).find(x => x.selected)?.textContent || node.value || '').trim(); return node.nodeType === 3 ? String(node.textContent || '').trim() : String(node._textContent || '').trim(); }
  function measureText(text, style, width = 9999) { const size = px(style['font-size']) || 16; const charW = size * 0.52; const rawWidth = String(text || '').length * charW; const lines = Math.max(1, Math.ceil(rawWidth / Math.max(1, width || rawWidth || 1))); return { width: Math.min(rawWidth, width || rawWidth), height: lines * Math.ceil(size * 1.25), lines, charW }; }
  function intrinsicWidth(node) { return ['canvas','img','video'].includes(node?.localName) ? px(node.getAttribute?.('width')) : 0; }
  function intrinsicHeight(node) { return ['canvas','img','video'].includes(node?.localName) ? px(node.getAttribute?.('height')) : 0; }
  function intrinsicWidth(node) { return ['canvas','img','video'].includes(node?.localName) ? px(node.getAttribute?.('width')) : 0; }
  function intrinsicHeight(node) { return ['canvas','img','video'].includes(node?.localName) ? px(node.getAttribute?.('height')) : 0; }
  function box(node, x, y, width, height, style, children) { return { node, tag: node?.localName || '', id: node?.id || '', x, y, width, height, style: style || {}, children: children || [] }; }
  function countLayout(node) { return node ? 1 + (node.children || []).reduce((n, c) => n + countLayout(c), 0) : 0; }
  return { RetainedLayoutEngine };
});
