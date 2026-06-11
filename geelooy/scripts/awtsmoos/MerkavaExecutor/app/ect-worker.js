// B"H
/* eslint-disable no-restricted-globals */
(function ectWorkerBridge(root) {
  const version = "45";
  const app = "/scripts/awtsmoos/MerkavaExecutor/app/";

  /**
   * B"H. The worker is the small hidden chamber where uploaded source becomes
   * semantic binary. It must never drink stale cache while the page claims a new
   * engine; every import carries the same living version number.
   */
  importScripts(
    "/scripts/awtsmoos/MerkavaASTParser/parser-core.js",
    app + "id-tables/roots.js?v=" + version,
    app + "id-tables/members-core.js?v=" + version,
    app + "id-tables/members-browser.js?v=" + version,
    app + "id-tables/members-graphics.js?v=" + version,
    app + "id-tables/html-css.js?v=" + version,
    app + "id-tables/syntax.js?v=" + version,
    app + "id-tables/index.js?v=" + version,
    app + "ect-compiler-core.js?v=" + version,
    app + "ect-storage-codec.js?v=" + version
  );

  root.onmessage = async event => {
    try {
      const Parser = await root.MerkavahParserPromise;
      root.postMessage(root.AwtsEctCompiler.compileProject(event.data.project, Parser));
    } catch (error) {
      root.postMessage(errorResult(event.data && event.data.project, error));
    }
  };

  /** @param {{files:Record<string,string>}} project @param {Error} error */
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
        detail: { ops: 0, rawOps: 0, pools: {}, ram: { totalBytes: 0 } }
      },
      reconstruction: { proof: { reconstructable: false, unsupportedFragments: 1 } },
      universe: { error: String(error && error.stack || error) }
    };
  }

  function projectBytes(project) {
    const enc = new TextEncoder();
    return enc.encode(Object.keys(project.files).map(name => "// FILE: " + name + "\n" + project.files[name]).join("\n\n")).length;
  }
})(typeof self !== "undefined" ? self : globalThis);
