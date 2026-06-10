// B"H
(function semanticUi(root) {
  const awt = root.AwtsSemantic;
  const state = { mount: null, frame: null };

  function el(id) { return document.getElementById(id); }
  function log(message) { const target = el("logs"); if (target) target.textContent += `\n${message}`; }
  function status(text) { const badge = el("status"); if (badge) badge.textContent = text; }
  function esc(text) { return String(text).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }
  function parts() { return { html: el("html").value, css: el("css").value, js: el("js").value }; }

  /**
   * B"H. Recreates the preview from decoded compact source, then lets the typed
   * RAM image operate through host-safe DOM opcodes.
   */
  function resetPreview(source) {
    const doc = state.frame.contentDocument;
    doc.open();
    doc.write(`<!doctype html><html><head><style>${source.css}</style></head><body><main>${source.html}</main></body></html>`);
    doc.close();
    return doc;
  }

  function showCards(code, ram, bmp) {
    const m = code.metrics;
    const cards = [
      ["Original src bytes", m.originalSourceBytes],
      ["Semantic bytes", m.semanticBytecodeBytes],
      ["Compression", `${m.compressionX}x`],
      ["Storage bits", m.semanticBits],
      ["RAM image bytes", ram.ramBytes],
      ["RAM op count", ram.opCount],
      ["Engine", ram.engine],
      ["20x target", m.targetMet ? "met" : "miss"]
    ];
    el("metrics").innerHTML = cards.map(card => `<div><b>${card[1]}</b><span>${card[0]}</span></div>`).join("");
    el("bmpPreview").src = bmp.dataUrl;
    el("bmpMeta").textContent = `${bmp.width}x${bmp.height} BMP • ${bmp.bmpBytes} bytes • exact bits ${code.bitLength}`;
  }

  function showCode(code, ram, decoded) {
    el("bytecode").textContent = JSON.stringify({
      magic: code.magic,
      version: code.version,
      mode: code.mode,
      metrics: code.metrics,
      storageBytes: code.bytes,
      semanticTables: awt.explainSemantic(code),
      ramImage: { opcodes: Array.from(ram.image.opcodes), operands: Array.from(ram.image.operands) }
    }, null, 2);
    el("rebuilt").textContent = `HTML:\n${decoded.html}\n\nCSS:\n${decoded.css}\n\nJS:\n${decoded.js}`;
  }

  function compile() {
    el("logs").textContent = "B\"H semantic compile";
    status("semantic compile");
    const code = awt.encodeSemantic(parts(), { wantedEngine: "Merkava typed RAM" });
    if (code.unsupported) { status("unsupported"); log(code.reason); return; }
    const decoded = awt.decodeSemantic(code);
    const doc = resetPreview(decoded);
    const image = awt.lowerToRam(code);
    const runtime = awt.executeRam(image, doc, log);
    const bmp = awt.bytesToBmp(code);
    showCards(code, Object.assign({ image }, runtime), bmp);
    showCode(code, Object.assign({ image }, runtime), decoded);
    status(runtime.status.toLowerCase());
  }

  function shell() {
    return `<section class="forgeGrid"><section class="editorPanel"><label class="panelTitle">HTML Source</label><textarea id="html">${esc(awt.seed.html)}</textarea></section><section class="editorPanel"><label class="panelTitle">CSS Source</label><textarea id="css">${esc(awt.seed.css)}</textarea></section><section class="editorPanel"><label class="panelTitle">JavaScript Source</label><textarea id="js">${esc(awt.seed.js)}</textarea></section><section class="actionPanel"><button id="compile">ECT Semantic Storage + RAM Execute</button><p class="hint">HTML tree, typed CSS values, JS host categories, typed-array RAM image, no native generic CALL.</p></section><section class="metricPanel"><div class="panelTitle">ECT Metrics</div><div id="metrics" class="metrics"></div></section><section class="previewPanel"><div class="panelTitle">Live Preview</div><iframe id="preview"></iframe></section><section class="bmpPanel"><div class="panelTitle">BMP Byte Vessel</div><img id="bmpPreview" alt="bytecode bmp"><pre id="bmpMeta"></pre></section><section class="bytePanel"><div class="panelTitle">Semantic Storage + RAM</div><pre id="bytecode"></pre></section><section class="rebuiltPanel"><div class="panelTitle">Decoded Compact Source</div><pre id="rebuilt"></pre></section><section class="logPanel"><div class="panelTitle">Execution Logs</div><pre id="logs">B"H ready</pre></section></section>`;
  }

  function init() {
    state.mount = el("app");
    if (!state.mount) return;
    state.mount.innerHTML = shell();
    state.frame = el("preview");
    compile();
  }

  document.addEventListener("click", event => { if (event.target && event.target.id === "compile") compile(); });
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
})(window);
