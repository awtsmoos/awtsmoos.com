// B"H
(function forgeUi(root) {
  const forge = root.MerkavaForge;
  const state = { editors: {}, mount: null, previewFrame: null, showcase: null };

  /** @param {string} selector CSS selector. @returns {Element|null} Element. */
  function find(selector) {
    return (state.mount && state.mount.querySelector(selector)) || document.querySelector(selector);
  }

  /** @param {string} status Status text. */
  function setStatus(status) {
    const badge = document.querySelector("#status");
    if (badge) badge.textContent = status;
  }

  /** @param {string} message Log text. */
  function log(message) {
    const target = find("#logs");
    if (target) target.textContent += `\n${message}`;
  }

  /** @returns {{html:string,css:string,js:string}} Current source parts. */
  function getParts() {
    return { html: state.editors.html.value, css: state.editors.css.value, js: state.editors.js.value };
  }

  /** @param {{html:string,css:string}} parts Source parts. @returns {Document} Preview document. */
  function resetPreview(parts) {
    const doc = state.previewFrame.contentDocument;
    doc.open();
    doc.write(`<!doctype html><html><head><style>${parts.css}</style></head><body><main>${parts.html}</main></body></html>`);
    doc.close();
    return doc;
  }

  /** @param {object} showcase Compilation result. */
  function show(showcase) {
    find("#metrics").innerHTML = forge.metricCards(showcase).map(card => `<div><b>${card[1]}</b><span>${card[0]}</span></div>`).join("");
    find("#bytecode").textContent = forge.printBytecode({ magic: showcase.sourceBytecode.magic, version: 2, metrics: showcase.sourceBytecode.metrics, records: showcase.sourceBytecode.records });
    find("#rebuilt").textContent = `HTML:\n${showcase.rebuilt.html}\n\nCSS:\n${showcase.rebuilt.css}\n\nJS:\n${showcase.rebuilt.js}`;
    find("#bmpPreview").src = showcase.bmp.dataUrl;
    find("#bmpMeta").textContent = `${showcase.bmp.width}x${showcase.bmp.height} BMP • ${showcase.bmp.bmpBytes} bytes`;
  }

  /** Compiles source-scroll bytes, BMP pixels, and RAM VM fire. */
  async function compileAndPreview() {
    const parts = getParts();
    const previewDocument = resetPreview(parts);
    setStatus("compiling");
    find("#logs").textContent = "B\"H compiling";
    state.showcase = await forge.compileForge(parts, { previewDocument, log });
    show(state.showcase);
    setStatus(String(state.showcase.runtime.status || "compiled").toLowerCase());
  }

  /** @returns {string} Application shell. */
  function shell() {
    return `<section class="forgeGrid">
      <section class="editorPanel"><label class="panelTitle" for="html">HTML Source</label><textarea id="html" spellcheck="false"></textarea></section>
      <section class="editorPanel"><label class="panelTitle" for="css">CSS Source</label><textarea id="css" spellcheck="false"></textarea></section>
      <section class="editorPanel"><label class="panelTitle" for="js">JavaScript Source</label><textarea id="js" spellcheck="false"></textarea></section>
      <section class="actionPanel"><button id="compile">Compile Source Bytes + BMP + RAM VM</button><p class="hint">Two bytecode worlds: reversible source scrolls, then executable RAM fire.</p></section>
      <section class="metricPanel"><div class="panelTitle">Metrics</div><div id="metrics" class="metrics"></div></section>
      <section class="previewPanel"><div class="panelTitle">Live HTML/CSS/JS Preview</div><iframe id="preview" title="Merkava preview"></iframe></section>
      <section class="bmpPanel"><div class="panelTitle">Packed Bytes as BMP</div><img id="bmpPreview" alt="Bytecode BMP pixels" /><pre id="bmpMeta"></pre></section>
      <section class="bytePanel"><div class="panelTitle">Source Bytecode Opcodes</div><pre id="bytecode">waiting</pre></section>
      <section class="rebuiltPanel"><div class="panelTitle">Decoded Back to Source</div><pre id="rebuilt">waiting</pre></section>
      <section class="logPanel"><div class="panelTitle">RAM VM Logs</div><pre id="logs">B"H ready</pre></section>
    </section>`;
  }

  /** Boots the UI and immediately showcases the full bytecode path. */
  function init() {
    state.mount = document.querySelector("#app");
    if (!state.mount) return;
    state.mount.innerHTML = shell();
    state.editors.html = find("#html");
    state.editors.css = find("#css");
    state.editors.js = find("#js");
    state.previewFrame = find("#preview");
    state.editors.html.value = forge.seed.html;
    state.editors.css.value = forge.seed.css;
    state.editors.js.value = forge.seed.js;
    compileAndPreview();
  }

  document.addEventListener("click", event => { if (event.target && event.target.id === "compile") compileAndPreview(); });
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})(window);
