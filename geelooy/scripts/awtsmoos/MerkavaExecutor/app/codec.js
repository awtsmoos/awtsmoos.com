// B"H
(function forgeCodec(root) {
  const forge = root.MerkavaForge = root.MerkavaForge || {};
  const textEncoder = new TextEncoder();

  /**
   * Turns text into bytes, the way speech descends into measured letters while
   * the Awtsmoos remains beyond every measure.
   * @param {string} text Source text.
   * @returns {number[]} Byte array.
   */
  function toBytes(text) {
    return Array.from(textEncoder.encode(text));
  }

  /**
   * Builds the custom web bytecode container for HTML/CSS/JS. This is separate
   * from Merkava JS bytecode but holds its compiled metadata beside the sources.
   * @param {{html:string,css:string,js:string}} parts Editable sources.
   * @param {object} compiled VM compile/run metadata.
   * @returns {object} Serializable bytecode vessel.
   */
  function makeWebBytecode(parts, compiled) {
    const sections = { html: toBytes(parts.html), css: toBytes(parts.css), js: toBytes(parts.js) };
    const totalBytes = Object.values(sections).reduce(function count(sum, bytes) {
      return sum + bytes.length;
    }, 0);
    return {
      magic: "AWTS-WEB-BYTECODE",
      version: 1,
      createdAt: new Date().toISOString(),
      totalBytes,
      sections,
      compiled: compiled || {}
    };
  }

  /**
   * Pretty prints bytecode without hiding the sharp numbers.
   * @param {object} bytecode Custom bytecode vessel.
   * @returns {string} JSON text.
   */
  function printBytecode(bytecode) {
    return JSON.stringify(bytecode, null, 2);
  }

  forge.toBytes = toBytes;
  forge.makeWebBytecode = makeWebBytecode;
  forge.printBytecode = printBytecode;
})(window);
