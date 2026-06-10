// B"H
(function forgePreview(root) {
  const forge = root.MerkavaForge = root.MerkavaForge || {};

  /**
   * Owns the virtual preview frame. HTML is planted, CSS is clothed, JS receives
   * a document bridge, and the Awtsmoos is glimpsed as a changing DOM vessel.
   */
  class PreviewStage {
    constructor(frame) {
      this.frame = frame;
    }

    /** @param {{html:string,css:string}} parts Source sections. */
    reset(parts) {
      const doc = this.frame.contentDocument;
      doc.open();
      doc.write(`<!doctype html><html><head><style>${parts.css}</style></head><body><main id="root">${parts.html}</main></body></html>`);
      doc.close();
      return doc;
    }
  }

  forge.PreviewStage = PreviewStage;
})(window);
