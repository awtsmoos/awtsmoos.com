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
      if (style.display === 'grid') return this.layoutGrid(node, x, y, containingWidth, style);
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
      const text = directText(node) || String(node.textContent || '').trim();
      const measured = measureText(text, style, containingWidth);
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
    /**
     * Basic CSS grid layout: grid-template-columns/rows (px, %, fr, auto,
     * repeat()), gap/column-gap/row-gap, explicit grid-column/grid-row
     * placement (line numbers and span), and row-flow auto-placement.
     * Items are top/left aligned within their area (no align/justify yet).
     */
    layoutGrid(node, x, y, containingWidth, style) {
      const padding = px(style.padding), border = px(style['border-width']);
      const width = px(style.width) || containingWidth;
      const innerWidth = Math.max(0, width - padding * 2 - border * 2);
      const gap = px(style.gap) || 0;
      const colGap = style['column-gap'] != null && style['column-gap'] !== '' ? px(style['column-gap']) : gap;
      const rowGap = style['row-gap'] != null && style['row-gap'] !== '' ? px(style['row-gap']) : gap;
      const colTracks = parseGridTracks(style['grid-template-columns'], innerWidth);
      const rowTracks = parseGridTracks(style['grid-template-rows'], 0);
      const items = (node.children || [])
        .filter(c => c && c.nodeType === 1 && !hidden.has(c.localName))
        .map(c => ({ node: c, style: this.computed(c) }))
        .filter(item => item.style.display !== 'none');

      // --- placement: occupancy grid, extended with implicit tracks as needed ---
      const occ = []; // occ[row][col] = true when occupied
      const ensureCell = (r, c) => {
        while (occ.length <= r) occ.push([]);
        while (occ[r].length <= c) occ[r].push(false);
      };
      const colCount = () => Math.max(colTracks.length, 1, ...occ.map(r => r.length));
      const fits = (r, c, span) => { for (let i = 0; i < span; i++) { ensureCell(r, c + i); if (occ[r][c + i]) return false; } return true; };
      const occupy = (r, c, rowSpan, colSpan) => { for (let dr = 0; dr < rowSpan; dr++) for (let dc = 0; dc < colSpan; dc++) { ensureCell(r + dr, c + dc); occ[r + dr][c + dc] = true; } };

      const placements = [];
      let cursorR = 0, cursorC = 0;
      for (const item of items) {
        const child = item.node, cs = item.style;
        const col = resolveGridPlacement(cs['grid-column'], colTracks.length);
        const row = resolveGridPlacement(cs['grid-row'], rowTracks.length);
        let r, c;
        if (row.start != null || col.start != null) {
          r = row.start != null ? row.start : cursorR;
          c = col.start != null ? col.start : 0;
          if (col.start == null) { // explicit row, auto column: first fit in that row
            c = 0; while (!fits(r, c, col.span)) c++;
          }
          occupy(r, c, row.span, col.span);
          cursorR = r; cursorC = c + col.span;
        } else {
          const span = col.span;
          r = cursorR; c = cursorC; let placed = false;
          for (let trial = 0; trial < 4096 && !placed; trial++) {
            if (c + span > colCount()) { r++; c = 0; continue; }
            if (fits(r, c, span)) { placed = true; break; }
            c++;
            if (c >= colCount()) { r++; c = 0; }
          }
          occupy(r, c, row.span, span);
          cursorR = r; cursorC = c + span;
        }
        placements.push({ child, style: cs, r, c, rowSpan: row.span, colSpan: col.span });
      }

      // --- column widths ---
      const nCols = Math.max(colTracks.length, 1, ...placements.map(p => p.c + p.colSpan));
      while (colTracks.length < nCols) colTracks.push({ kind: 'auto' });
      const fixedW = colTracks.reduce((n, t) => n + (t.kind === 'px' ? t.value : 0), 0);
      const autoW = colTracks.map((t, i) => {
        if (t.kind !== 'auto') return 0;
        let w = 0;
        for (const p of placements) {
          if (p.c === i && p.colSpan === 1) w = Math.max(w, measureGridContentWidth(p.child, p.style));
        }
        return w;
      });
      const totalFr = colTracks.reduce((n, t) => n + (t.kind === 'fr' ? t.value : 0), 0);
      const frBudget = Math.max(0, innerWidth - fixedW - autoW.reduce((a, b) => a + b, 0) - colGap * Math.max(0, nCols - 1));
      const colWidths = colTracks.map((t, i) => t.kind === 'px' ? t.value : t.kind === 'auto' ? autoW[i] : totalFr > 0 ? frBudget * t.value / totalFr : 0);
      const colX = []; { let acc = x + padding + border; for (let i = 0; i < nCols; i++) { colX.push(acc); acc += colWidths[i] + colGap; } }

      // --- rows: lay out children row by row, row height = max content (or explicit) ---
      const nRows = Math.max(rowTracks.length, 1, ...placements.map(p => p.r + p.rowSpan));
      while (rowTracks.length < nRows) rowTracks.push({ kind: 'auto' });
      const explicitH = px(style.height);
      const rowHeights = rowTracks.map(t => t.kind === 'px' ? t.value : 0);
      const children = [];
      let cursorY = y + padding + border;
      const byRow = new Map();
      for (const p of placements) { if (!byRow.has(p.r)) byRow.set(p.r, []); byRow.get(p.r).push(p); }
      for (let r = 0; r < nRows; r++) {
        let maxH = rowHeights[r] || 0;
        const laid = [];
        for (const p of byRow.get(r) || []) {
          const w = colWidths.slice(p.c, p.c + p.colSpan).reduce((a, b) => a + b, 0) + colGap * Math.max(0, p.colSpan - 1);
          const childBox = this.layoutNode(p.child, colX[p.c], cursorY, Math.max(0, w), p.style);
          laid.push({ box: childBox });
          maxH = Math.max(maxH, childBox.height);
        }
        const fixed = rowTracks[r] && rowTracks[r].kind === 'px' ? rowTracks[r].value : 0;
        const rh = Math.max(fixed, maxH);
        rowHeights[r] = rh;
        // Default align-items: stretch — items without an explicit height fill the row.
        for (const entry of laid) {
          if (px(entry.box.style.height) === 0 && entry.box.height < rh) entry.box.height = rh;
        }
        for (const b of laid) children.push(b.box);
        cursorY += rh + (r < nRows - 1 ? rowGap : 0);
      }

      const contentHeight = nRows ? cursorY - rowGap - (y + padding + border) : 0;
      const height = Math.max(explicitH, contentHeight + padding * 2 + border * 2);
      const out = box(node, x, y, width, explicitH || height, style, children);
      this.log.push('layout', 'grid', { width, height: Math.round(out.height), cols: nCols, rows: nRows });
      this.emitBox(out);
      return out;
    }
    textLine(text, x, y, width, style) {
      const measured = measureText(text, style, width);
      if (measured.lines > 1) this.log.push('layout', 'linebreak', { x: Math.round(x + width), lines: measured.lines });
      const node = { localName: '#text-line', textContent: text };
      const out = box(node, x, y, Math.min(width || measured.width, measured.width), measured.height, style, []);
      out.text = text;
      this.emitBox(out);
      return out;
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

  /* ---- CSS grid helpers: track parsing, repeat(), placement, measuring ---- */

  /** Parses grid-template-columns/rows into [{kind:'px'|'fr'|'auto', value}]. */
  function parseGridTracks(value, base) {
    const expanded = expandGridRepeat(String(value || '').trim());
    if (!expanded) return [];
    const tracks = [];
    for (const part of splitGridTracks(expanded)) {
      const t = part.trim().toLowerCase();
      if (!t || t === 'none') continue;
      if (t === 'auto' || t === 'min-content' || t === 'max-content') { tracks.push({ kind: 'auto' }); continue; }
      if (t.endsWith('fr')) { tracks.push({ kind: 'fr', value: Math.max(0, parseFloat(t) || 0) }); continue; }
      if (t.endsWith('%')) { tracks.push({ kind: 'px', value: Math.max(0, (parseFloat(t) || 0) / 100 * base) }); continue; }
      tracks.push({ kind: 'px', value: Math.max(0, px(t)) });
    }
    return tracks;
  }

  /** Expands repeat(n, <track-list>) into a flat track list string (one level). */
  function expandGridRepeat(value) {
    let out = String(value || ''), guard = 0, m;
    const re = /repeat\(\s*(\d+)\s*,/i;
    while ((m = re.exec(out)) && guard++ < 16) {
      const openAt = out.indexOf('(', m.index);
      const closeAt = balancedGridParenEnd(out, openAt);
      if (closeAt < 0) break;
      const inner = out.slice(openAt + 1, closeAt).replace(/^[^,]+,/, '').trim();
      const n = Math.min(parseInt(m[1], 10) || 0, 64);
      const repeated = Array(n).fill(inner).join(' ');
      out = out.slice(0, m.index) + ' ' + repeated + ' ' + out.slice(closeAt + 1);
    }
    return out;
  }

  function splitGridTracks(value) {
    const parts = []; let start = 0, depth = 0;
    for (let at = 0; at <= value.length; at++) {
      const ch = value[at];
      if (ch === '(') depth++;
      if (ch === ')') depth = Math.max(0, depth - 1);
      if ((at === value.length || ch === ' ' || ch === '\t' || ch === '\n') && depth === 0) {
        const part = value.slice(start, at).trim();
        if (part) parts.push(part);
        start = at + 1;
      }
    }
    return parts;
  }

  function balancedGridParenEnd(text, openAt) {
    let depth = 0;
    for (let at = openAt; at < text.length; at++) {
      if (text[at] === '(') depth++;
      else if (text[at] === ')') { depth--; if (depth === 0) return at; }
    }
    return -1;
  }

  /**
   * Resolves grid-column / grid-row into {start (0-based line index or null for auto), span}.
   * Understands `<n>`, `<n> / <m>`, `span <n>`, `<n> / span <m>`, and negative lines (-1 = last).
   */
  function resolveGridPlacement(value, trackCount) {
    const text = String(value || '').trim().toLowerCase();
    if (!text || text === 'auto') return { start: null, span: 1 };
    const sides = text.split('/').map(s => s.trim());
    const first = parseGridLine(sides[0], trackCount);
    const second = sides.length > 1 ? parseGridLine(sides[1], trackCount) : null;
    if (first && first.spanOnly) return { start: null, span: first.span };
    if (first && second && second.spanOnly) return { start: first.line, span: second.span };
    if (first && second && second.line != null) return { start: first.line, span: Math.max(1, second.line - first.line) };
    if (first && first.line != null) return { start: first.line, span: 1 };
    return { start: null, span: 1 };
  }

  function parseGridLine(part, trackCount) {
    if (!part || part === 'auto') return null;
    const spanMatch = part.match(/^span\s+(\d+)$/);
    if (spanMatch) return { spanOnly: true, span: Math.max(1, parseInt(spanMatch[1], 10)) };
    const n = parseInt(part, 10);
    if (isNaN(n) || n === 0) return null;
    const line = n > 0 ? n - 1 : Math.max(0, trackCount + n);
    return { line: Math.max(0, line), span: 1 };
  }

  /** Rough max-content width estimate for auto tracks: widest text run + padding. */
  function measureGridContentWidth(node, style) {
    const padding = px(style?.padding) * 2;
    if (!node) return padding;
    if (node.nodeType === 3) {
      const size = px(style?.['font-size']) || 16;
      return padding + String(node.textContent || '').length * size * 0.52;
    }
    if (['img', 'canvas', 'video'].includes(node.localName)) return padding + (px(node.getAttribute?.('width')) || 0);
    let w = 0;
    for (const child of node.children || []) w = Math.max(w, measureGridContentWidth(child, style));
    const text = String(node._textContent || '').trim();
    if (text && (!node.children || !node.children.length)) {
      const size = px(style?.['font-size']) || 16;
      w = Math.max(w, text.length * size * 0.52);
    }
    return padding + w;
  }
  return { RetainedLayoutEngine };
});
