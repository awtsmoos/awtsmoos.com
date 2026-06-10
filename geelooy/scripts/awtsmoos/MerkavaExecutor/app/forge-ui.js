// B"H
(function forgeUi(root) {
  const forge = root.MerkavaForge;
  const state = { editors: {}, previewFrame: null, bytecode: null, mount: null };

  /** @param {string} selector CSS selector. @returns {Element|null} Element. */
  function find(selector) {
    return (state.mount && state.mount.querySelector(selector)) || document.querySelector(selector);
  }

  /** @param {string} status Status label. */
  function setStatus(status) {
    const badge = document.querySelector("#status");
    if (badge) badge.textContent = status;
  }

  /** @param {string} message Log message. */
  function log(message) {
    const logs = find("#logs");
    if (!logs) return;
    logs.textContent += `\n${message}`;
    logs.scrollTop = logs.scrollHeight;
  }

  /** @returns {{html:string,css:string,js:string}} Current source sections. */
  function getParts() {
    return {
      html: state.editors.html ? state.editors.html.value : forge.seed.html,
      css: state.editors.css ? state.editors.css.value : forge.seed.css,
      js: state.editors.js ? state.editors.js.value : forge.seed.js
    };
  }

  /** @param {{html:string,css:string}} parts Source sections. @returns {Document|null} Preview document. */
  function resetPreview(parts) {
    if (!state.previewFrame || !state.previewFrame.contentDocument) return null;
    const doc = state.previewFrame.contentDocument;
    doc.open();
    doc.write(`<!doctype html><html><head><style>${parts.css}</style></head><body><main id="root">${parts.html}</main></body></html>`);
    doc.close();
    return doc;
  }

  /** @param {object} bytecode Bytecode vessel. */
  function showBytecode(bytecode) {
    const output = find("#bytecode");
    if (output) output.textContent = JSON.stringify(bytecode, null, 2);
  }

  /** Compiles source into custom bytecode and lets Merkava breathe JS into DOM. */
  async function compileAndPreview() {
    const parts = getParts();
    const previewDocument = resetPreview(parts) || document;
    setStatus("compiling");
    try {
      const compiled = await forge.runVm(parts.js, previewDocument, log);
      state.bytecode = forge.makeBytecode(parts, compiled);
      showBytecode(state.bytecode);
      setStatus(String(compiled.status || "compiled").toLowerCase());
    } catch (error) {
      state.bytecode = forge.makeBytecode(parts, { status: "VM_ERROR", error: error.message || String(error) });
      showBytecode(state.bytecode);
      setStatus("vm-error");
      log(error.message || String(error));
    }
  }

  /** @returns {string} HTML shell. */
  function shell() {
    return `<section class="forgeGrid">
      <section class="editorPanel"><label class="panelTitle" for="html">HTML</label><textarea id="html" spellcheck="false"></textarea></section>
      <section class="editorPanel"><label class="panelTitle" for="css">CSS</label><textarea id="css" spellcheck="false"></textarea></section>
      <section class="editorPanel"><label class="panelTitle" for="js">JavaScript</label><textarea id="js" spellcheck="false"></textarea></section>
      <section class="actionPanel"><button id="compile">Compile Bytecode + Preview</button><p class="hint">Breathe source into custom bytes, then let Merkava JS animate the preview vessel.</p></section>
      <section class="previewPanel"><div class="panelTitle">Virtual DOM Preview</div><iframe id="preview" title="Merkava virtual DOM preview"></iframe></section>
      <section class="bytePanel"><div class="panelTitle">Custom Bytecode</div><pre id="bytecode">compile to reveal bytes</pre></section>
      <section class="logPanel"><div class="panelTitle">Merkava Logs</div><pre id="logs">B"H ready</pre></section>
    </section>`;
  }

  /** Boots the Forge without trusting synthetic DOM id maps. */
  function init() {
    state.mount = document.querySelector("#app");
    if (!state.mount) return;
    state.mount.innerHTML = shell();
    state.editors.html = find("#html");
    state.editors.css = find("#css");
    state.editors.js = find("#js");
    state.previewFrame = find("#preview");
    if (state.editors.html) state.editors.html.value = forge.seed.html;
    if (state.editors.css) state.editors.css.value = forge.seed.css;
    if (state.editors.js) state.editors.js.value = forge.seed.js;
    resetPreview(getParts());
    state.bytecode = forge.makeBytecode(getParts(), { status: "READY" });
    showBytecode(state.bytecode);
    setStatus("ready");
  }

  document.addEventListener("click", function routeClick(event) {
    if (event.target && event.target.id === "compile") compileAndPreview();
  });
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})(window);
