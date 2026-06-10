// B"H
(function forgeCore(root) {
  const forge = root.MerkavaForge = root.MerkavaForge || {};

  forge.seed = {
    html: `<article class="card"><h2>Awtsmoos Bytecode Garden</h2><p>The source scroll becomes packed bytes, a BMP, and living DOM.</p><button id="ignite">Ignite</button><output id="spark">waiting...</output></article>`,
    css: `.card{padding:28px;border-radius:24px;background:linear-gradient(135deg,#08111f,#14383a);box-shadow:0 24px 80px #0008;color:#eaffff}.card h2{color:#73fff2}.card button{border:0;border-radius:999px;padding:10px 16px;background:#73fff2;color:#001;font-weight:900}.card output{display:block;margin-top:16px}`,
    js: `const spark = document.getElementById("spark");
const button = document.getElementById("ignite");
let count = 0;
button.addEventListener("click", function awaken() {
  requestAnimationFrame(function pulse() {
    count = count + 1;
    spark.textContent = "B'H bytecode pulse #" + count;
  });
});
syscall(0, "Preview app compiled; source bytes and RAM fire are awake.");`
  };

  /**
   * Chapter Four: one source enters three gates. First reversible source bytes,
   * then optional BMP garment, then VM execution where RAM receives motion.
   * @param {{html:string,css:string,js:string}} parts Source sections.
   * @param {{previewDocument:Document,log:function}} env Runtime bridge.
   * @returns {Promise<object>} Unified compilation showcase.
   */
  async function compileForge(parts, env) {
    let runtime = { status: "NOT_RUN", value: null, ramObjects: 0 };
    try {
      const result = await forge.runMerkavaPreview(parts.js, env);
      runtime = {
        status: result.status,
        value: result.value,
        ramObjects: result.memory && result.memory.ram ? result.memory.ram.size : 0,
        vmCycles: result.vm ? result.vm.cycleCount : 0
      };
    } catch (error) {
      runtime = { status: "VM_ERROR", error: error.message || String(error), ramObjects: 0 };
    }
    const sourceBytecode = forge.makeWebBytecode(parts, runtime);
    const bmp = forge.bytesToBmp(sourceBytecode.bytes);
    const roundTripBytes = forge.bmpToBytes(bmp.dataUrl);
    const rebuilt = forge.rebuildSources(roundTripBytes);
    return { sourceBytecode, bmp, rebuilt, runtime, roundTripOk: rebuilt.html === parts.html && rebuilt.css === parts.css && rebuilt.js === parts.js };
  }

  /** @param {object} showcase Compilation result. @returns {object[]} Metric cards. */
  function metricCards(showcase) {
    const m = showcase.sourceBytecode.metrics;
    return [
      ["Source bytes", m.sourceBytes],
      ["Packed bytes", m.packedBytes],
      ["Opcode records", m.recordCount],
      ["Pack ratio", m.ratio],
      ["BMP pixels", showcase.bmp.pixels],
      ["BMP bytes", showcase.bmp.bmpBytes],
      ["RAM objects", showcase.runtime.ramObjects || 0],
      ["Round trip", showcase.roundTripOk ? "perfect" : "mismatch"]
    ];
  }

  forge.compileForge = compileForge;
  forge.metricCards = metricCards;
})(window);
