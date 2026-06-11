// B"H
(async function inspectEctCurrent() {
  globalThis.self = globalThis;
  require("./app/ect-id-tables.js");
  require("./app/ect-compiler-core.js");
  require("./app/ect-storage-codec.js");
  const Parser = await require("../MerkavaASTParser/parser-core.js");
  const project = {
    files: {
      "index.html": '<div class="orb"></div>',
      "style.css": '.orb{position:absolute;left:10px;top:10px;width:24px;height:24px;border-radius:999px;background:#73fff2;animation:spin 2s linear infinite}@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}',
      "app.js": 'console.log("ready");'
    }
  };
  const result = globalThis.AwtsEctCompiler.compileProject(project, Parser);
  console.log(JSON.stringify({
    storage: result.byteCount,
    ram: result.metrics.ramBytes,
    mode: result.storage.detail.mode,
    detail: result.storage.detail,
    semantic: result.semanticBytes
  }, null, 2));
})().catch(error => { console.error(error && error.stack || error); process.exit(1); });
