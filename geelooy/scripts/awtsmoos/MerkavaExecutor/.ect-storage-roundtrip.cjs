// B"H
(async function storageRoundtrip() {
  globalThis.self = globalThis;
  require("./app/ect-id-tables.js");
  require("./app/ect-compiler-core.js");
  require("./app/ect-storage-codec.js");
  const Parser = await require("../MerkavaASTParser/parser-core.js");
  const projects = [
    project("css animation", '<div class="orb"></div>', '.orb{position:absolute;left:10px;top:10px;width:24px;height:24px;border-radius:999px;background:#73fff2;animation:spin 2s linear infinite}@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}', 'console.log("ready");'),
    project("fetch shape", '<button id="go"></button><output id="out"></output>', 'button{display:block;padding:12px}output{display:block}', 'const go=document.getElementById("go");const out=document.getElementById("out");go.addEventListener("click",()=>{fetch("/api/data").then(r=>r.json()).then(data=>{out.textContent=JSON.stringify(data);});});')
  ];
  projects.forEach(item => {
    const result = globalThis.AwtsEctCompiler.compileProject(item, Parser);
    const decoded = globalThis.AwtsEctCompiler.decodeStorage(result.storage);
    const same = decoded.length === result.semanticBytes.length && decoded.every((value, index) => value === result.semanticBytes[index]);
    console.log(`${item.title}: mode=${result.storage.detail.mode} storage=${result.byteCount} semantic=${result.semanticBytes.length} decode=${same}`);
    if (!same) throw new Error(item.title + " storage decode mismatch");
  });
})();
function project(title, html, css, js) { return { title, files: { "index.html": html, "style.css": css, "app.js": js } }; }
