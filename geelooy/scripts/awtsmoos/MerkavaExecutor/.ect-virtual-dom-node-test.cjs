// B"H
async function main() {
  globalThis.self = globalThis;
  require("./app/ect-id-tables.js");
  require("./app/ect-compiler-core.js");
  require("./app/ect-storage-codec.js");
  const Parser = await require("../MerkavaASTParser/parser-core.js");
  const project = complexProject();
  const result = globalThis.AwtsEctCompiler.compileProject(project, Parser);
  const proof = result.reconstruction && result.reconstruction.proof;
  assert(proof && proof.reconstructable, "reconstruction proof failed");
  assert(result.metrics.ramBytes === result.byteCount, "RAM must equal direct compact storage stream");
  assert(result.ramImage && result.ramImage.sectionBytes === 0, "RAM section header must be zero");
  assert(result.metrics.ramBytes < result.metrics.originalSourceBytes, "RAM must be below original source bytes");
  assert(result.reconstruction.html.indexOf("<main") >= 0, "complex main not reconstructed");
  assert(result.reconstruction.html.indexOf("<article") >= 0, "article tree not reconstructed");
  assert(result.reconstruction.html.indexOf("<button") >= 0, "button tree not reconstructed");
  assert(result.reconstruction.html.indexOf("<output") >= 0, "output tree not reconstructed");
  console.log(JSON.stringify({
    original: result.metrics.originalSourceBytes,
    storage: result.byteCount,
    ram: result.metrics.ramBytes,
    ratio: result.metrics.compressionX,
    ops: result.metrics.detail.ops,
    proof,
    htmlPreview: result.reconstruction.html.slice(0, 240)
  }, null, 2));
}

function complexProject() {
  return { title: "Complex Virtual DOM", files: {
    "index.html": '<main class="dash"><article class="card" id="alpha"><header><h2>Alpha</h2><button id="go">Run</button></header><section><p>Nested text</p><output id="out">waiting</output></section></article><article class="card"><h2>Beta</h2><ul><li>One</li><li>Two</li><li>Three</li></ul></article></main>',
    "style.css": '.dash{display:grid;grid-template-columns:repeat(2,1fr);gap:16px;padding:24px}.card{border-radius:18px;background:#071923;color:#eaffff;padding:18px}button{padding:10px;border-radius:999px}output{display:block;color:#73fff2}',
    "app.js": 'const go=document.getElementById("go");const out=document.getElementById("out");go.addEventListener("click",()=>{out.textContent="ok";});'
  } };
}

function assert(value, message) { if (!value) throw new Error(message); }
main().catch(error => { console.error(error && error.stack || error); process.exit(1); });
