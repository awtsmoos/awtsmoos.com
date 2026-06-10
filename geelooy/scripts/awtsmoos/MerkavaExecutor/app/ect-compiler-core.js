// B"H
(function ectCompilerCoreLoader(root) {
  const files = [
    "util.js",
    "text-codec.js",
    "bit-writer.js",
    "html-compiler.js",
    "css-compiler.js",
    "js-compiler.js",
    "op-writer.js",
    "project-compiler.js"
  ];

  /**
   * B"H. Tiny loader for the modular compiler. The giant core was shattered;
   * now each vessel has one service, and this file only gathers them in order.
   */
  function load() {
    if (root.AwtsEctCompiler && root.AwtsEctCompiler.compileProject) return;
    if (typeof require === "function") {
      files.forEach(name => require("./compiler/" + name));
      return;
    }
    if (typeof importScripts === "function") {
      importScripts.apply(null, files.map(name => "/scripts/awtsmoos/MerkavaExecutor/app/compiler/" + name + "?v=28"));
    }
  }

  load();
})(typeof self !== "undefined" ? self : globalThis);
