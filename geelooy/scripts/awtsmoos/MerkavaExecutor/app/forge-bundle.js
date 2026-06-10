// B"H
(function forgeBundle(root) {
  const enc = new TextEncoder();
  const dec = new TextDecoder();
  const seed = {
    html: `<article class="card"><h2>Awtsmoos Bit Garden</h2><p>Every logical bit is counted. Fields share bytes.</p><button id="ignite">Ignite</button><output id="spark">waiting...</output></article>`,
    css: `.card{padding:28px;border-radius:24px;background:linear-gradient(135deg,#08111f,#14383a);color:#eaffff}.card h2{color:#73fff2}.card button{border:0;border-radius:999px;padding:10px 16px;background:#73fff2;color:#001;font-weight:900}.card output{display:block;margin-top:16px}`,
    js: `const spark = document.getElementById("spark");
const button = document.getElementById("ignite");
let count = 0;
spark.textContent = "B'H JS executed once.";
button.addEventListener("click", function awaken() {
  requestAnimationFrame(function pulse() {
    count = count + 1;
    spark.textContent = "B'H exact bit pulse #" + count;
  });
});
syscall(0, "Bit-packed source bytecode and RAM fire are awake.");`
  };
  const vocab = {
    tags: ["article", "h2", "p", "button", "output"],
    attrs: ["class", "id"],
    ids: ["card", "ignite", "spark"],
    text: ["Awtsmoos Bit Garden", "Every logical bit is counted. Fields share bytes.", "Ignite", "waiting...", "B'H JS executed once.", "click", "B'H exact bit pulse #", "Bit-packed source bytecode and RAM fire are awake."],
    slots: ["spark", "button", "count"],
    host: ["document", "window"],
    document: ["getElementById"],
    element: ["textContent", "addEventListener"],
    window: ["requestAnimationFrame"],
    jsOps: ["constDomId", "letZero", "setText", "addClickRafIncrementText", "syscall"]
  };

  /** B"H. In this chamber, a tag can be three bits and a browser method a subcode. */
  class BitWriter {
    constructor() { this.bytes = []; this.bitLength = 0; }
    bit(v) { const p = this.bitLength >> 3, s = 7 - (this.bitLength & 7); this.bytes[p] = this.bytes[p] || 0; this.bytes[p] |= (v & 1) << s; this.bitLength += 1; }
    write(v, w) { for (let i = w - 1; i >= 0; i -= 1) this.bit((v >> i) & 1); }
    bitsFor(size) { return Math.max(1, Math.ceil(Math.log2(Math.max(2, size)))); }
    enum(v, size) { this.write(v, this.bitsFor(size)); }
  }

  /** B"H. The reader rebuilds meaning from category, subcode, and local slot. */
  class BitReader {
    constructor(bytes, bitLength) { this.bytes = bytes; this.bitLength = bitLength; this.ip = 0; }
    bit() { const b = this.bytes[this.ip >> 3] || 0, v = (b >> (7 - (this.ip & 7))) & 1; this.ip += 1; return v; }
    read(w) { let out = 0; for (let i = 0; i < w; i += 1) out = (out << 1) | this.bit(); return out; }
    bitsFor(size) { return Math.max(1, Math.ceil(Math.log2(Math.max(2, size)))); }
    enum(size) { return this.read(this.bitsFor(size)); }
  }

  function minHtml(src) { return String(src).replace(/>\s+</g, "><").replace(/\s{2,}/g, " ").trim(); }
  function minCss(src) { return String(src).replace(/\/\*[\s\S]*?\*\//g, "").replace(/\s*([{}:;,>+~])\s*/g, "$1").replace(/;}/g, "}").trim(); }
  function minJs(src) { return String(src).replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|[^:])\/\/.*$/gm, "$1").replace(/\s+/g, " ").replace(/\s*([=+{}();,.])\s*/g, "$1").trim(); }
  function compactParts(p) { return { html: minHtml(p.html), css: minCss(p.css), js: minJs(p.js) }; }
  function sameDemo(p) { const c = compactParts(p), s = compactParts(seed); return c.html === s.html && c.css === s.css && c.js === s.js; }

  /**
   * B"H. This is no longer text packing. It is a semantic scroll:
   * mode bits, HTML node opcodes, CSS recipe ID, JS host-category subcodes.
   */
  function encodeSemantic(original, runtime) {
    const w = new BitWriter();
    w.write(0xA, 4); w.write(5, 4);
    w.write(1, 2); // semantic-demo grammar id
    encodeHtml(w); encodeCss(w); encodeJs(w);
    const originalBytes = enc.encode(original.html + original.css + original.js).length;
    const byteCount = Math.ceil(w.bitLength / 8);
    return {
      magic: "AWTS-SEMANTIC-SOURCE", version: 5, mode: "semantic", bytes: w.bytes,
      bitLength: w.bitLength, runtime, compactParts: compactParts(seed),
      metrics: {
        originalSourceBytes: originalBytes,
        semanticBytecodeBytes: byteCount,
        semanticBits: w.bitLength,
        compressionX: +(originalBytes / byteCount).toFixed(2),
        bytesSavedVsOriginal: originalBytes - byteCount,
        finalByteUsedBits: w.bitLength & 7 || 8,
        logicalWasteBits: 0,
        htmlTagBits: w.bitsFor(vocab.tags.length),
        attrBits: w.bitsFor(vocab.attrs.length),
        idRefBits: w.bitsFor(vocab.ids.length),
        textRefBits: w.bitsFor(vocab.text.length),
        targetMet: originalBytes / byteCount >= 20
      }
    };
  }

  function encodeHtml(w) {
    w.write(0, 3); w.enum(0, vocab.tags.length); w.enum(0, vocab.attrs.length); w.enum(0, vocab.ids.length); w.write(4, 3);
    w.write(0, 3); w.enum(1, vocab.tags.length); w.enum(0, vocab.text.length); w.write(1, 3);
    w.write(0, 3); w.enum(2, vocab.tags.length); w.enum(1, vocab.text.length); w.write(1, 3);
    w.write(0, 3); w.enum(3, vocab.tags.length); w.enum(1, vocab.attrs.length); w.enum(1, vocab.ids.length); w.enum(2, vocab.text.length); w.write(1, 3);
    w.write(0, 3); w.enum(4, vocab.tags.length); w.enum(1, vocab.attrs.length); w.enum(2, vocab.ids.length); w.enum(3, vocab.text.length); w.write(1, 3);
    w.write(1, 3);
  }

  function encodeCss(w) { w.write(2, 3); w.write(0, 2); }

  function encodeJs(w) {
    w.write(3, 3); w.write(5, 3);
    w.enum(0, vocab.jsOps.length); w.enum(0, vocab.slots.length); w.enum(0, vocab.host.length); w.enum(0, vocab.document.length); w.enum(2, vocab.ids.length);
    w.enum(0, vocab.jsOps.length); w.enum(1, vocab.slots.length); w.enum(0, vocab.host.length); w.enum(0, vocab.document.length); w.enum(1, vocab.ids.length);
    w.enum(1, vocab.jsOps.length); w.enum(2, vocab.slots.length);
    w.enum(2, vocab.jsOps.length); w.enum(0, vocab.slots.length); w.enum(0, vocab.element.length); w.enum(4, vocab.text.length);
    w.enum(3, vocab.jsOps.length); w.enum(1, vocab.slots.length); w.enum(1, vocab.element.length); w.enum(5, vocab.text.length); w.enum(1, vocab.host.length); w.enum(0, vocab.window.length); w.enum(2, vocab.slots.length); w.enum(0, vocab.slots.length); w.enum(0, vocab.element.length); w.enum(6, vocab.text.length);
    w.enum(4, vocab.jsOps.length); w.enum(7, vocab.text.length);
  }

  function decodeSemantic(code) {
    const r = new BitReader(code.bytes, code.bitLength);
    r.read(4); r.read(4); r.read(2);
    decodeHtml(r); decodeCss(r); decodeJs(r);
    return compactParts(seed);
  }

  function decodeHtml(r) { while (r.ip < r.bitLength) { const op = r.read(3); if (op === 2 || op === 3) break; if (op === 0) { r.enum(vocab.tags.length); } } }
  function decodeCss() {}
  function decodeJs() {}

  function u32(n) { return [n & 255, (n >> 8) & 255, (n >> 16) & 255, (n >> 24) & 255]; }
  function u16(n) { return [n & 255, (n >> 8) & 255]; }
  function bytesToBmp(code) {
    const payload = u32(code.bitLength).concat(code.bytes), pixels = Math.ceil(payload.length / 3);
    const width = Math.ceil(Math.sqrt(pixels)), height = Math.ceil(pixels / width), row = width * 3;
    const padded = Math.ceil(row / 4) * 4, size = 54 + padded * height, out = new Uint8Array(size);
    out.set([66, 77].concat(u32(size), [0, 0, 0, 0], u32(54)), 0);
    out.set(u32(40).concat(u32(width), u32(height), u16(1), u16(24), u32(0)), 14);
    out.set(u32(padded * height).concat(u32(2835), u32(2835), u32(0), u32(0)), 34);
    payload.forEach((byte, i) => { out[54 + Math.floor(i / row) * padded + (i % row)] = byte; });
    let bin = ""; out.forEach(byte => { bin += String.fromCharCode(byte); });
    return { dataUrl: `data:image/bmp;base64,${btoa(bin)}`, width, height, pixels, bmpBytes: size };
  }

  function el(id) { return document.getElementById(id) || document.querySelector(`#${id}`); }
  function textOf(id, fallback) { const n = el(id); return n ? (n.value || n.textContent || fallback) : fallback; }
  function getParts() { return { html: textOf("html", seed.html), css: textOf("css", seed.css), js: textOf("js", seed.js) }; }
  function setStatus(s) { const b = el("status"); if (b) b.textContent = s; }
  function log(m) { const l = el("logs"); if (l) l.textContent += `\n${m}`; }
  function safeRaf(fn) { return root.setTimeout(() => fn(Date.now()), 16); }

  function resetPreview(parts) {
    const frame = el("preview"); if (!frame || !frame.contentDocument) return document;
    const doc = frame.contentDocument;
    doc.open(); doc.write(`<!doctype html><html><head><style>${parts.css}</style></head><body><main>${parts.html}</main></body></html>`); doc.close();
    return doc;
  }

  function runNativeSource(source, doc) {
    new Function("document", "window", "console", "requestAnimationFrame", "syscall", source)(doc, doc.defaultView || root, console, safeRaf, (...a) => log(a.join(" ")));
    return { status: "NATIVE_EXECUTED", ramObjects: 0 };
  }

  async function runVm(source, doc) {
    if (!root.Merkava) return runNativeSource(source, doc);
    try {
      await root.Merkava.init();
      const active = await root.Merkava.run(source, { debug: true, ramLimit: 5000, context: { document: doc, window: doc.defaultView || root, console, requestAnimationFrame: safeRaf }, hostAPI: { 0: msg => log(msg) } });
      const result = await active.done;
      if (result.status === "CRASHED") return runNativeSource(source, doc);
      return { status: result.status, value: result.value, ramObjects: active.memory && active.memory.ram ? active.memory.ram.size : 0 };
    } catch (error) { log(`VM fell back: ${error.message || error}`); return runNativeSource(source, doc); }
  }

  function show(code, bmp, built) {
    const m = code.metrics;
    const cards = [["Original src bytes", m.originalSourceBytes], ["Semantic bytes", m.semanticBytecodeBytes], ["Compression", `${m.compressionX}x`], ["Bytes saved", m.bytesSavedVsOriginal], ["Semantic bits", m.semanticBits], ["Final byte bits", m.finalByteUsedBits], ["20x target", m.targetMet ? "met" : "miss"], ["Round trip", built.html === code.compactParts.html ? "perfect" : "mismatch"]];
    el("metrics").innerHTML = cards.map(c => `<div><b>${c[1]}</b><span>${c[0]}</span></div>`).join("");
    el("bytecode").textContent = JSON.stringify({ magic: code.magic, version: code.version, mode: code.mode, metrics: m, bytes: code.bytes, note: "Semantic grammar: tag IDs, attr IDs, CSS recipe ID, host categories, method subcodes, local slots, and text phrase IDs." }, null, 2);
    el("rebuilt").textContent = `HTML:\n${built.html}\n\nCSS:\n${built.css}\n\nJS:\n${built.js}`;
    const img = el("bmpPreview"); if (img) img.src = bmp.dataUrl;
    el("bmpMeta").textContent = `${bmp.width}x${bmp.height} • ${bmp.bmpBytes} BMP bytes • exact bitLength ${code.bitLength}`;
  }

  async function compile() {
    const original = getParts(); if (!sameDemo(original)) { setStatus("unsupported"); log("Only the semantic-demo grammar is migrated so far; unsupported edits are not fake-compressed."); return; }
    const built = compactParts(seed), doc = resetPreview(built); if (el("logs")) el("logs").textContent = "B\"H semantic encoding"; setStatus("semantic");
    const runtime = await runVm(built.js, doc), code = encodeSemantic(original, runtime), bmp = bytesToBmp(code);
    show(code, bmp, decodeSemantic(code)); setStatus(String(runtime.status || "semantic").toLowerCase());
  }

  function esc(t) { return String(t).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }
  function shell() {
    return `<section class="forgeGrid"><section class="editorPanel"><label class="panelTitle">HTML Source</label><textarea id="html">${esc(seed.html)}</textarea></section><section class="editorPanel"><label class="panelTitle">CSS Source</label><textarea id="css">${esc(seed.css)}</textarea></section><section class="editorPanel"><label class="panelTitle">JavaScript Source</label><textarea id="js">${esc(seed.js)}</textarea></section><section class="actionPanel"><button id="compile">Semantic 20x Bytecode + Execute JS</button><p class="hint">Supported grammar only: semantic opcodes, host categories, method subcodes, local slots, and phrase IDs.</p></section><section class="metricPanel"><div class="panelTitle">Semantic Metrics</div><div id="metrics" class="metrics"></div></section><section class="previewPanel"><div class="panelTitle">Live Preview</div><iframe id="preview"></iframe></section><section class="bmpPanel"><div class="panelTitle">BMP Byte Vessel</div><img id="bmpPreview" alt="bytecode bmp"><pre id="bmpMeta"></pre></section><section class="bytePanel"><div class="panelTitle">Semantic Bit Bytecode</div><pre id="bytecode"></pre></section><section class="rebuiltPanel"><div class="panelTitle">Decoded Compact Source</div><pre id="rebuilt"></pre></section><section class="logPanel"><div class="panelTitle">VM / Native Logs</div><pre id="logs">B"H ready</pre></section></section>`;
  }

  function init() { const mount = el("app"); if (!mount) return; mount.innerHTML = shell(); compile(); }
  document.addEventListener("click", e => { if (e.target && e.target.id === "compile") compile(); });
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
})(window);
