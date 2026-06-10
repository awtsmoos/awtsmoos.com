// B"H
async function main() {
  globalThis.self = globalThis;
  require("./app/ect-id-tables.js");
  require("./app/ect-compiler-core.js");
  require("./app/ect-storage-codec.js");
  const Parser = await require("../MerkavaASTParser/parser-core.js");

  const projects = [domProject(), canvasProject()];
  for (const project of projects) {
    const result = globalThis.AwtsEctCompiler.compileProject(project, Parser);
    assert(result.byteCount > 0, project.title + " produced no storage bytecode");
    assert(result.metrics.semanticRamBytes > 0, project.title + " produced no semantic RAM bytes");
    assert(result.metrics.ramBytes > 0, project.title + " produced no typed RAM image");
    assert(result.metrics.originalSourceBytes > result.byteCount, project.title + " did not compress storage");
    assert(result.universe.dictionaries.memberIds > 200, "runtime member dictionary too small");
    const decoded = globalThis.AwtsEctCompiler.decodeStorage(result.storage);
    assert(decoded.length === result.semanticBytes.length, project.title + " storage decode length mismatch");
    console.log(project.title + ": src " + result.metrics.originalSourceBytes + " -> storage " + result.byteCount + " bytes, semanticRAM " + result.metrics.semanticRamBytes + " bytes, typedRAM " + result.metrics.ramBytes + " bytes, " + result.metrics.compressionX + "x, ops=" + result.metrics.detail.ops);
  }
}

function domProject() {
  return { title: "dom smoke", files: {
    "index.html": `<section class="card"><button id="ignite">Ignite</button><output id="spark">waiting</output></section>`,
    "style.css": `.card{padding:24px;border-radius:18px;background:#071923;color:#eaffff}.card button{display:block;padding:10px 16px}`,
    "app.js": `const spark=document.getElementById("spark");
const button=document.getElementById("ignite");
let count=0;
button.addEventListener("click",()=>{count++;spark.textContent="pulse "+count;});`
  } };
}

function canvasProject() {
  return { title: "canvas smoke", files: {
    "index.html": `<section class="stage"><canvas id="stage" width="320" height="180"></canvas><output id="spark">ready</output></section>`,
    "style.css": `.stage{padding:24px;background:#06141f;color:#eaffff}.stage canvas{width:100%;touch-action:none}`,
    "app.js": `const canvas=document.getElementById("stage");
const spark=document.getElementById("spark");
const ctx=canvas.getContext("2d");
const ball={x:90,y:80,vx:2.4,vy:1.6,radius:18};
function draw(){ctx.fillStyle="#02050a";ctx.fillRect(0,0,canvas.width,canvas.height);ctx.beginPath();ctx.arc(ball.x,ball.y,ball.radius,0,Math.PI*2);ctx.fill();}
function frame(){ball.x+=ball.vx;ball.y+=ball.vy;draw();spark.textContent="ball";requestAnimationFrame(frame);}
frame();`
  } };
}

function assert(value, message) {
  if (!value) throw new Error(message);
}

main().catch(error => {
  console.error(error && error.stack || error);
  process.exit(1);
});
