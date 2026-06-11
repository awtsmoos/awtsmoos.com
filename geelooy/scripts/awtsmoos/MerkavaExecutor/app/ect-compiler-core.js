// B"H
(function ectCompilerCoreLoader(root) {
  const nodeFiles = [
    "util.js",
    "text-codec.js",
    "bit-writer.js",
    "html-compiler.js",
    "css-compiler.js",
    "js-compiler.js",
    "op-writer.js",
    "reconstructor.js",
    "project-compiler.js"
  ];
  const workerFiles = nodeFiles.map(name => name === "js-compiler.js" ? "js-compiler.worker.js" : name);

  /**
   * B"H. Tiny loader for the modular compiler. Node drinks the full readable
   * compiler; browser workers drink the compact served vessel so local static
   * file-size gates do not starve importScripts.
   */
  function load() {
    if (root.AwtsEctCompiler && root.AwtsEctCompiler.compileProject) return;
    if (typeof require === "function") {
      nodeFiles.forEach(name => require("./compiler/" + name));
      return;
    }
    if (typeof importScripts === "function") {
      importScripts.apply(null, workerFiles.map(name => "/scripts/awtsmoos/MerkavaExecutor/app/compiler/" + name + "?v=45"));
    }
  }

  load();
})(typeof self !== "undefined" ? self : globalThis);
