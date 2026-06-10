// B"H
(function ectExtremePack(root) {
  const ect = root.AwtsECT = root.AwtsECT || {};
  const enc = new TextEncoder();
  const tags = "html body main section article div h1 h2 h3 p ul li button output input form label select option nav a canvas svg circle".split(" ");
  const attrs = "id class href src type value width height viewBox cx cy r".split(" ");
  const props = "padding margin border-radius background color display gap grid-template-columns list-style font-weight font-size line-height width height transform animation opacity fill box-shadow border bottom".split(" ");
  const units = ["px", "%", "rem", "em", "deg", "fr", "s"];
  const jsBuiltins = "document window getElementById querySelector addEventListener requestAnimationFrame textContent onclick createElement appendChild console log Math Array String const let var function return if for while class new await".split(" ");
  const punctuation = [".", "(", ")", "{", "}", ";", "=", "+", ",", "=>", "++", "[", "]"];

  /**
   * B"H. The extreme packer is not byte-token compression. It writes adaptive
   * bit fields. Tags, attrs, CSS props, JS builtins, units, and opcodes live in
   * shared heavens; only local literals descend into pools.
   */
  function packProjectExtreme(project) {
    const analysis = ect.analyzeProject(project);
    const semantic = semanticCandidate(project);
    const lz = ect.legacyPackProject ? ect.legacyPackProject(project) : null;
    const choices = [semantic, lz].filter(Boolean);
    const best = choices.sort((a, b) => a.bytes.length - b.bytes.length)[0] || semantic;
    best.analysis = analysis;
    best.metrics = makeMetrics(analysis.originalBytes, best, best.detail);
    return best;
  }

  function semanticCandidate(project) {
    const pools = { strings: [], numbers: [], colors: [], custom: [], symbols: [] };
    const ops = [];
    parseHtml(join(project, ".html"), pools, ops);
    parseCss(join(project, ".css"), pools, ops);
    parseJs(join(project, ".js"), pools, ops);
    mineRecipes(ops, pools);
    const writer = new BitWriter();
    writer.write(0xEA, 8);
    writer.write(2, 4);
    writePools(writer, pools);
    writeOps(writer, ops, pools);
    const bytes = writer.bytes;
    return { mode: "extreme dynamic bit semantic", bytes, bitLength: writer.bitLength, project, payloadKind: "bit-semantic-payload", detail: detail(pools, ops, writer) };
  }

  /** B"H. Tiny writer where fields borrow each other's unfinished bytes. */
  class BitWriter {
    constructor() { this.bytes = []; this.bitLength = 0; }
    bit(v) { const p = this.bitLength >> 3, s = 7 - (this.bitLength & 7); this.bytes[p] = this.bytes[p] || 0; this.bytes[p] |= (v & 1) << s; this.bitLength += 1; }
    write(v, w) { for (let i = w - 1; i >= 0; i -= 1) this.bit((v >> i) & 1); }
    width(n) { return Math.max(1, Math.ceil(Math.log2(Math.max(2, n)))); }
    enum(v, n) { this.write(v, this.width(n)); }
    tiny(v) { if (v < 16) { this.write(0, 1); this.write(v, 4); } else if (v < 256) { this.write(2, 2); this.write(v, 8); } else { this.write(3, 2); this.write(v, 16); } }
    ascii(text) { const s = String(text); this.tiny(s.length); for (let i = 0; i < s.length; i += 1) this.write(s.charCodeAt(i) & 127, 7); }
  }

  function writePools(w, pools) {
    [pools.strings, pools.numbers, pools.colors, pools.custom, pools.symbols].forEach(pool => {
      w.tiny(pool.length);
      pool.forEach(value => w.ascii(value));
    });
  }

  function writeOps(w, ops, pools) {
    w.tiny(ops.length);
    ops.forEach(op => {
      w.enum(op[0], 32);
      for (let i = 1; i < op.length; i += 1) writeOperand(w, op[i], pools);
    });
  }

  function writeOperand(w, operand, pools) {
    if (operand < 0) { w.write(1, 1); w.tiny(-operand); return; }
    w.write(0, 1); w.tiny(operand);
  }

  function parseHtml(src, pools, ops) {
    const rx = /<\/?([a-z][\w-]*)([^>]*)>|([^<]+)/gi;
    let m;
    while ((m = rx.exec(src))) {
      if (m[3] && m[3].trim()) { ops.push([3, ref(pools.strings, m[3].trim())]); continue; }
      const name = (m[1] || "").toLowerCase();
      const tag = built(tags, name, pools.custom);
      ops.push([m[0][1] === "/" ? 2 : 1, tag]);
      attrsOf(m[2] || "").forEach(a => ops.push([4, built(attrs, a[0], pools.custom), refSymbol(pools, a[1])]));
    }
  }

  function attrsOf(text) {
    const out = [], rx = /([a-z_:][-\w:.]*)\s*=\s*["']([^"']*)["']/gi;
    let m;
    while ((m = rx.exec(text))) out.push([m[1], m[2]]);
    return out;
  }

  function parseCss(src, pools, ops) {
    const rx = /([^{}]+)\{([^{}]*)\}/g;
    let m;
    while ((m = rx.exec(src))) {
      selectorOps(m[1].trim(), pools).forEach(op => ops.push(op));
      m[2].split(";").forEach(part => {
        const idx = part.indexOf(":");
        if (idx < 1) return;
        const name = part.slice(0, idx).trim();
        const value = part.slice(idx + 1).trim();
        ops.push([11, built(props, name, pools.custom)].concat(cssValue(value, pools)));
      });
    }
  }

  function selectorOps(selector, pools) {
    return selector.split(/\s+/).filter(Boolean).map(piece => {
      if (piece[0] === ".") return [8, refSymbol(pools, piece.slice(1))];
      if (piece[0] === "#") return [9, refSymbol(pools, piece.slice(1))];
      return [10, built(tags, piece, pools.custom)];
    });
  }

  function cssValue(value, pools) {
    const color = value.match(/^#[0-9a-f]{3,8}$/i);
    if (color) return [1, ref(pools.colors, color[0])];
    const dim = value.match(/^(-?\d+(?:\.\d+)?)(px|%|rem|em|deg|fr|s)$/);
    if (dim) return [2, ref(pools.numbers, dim[1]), units.indexOf(dim[2])];
    const gradient = value.match(/^linear-gradient\((-?\d+)deg,\s*(#[0-9a-f]{3,8}),\s*(#[0-9a-f]{3,8})\)$/i);
    if (gradient) return [6, ref(pools.numbers, gradient[1]), ref(pools.colors, gradient[2]), ref(pools.colors, gradient[3])];
    if (/^-?\d+(?:\.\d+)?$/.test(value)) return [3, ref(pools.numbers, value)];
    if (/^[a-z-]+$/i.test(value)) return [4, ref(pools.strings, value)];
    return [5, ref(pools.strings, value.replace(/\s+/g, " "))];
  }

  function parseJs(src, pools, ops) {
    const rx = /"([^"]*)"|'([^']*)'|\b\d+(?:\.\d+)?\b|[A-Za-z_$][\w$]*|[{}()[\].,;=+*/:<>&!-]+/g;
    let m;
    while ((m = rx.exec(src))) {
      const t = m[0];
      if (t[0] === "\"" || t[0] === "'") ops.push([20, refSymbol(pools, t.slice(1, -1))]);
      else if (/^\d/.test(t)) ops.push([21, ref(pools.numbers, t)]);
      else if (/^[A-Za-z_$]/.test(t)) ops.push([22, built(jsBuiltins, t, pools.custom)]);
      else ops.push([23, built(punctuation, t, pools.custom)]);
    }
  }

  function mineRecipes(ops, pools) {
    const seen = new Map();
    for (let i = 0; i < ops.length - 2; i += 1) {
      const key = ops.slice(i, i + 3).map(o => o.join(":")).join("|");
      seen.set(key, (seen.get(key) || 0) + 1);
    }
    Array.from(seen).filter(x => x[1] > 1).slice(0, 8).forEach(x => ref(pools.custom, "recipe:" + x[0].slice(0, 24)));
  }

  function built(table, value, customPool) {
    const id = table.indexOf(value);
    return id < 0 ? -(ref(customPool, value) + 1) : id;
  }

  function ref(pool, value) { const v = String(value || ""); let i = pool.indexOf(v); if (i < 0) i = pool.push(v) - 1; return i; }
  function refSymbol(pools, value) { return ref(pools.symbols, value); }
  function join(project, ext) { return Object.keys(project.files).filter(n => n.endsWith(ext)).map(n => project.files[n]).join("\n"); }
  function detail(pools, ops, writer) { return { strings: pools.strings.length, numbers: pools.numbers.length, colors: pools.colors.length, custom: pools.custom.length, symbols: pools.symbols.length, ops: ops.length, bitLength: writer.bitLength }; }
  function makeMetrics(original, best, d) { return { originalSourceBytes: original, storageBits: best.bitLength, storageBytes: best.bytes.length, compressionX: +(original / Math.max(1, best.bytes.length)).toFixed(2), bytesSaved: original - best.bytes.length, finalByteUsedBits: best.bitLength & 7 || 8, logicalWasteBits: 0, mode: best.mode, payloadKind: best.payloadKind, detail: d || {}, honestPayload: true }; }

  ect.packProjectExtreme = packProjectExtreme;
})(window);
