// B"H
(function forgeCompiler(root) {
  const forge = root.MerkavaForge = root.MerkavaForge || {};

  /**
   * Compiles the JS through Merkava.run and seals HTML/CSS/JS into the custom
   * web-bytecode vessel. The Awtsmoos breathes through two garments: the native
   * VM bytecode path for JS, and this page-level byte array system for all scripts.
   * @param {{html:string,css:string,js:string}} parts Source sections.
   * @param {{previewDocument:Document,log:function}} env Runtime bridge.
   * @returns {Promise<object>} Bytecode plus run result.
   */
  async function compileScripts(parts, env) {
    const result = await forge.runMerkavaPreview(parts.js, env);
    const compiled = {
      status: result.status,
      value: result.value,
      ramObjects: result.memory && result.memory.ram ? result.memory.ram.size : 0
    };
    return { bytecode: forge.makeWebBytecode(parts, compiled), result };
  }

  forge.compileScripts = compileScripts;
})(window);
