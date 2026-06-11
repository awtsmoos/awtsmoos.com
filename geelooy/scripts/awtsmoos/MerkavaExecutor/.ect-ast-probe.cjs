// B"H
(async function astProbe() {
  const Parser = await require("../MerkavaASTParser/parser-core.js");
  const src = 'fetch("/api/data").then(r=>r.json()).then(data=>{out.textContent=JSON.stringify(data);});';
  const ast = new Parser(src).parse();
  console.log(JSON.stringify(ast, null, 2));
})().catch(error => { console.error(error.stack || error); process.exit(1); });
