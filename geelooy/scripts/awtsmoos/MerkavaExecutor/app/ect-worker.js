// B"H
/* eslint-disable no-restricted-globals */
(function ectWorkerBridge(root) {
  importScripts(
    "/scripts/awtsmoos/MerkavaASTParser/parser-core.js",
    "/scripts/awtsmoos/MerkavaExecutor/app/id-tables/roots.js?v=28",
    "/scripts/awtsmoos/MerkavaExecutor/app/id-tables/members-core.js?v=28",
    "/scripts/awtsmoos/MerkavaExecutor/app/id-tables/members-browser.js?v=28",
    "/scripts/awtsmoos/MerkavaExecutor/app/id-tables/members-graphics.js?v=28",
    "/scripts/awtsmoos/MerkavaExecutor/app/id-tables/html-css.js?v=28",
    "/scripts/awtsmoos/MerkavaExecutor/app/id-tables/syntax.js?v=28",
    "/scripts/awtsmoos/MerkavaExecutor/app/id-tables/index.js?v=28",
    "/scripts/awtsmoos/MerkavaExecutor/app/ect-compiler-core.js?v=28",
    "/scripts/awtsmoos/MerkavaExecutor/app/ect-storage-codec.js?v=28"
  );

  /** B"H. Worker bridge: parser + tables + modular compiler + storage codec. */
  root.onmessage = async event => {
    try {
      const Parser = await root.MerkavahParserPromise;
      root.postMessage(root.AwtsEctCompiler.compileProject(event.data.project, Parser));
    } catch (error) {
      root.postMessage(errorResult(event.data && event.data.project, error));
    }
  };

  function errorResult(project, error) {
    return {
      bytes: [],
      byteCount: 0,
      bitLength: 0,
      metrics: {
        originalSourceBytes: projectBytes(project || { files: {} }),
        storageBytes: 0,
        storageBits: 0,
        compressionX: 0,
        mode: "worker parser error",
        payloadKind: String(error && error.message || error),
        detail: { ops: 0, rawOps: 0, pools: {} }
      },
      universe: { error: String(error && error.stack || error) }
    };
  }

  function projectBytes(project) {
    const enc = new TextEncoder();
    return enc.encode(Object.keys(project.files).map(name => "// FILE: " + name + "\n" + project.files[name]).join("\n\n")).length;
  }
})(typeof self !== "undefined" ? self : globalThis);
