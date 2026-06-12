// B"H
(function browserBinary(root) {
  const ect = root.AwtsEctBrowser;
  const enc = new TextEncoder();
  const dec = new TextDecoder();
  const MAGIC = "AWTECT1\n";

  /**
   * B"H. Binary package vessel.
   *
   * The compact stream remains the storage truth. The render reconstruction is
   * also carried so uploaded .awtect files can preview with visible text instead
   * of reopening as a mute semantic skeleton.
   */
  ect.makePackage = function makePackage(project, result) {
    const storage = result.storage && result.storage.bytes ? result.storage.bytes : result.bytes;
    return {
      format: "AWTECT1",
      title: project.title,
      metrics: result.metrics,
      renderMetrics: result.renderMetrics,
      byteCount: result.byteCount,
      storage: Array.from(storage || []),
      reconstruction: result.reconstruction,
      renderReconstruction: result.renderReconstruction,
      preservation: result.preservation,
      universe: result.universe
    };
  };

  /** @param {object} pack @returns {Uint8Array} */
  ect.encodePackage = function encodePackage(pack) {
    return enc.encode(MAGIC + JSON.stringify(pack));
  };

  /** @param {ArrayBuffer} buffer @returns {object} */
  ect.decodePackage = function decodePackage(buffer) {
    const text = dec.decode(new Uint8Array(buffer));
    if (!text.startsWith(MAGIC)) throw new Error("Not an AWTECT binary package.");
    return JSON.parse(text.slice(MAGIC.length));
  };

  /** @param {object} pack */
  ect.projectFromPackage = function projectFromPackage(pack) {
    const r = pack.renderReconstruction || pack.reconstruction || {};
    return { title: (pack.title || "Decoded") + " reconstructed", kind: "decoded", files: {
      "index.html": r.html || "",
      "style.css": r.css || "",
      "app.js": r.js || ""
    } };
  };

  /** @param {string} name @param {Uint8Array} bytes */
  ect.downloadBytes = function downloadBytes(name, bytes) {
    const url = URL.createObjectURL(new Blob([bytes], { type: "application/octet-stream" }));
    const a = document.createElement("a");
    a.href = url; a.download = name; a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
})(window);
