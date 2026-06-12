// B"H
/* eslint-disable no-restricted-globals */
(function ectWorkerBridge(root) {
  const version = "50";
  const app = "/scripts/awtsmoos/MerkavaExecutor/app/";
  const parserCore = "/scripts/awtsmoos/MerkavaASTParser/parser-core.worker.js";

  /**
   * B"H. Worker-safe parser altar.
   *
   * Two compilations leave the vessel truthful: the first is maximum semantic
   * compression for storage/RAM metrics; the second preserves render text. The
   * visual preview also receives exact CSS as a render-only vessel, so Native,
   * Virtual DOM, and WebGL can be compared without inflating the compact bytes.
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
      const project = event.data.project;
      const compact = root.AwtsEctCompiler.compileProject(project, Parser, { preserveText: false, preservePublicSymbols: false });
      const renderable = root.AwtsEctCompiler.compileProject(project, Parser, { preserveText: true, preservePublicSymbols: true });
      compact.renderReconstruction = renderable.reconstruction;
      compact.renderCss = concatFiles(project, ".css");
      compact.renderJs = concatFiles(project, ".js");
      compact.renderMetrics = {
        storageBytes: renderable.byteCount,
        ramBytes: renderable.metrics && renderable.metrics.ramBytes,
        cssBytes: bytes(compact.renderCss),
        proof: renderable.reconstruction && renderable.reconstruction.proof
      };
      root.postMessage(compact);
    } catch (error) {
      root.postMessage(errorResult(event.data && event.data.project, error));
    }
  };

  function concatFiles(project, suffix) {
    return Object.keys(project.files || {}).filter(name => name.endsWith(suffix)).map(name => project.files[name]).join("\n");
  }

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
    return bytes(Object.keys(project.files).map(name => "// FILE: " + name + "\n" + project.files[name]).join("\n\n"));
  }

  function bytes(text) { return new TextEncoder().encode(String(text || "")).length; }
})(typeof self !== "undefined" ? self : globalThis);
