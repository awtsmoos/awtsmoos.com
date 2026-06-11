// B"H
(async function ectByteFrequency() {
  globalThis.self = globalThis;
  require("./app/ect-id-tables.js");
  require("./app/ect-compiler-core.js");
  require("./app/ect-storage-codec.js");
  const Parser = await require("../MerkavaASTParser/parser-core.js");
  const projects = [
    p("tiny number decl", "", "", "const hi=17;"),
    p("two decls math", "", "", "const a=3;let b=9;b+=a;"),
    p("simple dom", '<button id="go">Go</button><output id="out"></output>', '#go{display:block;padding:10px}', 'const out=document.getElementById("out");const go=document.getElementById("go");go.addEventListener("click",()=>{out.textContent="ok";});'),
    p("css animation", '<div class="orb"></div>', '.orb{position:absolute;left:10px;top:10px;width:24px;height:24px;border-radius:999px;background:#73fff2;animation:spin 2s linear infinite}@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}', 'console.log("ready");')
  ];
  const counts = Array(256).fill(0);
  projects.forEach(project => globalThis.AwtsEctCompiler.compileProject(project, Parser).semanticBytes.forEach(byte => counts[byte] += 1));
  const top = counts.map((count, byte) => ({ byte, count })).filter(x => x.count).sort((a, b) => b.count - a.count).slice(0, 80);
  console.log(top.map(x => x.byte + ":" + x.count).join(" "));
})();
function p(title, html, css, js) { return { title, files: { "index.html": html, "style.css": css, "app.js": js } }; }
