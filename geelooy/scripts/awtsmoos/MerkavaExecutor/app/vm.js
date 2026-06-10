// B"H
(function forgeVm(root) {
  const forge = root.MerkavaForge = root.MerkavaForge || {};

  /**
   * Runs source through the existing Merkava VM while giving it a preview document.
   * The function is small, but its task is vast: custom code enters bytecode, then
   * reaches back into the virtual DOM like lightning finding a glass mountain.
   * @param {string} source JavaScript source.
   * @param {{previewDocument:Document,log:function}} env Bridge tools.
   * @returns {Promise<object>} Execution result with memory.
   */
  async function runMerkavaPreview(source, env) {
    if (!root.Merkava) throw new Error("Merkava SDK not loaded");
    await root.Merkava.init();
    const context = {
      document: env.previewDocument,
      window: env.previewDocument.defaultView,
      console,
      setTimeout: root.setTimeout.bind(root),
      clearTimeout: root.clearTimeout.bind(root)
    };
    const active = await root.Merkava.run(source, {
      debug: true,
      ramLimit: 5000,
      context,
      hostAPI: { 0: function logHost() { env.log(Array.from(arguments).join(" ")); } },
      importResolver: async function importResolver(specifier) {
        return { code: `syscall(0, "Imported ${specifier}");` };
      }
    });
    const result = await active.done;
    return Object.assign({}, result, { memory: active.memory, vm: active.vm });
  }

  forge.runMerkavaPreview = runMerkavaPreview;
})(window);
