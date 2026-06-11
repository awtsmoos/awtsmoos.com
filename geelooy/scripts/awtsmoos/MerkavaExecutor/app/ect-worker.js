// B"H
/* eslint-disable no-restricted-globals */
(function ectWorkerBridge(root) {
  const version = "45";
  const app = "/scripts/awtsmoos/MerkavaExecutor/app/";
  const parserCore = "/scripts/awtsmoos/MerkavaASTParser/parser-core.worker.js";

  /**
   * B"H. Worker-safe parser altar.
   *
   * The existing parser extensions were written for a browser global named
   * `window`. In a Worker, the truthful equivalent vessel is `self`; this shim
   * exposes that alias before importScripts. The document shim only gives the
   * parser-core loader its own URL, so base-path detection remains accurate.
   */
  if (typeof root.window === "undefined") root.window = root;
  if (typeof root.document === "undefined") {
    const origin = root.location && root.location.origin ? root.location.origin : "";
    root.document = { currentScript: { src: origin + parserCore } };
  }

  importScripts(
    parserCore,
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

  function errorResult(project, error) {
    return {
      error: String(error && error.message || error),
      bytes: [],
      byteCount: 0,
      bitLength: 0,
      metrics: {
        originalSourceBytes: projectBytes(project || { files: {} }),
        storageBytes: 0,
        storageBits: 0,
        ramBytes: 0,
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
