// B"H
(function forgeMain(root) {
  const forge = root.MerkavaForge = root.MerkavaForge || {};
  const state = { editors: {}, preview: null, bytecode: null };

  /**
   * Builds the scripts area. Three editors are the three rivers; preview and
   * bytecode are the two mirrors where the Awtsmoos reveals working form.
   * @returns {object} JSON UI schema.
   */
  function appSchema() {
    return { tag: "section", attrs: { class: "forgeGrid" }, children: [
      panel("HTML", "html"), panel("CSS", "css"), panel("JavaScript", "js"),
      { tag: "section", attrs: { class: "previewPanel" }, children: [
        { tag: "div", attrs: { class: "panelTitle" }, children: ["Virtual DOM Preview"] },
        { tag: "iframe", attrs: { id: "preview", title: "Merkava virtual DOM preview" } }
      ]},
      { tag: "section", attrs: { class: "bytePanel" }, children: [
        { tag: "div", attrs: { class: "panelTitle" }, children: ["Custom Bytecode"] },
        { tag: "pre", attrs: { id: "bytecode" }, children: ["compile to reveal bytes"] }
      ]},
      { tag: "section", attrs: { class: "logPanel" }, children: [
        { tag: "div", attrs: { class: "panelTitle" }, children: ["Merkava Logs"] },
        { tag: "pre", attrs: { id: "logs" }, children: ["B\"H ready"] }
      ]}
    ]};
  }

  function panel(title, key) {
    return { tag: "section", attrs: { class: "editorPanel" }, children: [
      { tag: "label", attrs: { class: "panelTitle", for: key }, children: [title] },
      { tag: "textarea", attrs: { id: key, spellcheck: "false" }, children: [forge.seed[key]] }
    ]};
  }

  function getParts() {
    return { html: state.editors.html.value, css: state.editors.css.value, js: state.editors.js.value };
  }

  function log(message) {
    const logs = document.getElementById("logs");
    logs.textContent += `\n${message}`;
    logs.scrollTop = logs.scrollHeight;
  }

  async function compileAndPreview() {
    const status = document.getElementById("status");
    status.textContent = "compiling";
    const parts = getParts();
    const previewDocument = state.preview.reset(parts);
    try {
      const output = await forge.compileScripts(parts, { previewDocument, log });
      state.bytecode = output.bytecode;
      document.getElementById("bytecode").textContent = forge.printBytecode(output.bytecode);
      status.textContent = output.result.status.toLowerCase();
    } catch (error) {
      status.textContent = "shattered";
      log(error.message || String(error));
    }
  }

  function bind() {
    state.editors.html = document.getElementById("html");
    state.editors.css = document.getElementById("css");
    state.editors.js = document.getElementById("js");
    state.preview = new forge.PreviewStage(document.getElementById("preview"));
    Object.values(state.editors).forEach(function listen(editor) {
      editor.addEventListener("input", compileAndPreview);
    });
    compileAndPreview();
  }

  forge.replaceWithSchema(document.getElementById("app"), appSchema());
  bind();
})(window);
