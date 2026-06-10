// B"H
(function forgeVm(root) {
  const forge = root.MerkavaForge = root.MerkavaForge || {};

  /**
   * Chapter Three: host functions are bound to their palace. The Awtsmoos lets
   * browser breath enter the VM without Illegal invocation shards.
   * @param {{previewDocument:Document,log:function}} env Bridge tools.
   * @returns {object} Safe VM globals.
   */
  function makeContext(env) {
    const win = env.previewDocument.defaultView || root;
    const raf = root.requestAnimationFrame || function fallback(fn) { return root.setTimeout(fn, 16); };
    const caf = root.cancelAnimationFrame || root.clearTimeout;
    return {
      document: env.previewDocument,
      window: win,
      console,
      requestAnimationFrame: raf.bind(root),
      cancelAnimationFrame: caf.bind(root),
      setTimeout: root.setTimeout.bind(root),
      clearTimeout: root.clearTimeout.bind(root),
      setInterval: root.setInterval.bind(root),
      clearInterval: root.clearInterval.bind(root)
    };
  }

  /**
   * Runs source through the existing Merkava VM while giving it a preview document.
   * @param {string} source JavaScript source.
   * @param {{previewDocument:Document,log:function}} env Bridge tools.
   * @returns {Promise<object>} Execution result with memory and VM.
   */
  async function runMerkavaPreview(source, env) {
    if (!root.Merkava) throw new Error("Merkava SDK not loaded");
    await root.Merkava.init();
    const active = await root.Merkava.run(source, {
      debug: true,
      ramLimit: 5000,
      context: makeContext(env),
      hostAPI: { 0: function logHost() { env.log(Array.from(arguments).join(" ")); } },
      importResolver: async function importResolver(specifier) {
        return { code: `syscall(0, "Imported ${specifier}");` };
      }
    });
    const result = await active.done;
    return Object.assign({}, result, { memory: active.memory, vm: active.vm });
  }

  forge.makeContext = makeContext;
  forge.runMerkavaPreview = runMerkavaPreview;
})(window);
