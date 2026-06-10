// B"H
(function forgeCore(root) {
  const forge = root.MerkavaForge = root.MerkavaForge || {};
  const encoder = new TextEncoder();

  forge.seed = {
    html: `<article class="card"><h2>Awtsmoos Bytecode Garden</h2><p>The preview vessel begins as HTML, receives CSS robes, then JS breath.</p><button id="ignite">Ignite</button><output id="spark">waiting...</output></article>`,
    css: `.card{padding:28px;border-radius:24px;background:linear-gradient(135deg,#08111f,#14383a);box-shadow:0 24px 80px #0008;color:#eaffff}.card h2{color:#73fff2}.card button{border:0;border-radius:999px;padding:10px 16px;background:#73fff2;color:#001;font-weight:900}.card output{display:block;margin-top:16px}`,
    js: `const spark = document.getElementById("spark");
const button = document.getElementById("ignite");
let count = 0;
button.addEventListener("click", function awaken() {
  count = count + 1;
  spark.textContent = "B'H custom bytecode pulse #" + count;
});
syscall(0, "Preview app compiled and breathed into the vessel.");`
  };

  /**
   * The Awtsmoos turns plain declarations into living DOM vessels.
   * @param {object|string} node UI declaration or text.
   * @returns {Node} Rendered node.
   */
  forge.render = function render(node) {
    if (typeof node === "string") return document.createTextNode(node);
    const element = document.createElement(node.tag || "div");
    Object.entries(node.attrs || {}).forEach(function put(entry) {
      const key = entry[0];
      const value = entry[1];
      if (key === "class") element.className = value;
      else if (key.startsWith("on") && typeof value === "function") element.addEventListener(key.slice(2), value);
      else element.setAttribute(key, value);
    });
    (node.children || []).map(forge.render).forEach(function add(child) {
      element.appendChild(child);
    });
    return element;
  };

  /**
   * Encodes a string into bytes, sparks counted after speech descends.
   * @param {string} text Source text.
   * @returns {number[]} Byte list.
   */
  forge.bytes = function bytes(text) {
    return Array.from(encoder.encode(text));
  };

  /**
   * Builds the custom web bytecode vessel beside native Merkava bytecode.
   * @param {{html:string,css:string,js:string}} parts Source bundle.
   * @param {object} compiled VM metadata.
   * @returns {object} Bytecode container.
   */
  forge.makeBytecode = function makeBytecode(parts, compiled) {
    const sections = { html: forge.bytes(parts.html), css: forge.bytes(parts.css), js: forge.bytes(parts.js) };
    const totalBytes = Object.values(sections).reduce(function total(sum, section) {
      return sum + section.length;
    }, 0);
    return { magic: "AWTS-WEB-BYTECODE", version: 1, totalBytes, sections, compiled: compiled || {} };
  };

  /**
   * Runs JavaScript through Merkava against the preview document.
   * @param {string} source JavaScript source.
   * @param {Document} previewDocument Preview DOM document.
   * @param {Function} log Log sink.
   * @returns {Promise<object>} VM metadata.
   */
  forge.runVm = async function runVm(source, previewDocument, log) {
    if (!root.Merkava) return { status: "SDK_MISSING", value: null, ramObjects: 0 };
    await root.Merkava.init();
    const active = await root.Merkava.run(source, {
      debug: true,
      ramLimit: 5000,
      context: { document: previewDocument, window: previewDocument.defaultView, console },
      hostAPI: { 0: function hostLog() { log(Array.from(arguments).join(" ")); } },
      importResolver: async function importResolver(specifier) {
        return { code: `syscall(0, "Imported ${specifier}");` };
      }
    });
    const result = await active.done;
    return {
      status: result.status,
      value: result.value,
      ramObjects: active.memory && active.memory.ram ? active.memory.ram.size : 0
    };
  };
})(window);
