// B"H
async function main() {
  globalThis.self = globalThis;
  require("./app/ect-id-tables.js");
  require("./app/ect-compiler-core.js");
  require("./app/ect-storage-codec.js");
  const Parser = await require("../MerkavaASTParser/parser-core.js");
  const rows = examples().map(project => measure(project, Parser));
  rows.forEach(row => {
    console.log([
      row.index.toString().padStart(2, "0"),
      row.title.padEnd(26, " "),
      "src=" + row.src.toString().padStart(4, " "),
      "storage=" + row.storage.toString().padStart(4, " "),
      "ram=" + row.ram.toString().padStart(4, " "),
      "x=" + row.ratio.toFixed(2).padStart(6, " "),
      "ops=" + row.ops.toString().padStart(3, " "),
      "pools=" + JSON.stringify(row.pools),
      "recon=" + row.reconstructable
    ].join(" | "));
  });
  const total = rows.reduce((sum, row) => ({
    src: sum.src + row.src,
    storage: sum.storage + row.storage,
    ram: sum.ram + row.ram,
    ops: sum.ops + row.ops
  }), { src: 0, storage: 0, ram: 0, ops: 0 });
  console.log("\nTOTAL", JSON.stringify({
    examples: rows.length,
    src: total.src,
    storage: total.storage,
    ram: total.ram,
    ratio: round(total.src / total.storage),
    avgStorage: round(total.storage / rows.length),
    avgRam: round(total.ram / rows.length),
    ops: total.ops,
    allReconstructable: rows.every(row => row.reconstructable)
  }, null, 2));
}

function measure(project, Parser) {
  const result = globalThis.AwtsEctCompiler.compileProject(project, Parser);
  assert(result.byteCount > 0, project.title + " produced no storage");
  assert(result.metrics.ramBytes > 0, project.title + " produced no RAM");
  assert(result.reconstruction && result.reconstruction.proof.reconstructable, project.title + " not reconstructable");
  return {
    index: project.index,
    title: project.title,
    src: result.metrics.originalSourceBytes,
    storage: result.byteCount,
    ram: result.metrics.ramBytes,
    ratio: result.metrics.originalSourceBytes / result.byteCount,
    ops: result.metrics.detail.ops,
    pools: result.metrics.detail.pools,
    reconstructable: result.reconstruction.proof.reconstructable
  };
}

function examples() {
  return [
    project(1, "tiny number decl", "", "", "const hi=17;"),
    project(2, "two decls math", "", "", "const a=3;let b=9;b+=a;"),
    project(3, "simple dom", '<button id="go">Go</button><output id="out"></output>', '#go{display:block;padding:10px}', 'const out=document.getElementById("out");const go=document.getElementById("go");go.addEventListener("click",()=>{out.textContent="ok";});'),
    project(4, "card shell", '<section class="card"><h2>Hi</h2><p>Text</p></section>', '.card{padding:24px;border-radius:18px;background:#071923;color:#eaffff}', 'console.log("ready");'),
    project(5, "css broad rules", '<main class="layout"><article id="panel"></article></main>', '.layout{display:grid;place-items:center;min-height:100vh;grid-template-columns:repeat(3,1fr);scroll-snap-type:x mandatory;overscroll-behavior-x:contain}.layout article{box-sizing:border-box;inline-size:320px;block-size:180px;object-fit:cover;mix-blend-mode:multiply;writing-mode:horizontal-tb}', 'const panel=document.getElementById("panel");console.log(panel);'),
    project(6, "array ops", '<ul id="list"></ul>', '#list{display:block;padding:16px}', 'const list=document.getElementById("list");const items=Array.from([1,2,3]);items.forEach(item=>{console.log(item);});'),
    project(7, "object state", '<output id="out"></output>', 'output{display:block;color:#eaffff}', 'const state={x:10,y:12,vx:2,vy:3,radius:8};state.x+=state.vx;state.y+=state.vy;console.log(state.x);'),
    project(8, "canvas basic", '<canvas id="stage" width="320" height="180"></canvas>', 'canvas{width:100%;touch-action:none}', 'const canvas=document.getElementById("stage");const ctx=canvas.getContext("2d");ctx.fillStyle="#02050a";ctx.fillRect(0,0,canvas.width,canvas.height);'),
    project(9, "canvas ball", '<section class="stage"><canvas id="stage" width="320" height="180"></canvas><output id="spark">ready</output></section>', '.stage{padding:24px;background:#06141f;color:#eaffff}.stage canvas{width:100%;touch-action:none}', 'const canvas=document.getElementById("stage");const spark=document.getElementById("spark");const ctx=canvas.getContext("2d");const ball={x:90,y:80,vx:2.4,vy:1.6,radius:18};function draw(){ctx.fillStyle="#02050a";ctx.fillRect(0,0,canvas.width,canvas.height);ctx.beginPath();ctx.arc(ball.x,ball.y,ball.radius,0,Math.PI*2);ctx.fill();}function frame(){ball.x+=ball.vx;ball.y+=ball.vy;draw();spark.textContent="ball";requestAnimationFrame(frame);}frame();'),
    project(10, "pointer coords", '<canvas id="stage" width="320" height="180"></canvas><output id="out"></output>', 'canvas{touch-action:none;width:100%}output{display:block}', 'const canvas=document.getElementById("stage");const out=document.getElementById("out");canvas.addEventListener("pointermove",event=>{const rect=canvas.getBoundingClientRect();out.textContent=event.clientX+rect.left;});'),
    project(11, "map set json", '<output id="out"></output>', 'output{display:block}', 'const out=document.getElementById("out");const map=new Map();map.set("ok",17);const set=new Set([1,2,3]);out.textContent=JSON.stringify(Array.from(set));'),
    project(12, "fetch shape", '<button id="go"></button><output id="out"></output>', 'button{display:block;padding:12px}output{display:block}', 'const go=document.getElementById("go");const out=document.getElementById("out");go.addEventListener("click",()=>{fetch("/api/data").then(r=>r.json()).then(data=>{out.textContent=JSON.stringify(data);});});'),
    project(13, "class syntax", '<output id="out"></output>', 'output{display:block}', 'class Counter{constructor(){this.value=0;}inc(){this.value+=1;return this.value;}}const c=new Counter();console.log(c.inc());'),
    project(14, "template strings", '<output id="out"></output>', 'output{display:block;color:#eaffff}', 'const out=document.getElementById("out");const name="ready";out.textContent=`state:${name}`;'),
    project(15, "form input", '<form id="form"><input id="name" value=""><output id="out"></output></form>', 'form{display:grid;gap:12px}input{padding:10px}output{display:block}', 'const input=document.getElementById("name");const out=document.getElementById("out");input.addEventListener("input",()=>{out.textContent=input.value;});'),
    project(16, "grid dashboard", '<main class="grid"><section class="card"><h2>A</h2><output id="a"></output></section><section class="card"><h2>B</h2><output id="b"></output></section></main>', '.grid{display:grid;grid-template-columns:repeat(3,1fr);gap:12px}.card{padding:24px;border-radius:18px;background:#071923;color:#eaffff}', 'const a=document.getElementById("a");const b=document.getElementById("b");let count=0;function tick(){count+=1;a.textContent="pulse";b.textContent=count;requestAnimationFrame(tick);}tick();'),
    project(17, "typed array", '<canvas id="stage" width="320" height="180"></canvas>', 'canvas{width:100%}', 'const data=new Uint8Array(320);data.fill(17);console.log(data.length);'),
    project(18, "date url", '<output id="out"></output>', 'output{display:block}', 'const out=document.getElementById("out");const url=new URL(location.href);out.textContent=Date.now()+url.pathname;'),
    project(19, "css animation", '<div class="orb"></div>', '.orb{position:absolute;left:10px;top:10px;width:24px;height:24px;border-radius:999px;background:#73fff2;animation:spin 2s linear infinite}@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}', 'console.log("ready");'),
    project(20, "webgl-ish", '<canvas id="stage" width="320" height="180"></canvas>', 'canvas{display:block;width:100%;height:100%;touch-action:none}', 'const canvas=document.getElementById("stage");const gl=canvas.getContext("webgl");console.log(gl);')
  ];
}

function project(index, title, html, css, js) {
  return { index, title, files: { "index.html": html, "style.css": css, "app.js": js } };
}
function round(value) { return Math.round(value * 100) / 100; }
function assert(value, message) { if (!value) throw new Error(message); }
main().catch(error => { console.error(error && error.stack || error); process.exit(1); });
