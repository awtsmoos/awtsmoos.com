// B"H
(function semanticTables(root) {
  const awt = root.AwtsSemantic = root.AwtsSemantic || {};

  /**
   * B"H. These are the fixed heavens: common web meaning that should not be
   * spelled in every app. Storage bytecode references their tiny local indices.
   */
  const tables = {
    tags: ["article", "h2", "p", "button", "output"],
    attrs: ["class", "id"],
    selectors: [".card", ".card h2", ".card button", ".card output"],
    props: ["padding", "border-radius", "background", "color", "font-weight", "display", "margin-top"],
    valueTypes: ["dimension", "color", "gradient", "keyword", "weight"],
    units: ["px", "deg"],
    numbers: [28, 24, 135, 10, 16, 900],
    colors: ["#08111f", "#14383a", "#eaffff", "#73fff2", "#001"],
    ids: ["card", "ignite", "spark"],
    phrases: [
      "Awtsmoos Bit Garden",
      "Every logical bit is counted. Fields share bytes.",
      "Ignite",
      "waiting...",
      "B'H JS executed once.",
      "click",
      "B'H exact bit pulse #",
      "Bit-packed source bytecode and RAM fire are awake."
    ],
    slots: ["spark", "button", "count"],
    host: ["document", "window", "element"],
    documentMethods: ["getElementById"],
    windowMethods: ["requestAnimationFrame"],
    elementMethods: ["textContent", "addEventListener"],
    jsOps: ["constDomId", "letZero", "setText", "bindClickRafIncText", "syscall"]
  };

  /** @param {string} source CSS source. @returns {string} compact CSS. */
  function minCss(source) {
    return String(source).replace(/\/\*[\s\S]*?\*\//g, "").replace(/\s*([{}:;,>+~])\s*/g, "$1").replace(/;}/g, "}").trim();
  }

  /** @param {string} source HTML source. @returns {string} compact HTML. */
  function minHtml(source) {
    return String(source).replace(/>\s+</g, "><").replace(/\s{2,}/g, " ").trim();
  }

  /** @param {string} source JS source. @returns {string} compact JS. */
  function minJs(source) {
    return String(source).replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|[^:])\/\/.*$/gm, "$1").replace(/\s+/g, " ").replace(/\s*([=+{}();,.])\s*/g, "$1").trim();
  }

  /** @param {{html:string,css:string,js:string}} parts Parts. */
  function compact(parts) {
    return { html: minHtml(parts.html), css: minCss(parts.css), js: minJs(parts.js) };
  }

  awt.tables = tables;
  awt.compact = compact;
})(window);
