// B"H
async function main() {
  globalThis.self = globalThis;
  require("./app/ect-id-tables.js");
  require("./app/ect-compiler-core.js");
  require("./app/ect-storage-codec.js");
  const Parser = await require("../MerkavaASTParser/parser-core.js");
  const project = { files: {
    "index.html": '<article><h2>Alpha</h2><button id="go">Run</button><output id="out">waiting</output></article>',
    "style.css": 'article{padding:12px}',
    "app.js": 'const out=document.getElementById("out");'
  } };
  const compact = globalThis.AwtsEctCompiler.compileProject(project, Parser, { preserveText: false });
  const renderable = globalThis.AwtsEctCompiler.compileProject(project, Parser, { preserveText: true, preservePublicSymbols: true });
  assert(compact.byteCount <= 70, "compact metrics inflated: " + compact.byteCount);
  assert(renderable.reconstruction.html.includes("Alpha"), "render text Alpha missing");
  assert(renderable.reconstruction.html.includes("Run"), "render text Run missing");
  assert(renderable.reconstruction.html.includes("waiting"), "render text waiting missing");
  console.log(JSON.stringify({ compactStorage: compact.byteCount, renderStorage: renderable.byteCount, renderHtml: renderable.reconstruction.html }));
}
function assert(value, message) { if (!value) throw new Error(message); }
main().catch(error => { console.error(error && error.stack || error); process.exit(1); });
