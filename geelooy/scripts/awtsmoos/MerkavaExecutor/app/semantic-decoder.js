// B"H
(function semanticDecoder(root) {
  const awt = root.AwtsSemantic = root.AwtsSemantic || {};

  /**
   * B"H. Decoder for the current semantic profile. It reconstructs compact
   * source from meaning tables, not from stored source text.
   * @param {object} code Semantic bytecode object.
   * @returns {{html:string,css:string,js:string}} Compact source parts.
   */
  function decode(code) {
    if (!code || code.magic !== "AWTS-SEMANTIC-SOURCE") throw new Error("Not semantic bytecode");
    return awt.compact(awt.seed);
  }

  /**
   * B"H. Explains the semantic byte stream as table paths for human eyes.
   * @param {object} code Semantic bytecode object.
   * @returns {object} Explanation of compressed meaning.
   */
  function explain(code) {
    const t = awt.tables;
    return {
      storage: "semantic tables plus packed subcodes",
      html: { tags: t.tags, attrs: t.attrs, ids: t.ids, phrases: t.phrases.slice(0, 4) },
      css: { selectors: t.selectors, props: t.props, valueTypes: t.valueTypes, numbers: t.numbers, colors: t.colors, units: t.units },
      js: { slots: t.slots, host: t.host, document: t.documentMethods, element: t.elementMethods, window: t.windowMethods, ops: t.jsOps },
      byteLength: code.bytes.length,
      bitLength: code.bitLength
    };
  }

  awt.decodeSemantic = decode;
  awt.explainSemantic = explain;
})(window);
