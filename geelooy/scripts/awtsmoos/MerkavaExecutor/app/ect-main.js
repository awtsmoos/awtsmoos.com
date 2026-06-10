// B"H
(function mainApp() {
  const examples = makeExamples();
  let worker;

  function boot() {
    mount();
    worker = new Worker("/scripts/awtsmoos/MerkavaExecutor/app/ect-worker.js?v=28");
    worker.onmessage = event => showMetrics(event.data);
    loadExample();
  }

  function mount() {
    byId("app").innerHTML = `<section class="forgeGrid"><section class="actionPanel"><label class="panelTitle">Project</label><select id="projectSelect">${examples.map((x, i) => `<option value="${i}">${x.title}</option>`).join("")}</select><label class="panelTitle">Renderer</label><select id="rendererSelect"><option value="html">Normal HTML rendering</option><option value="webgl">Merkava virtual WebGL DOM</option></select><button id="loadExample">Load Example</button><button id="compile">Compile In Worker</button><p class="hint">Compiler is split into focused modules: HTML, CSS, JS AST recipes, op writer, project assembler, and storage/RAM codec.</p></section><section class="filesPanel"><div class="panelTitle">Project Files</div><div id="fileTabs" class="fileTabs"></div><textarea id="fileEditor"></textarea></section><section class="editorPanel"><label class="panelTitle">Merged Editable Source</label><textarea id="sourceView"></textarea></section><section class="metricPanel"><div class="panelTitle">ECT Metrics</div><div id="metrics" class="metrics"><div><b>idle</b><span>WORKER</span></div></div></section><section class="previewPanel"><div class="panelTitle">Live Preview</div><iframe id="preview"></iframe></section><section class="bytePanel"><div class="panelTitle">Worker Bytecode</div><pre id="bytecode"></pre></section><section class="rebuiltPanel"><div class="panelTitle">Universe</div><pre id="universe"></pre></section></section>`;
  }

  function loadExample() {
    const project = currentBase();
    byId("sourceView").value = sourceText(project);
    renderFileTabs(project, Object.keys(project.files)[0]);
    compile();
  }

  function compile() {
    syncOpenFileToMerged();
    const project = fromEditor(currentBase());
    renderFileTabs(project, activeFileName());
    render(project);
    byId("metrics").innerHTML = `<div><b>working</b><span>WORKER</span></div>`;
    worker.postMessage({ project });
  }

  function renderFileTabs(project, selected) {
    const names = Object.keys(project.files);
    const active = names.includes(selected) ? selected : names[0];
    byId("fileTabs").innerHTML = names.map(name => `<button class="fileTab${name === active ? " active" : ""}" data-file="${escapeAttr(name)}">${escapeHtml(name)}</button>`).join("");
    byId("fileEditor").value = project.files[active] || "";
    byId("fileEditor").dataset.file = active || "";
  }

  function syncOpenFileToMerged() {
    const editor = byId("fileEditor");
    const name = editor && editor.dataset.file;
    if (!name) return;
    const project = fromEditor(currentBase());
    project.files[name] = editor.value;
    byId("sourceView").value = sourceText(project);
  }

  function activeFileName() { return byId("fileEditor") ? byId("fileEditor").dataset.file : ""; }

  function render(project) {
    const doc = byId("preview").contentDocument;
    const html = concat(project, ".html") || "<main></main>";
    const css = concat(project, ".css");
    doc.open();
    doc.write(`<!doctype html><html><head><style>${css}</style></head><body><main>${html}</main></body></html>`);
    doc.close();
    const mode = byId("rendererSelect").value;
    if (mode === "webgl") runVirtualWebgl(doc, project); else runNormalJs(doc, project);
    byId("status").textContent = mode === "webgl" ? "merkava webgl preview" : "normal preview";
  }

  function runNormalJs(doc, project) {
    const js = concat(project, ".js");
    try { Function("document", "window", js)(doc, doc.defaultView); } catch (error) { console.warn("Normal JS preview error", error); }
    bindDomFallback(doc);
  }

  function runVirtualWebgl(doc, project) {
    const canvas = doc.getElementById("stage") || doc.querySelector("canvas");
    if (!canvas) { runNormalJs(doc, project); return; }
    const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
    const ctx = gl ? null : canvas.getContext("2d");
    const spark = doc.getElementById("spark");
    const state = { x: 80, y: 80, vx: 2.5, vy: 1.7, radius: 18, pointerX: 0, pointerY: 0, hasPointer: false };
    canvas.onpointermove = event => {
      const rect = canvas.getBoundingClientRect();
      state.pointerX = (event.clientX - rect.left) * canvas.width / rect.width;
      state.pointerY = (event.clientY - rect.top) * canvas.height / rect.height;
      state.hasPointer = true;
    };
    function frame() {
      if (state.hasPointer) {
        state.vx += (state.pointerX - state.x) * 0.004;
        state.vy += (state.pointerY - state.y) * 0.004;
      }
      state.x += state.vx; state.y += state.vy;
      if (state.x < state.radius || state.x > canvas.width - state.radius) state.vx *= -0.92;
      if (state.y < state.radius || state.y > canvas.height - state.radius) state.vy *= -0.92;
      if (gl) drawGl(gl); else draw2d(ctx, canvas, state);
      if (spark) spark.textContent = `Merkava virtual WebGL DOM • x:${Math.round(state.x)} y:${Math.round(state.y)}`;
      requestAnimationFrame(frame);
    }
    frame();
  }

  function drawGl(gl) {
    const t = performance.now() * 0.001;
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.clearColor(0.02 + Math.sin(t) * 0.01, 0.08, 0.12, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);
  }

  function draw2d(ctx, canvas, s) {
    ctx.fillStyle = "#02050a"; ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "rgba(115,255,242,.12)"; ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.beginPath(); ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2); ctx.fillStyle = "#73fff2"; ctx.fill();
  }

  function bindDomFallback(doc) {
    const button = doc.getElementById("ignite");
    const spark = doc.getElementById("spark");
    if (!button || !spark || button.dataset.bound) return;
    let count = 0;
    button.dataset.bound = "yes";
    button.onclick = () => requestAnimationFrame(() => { count += 1; spark.textContent = `B'H exact bit pulse #${count}`; });
  }

  function showMetrics(result) {
    const m = result.metrics;
    const cards = [["Original", m.originalSourceBytes], ["Storage", m.storageBytes], ["Semantic RAM", m.semanticRamBytes || m.storageBytes], ["Typed RAM", m.ramBytes || 0], ["Compression", `${m.compressionX}x`], ["Mode", m.mode], ["Payload", m.payloadKind], ["Ops", m.detail.ops], ["Pools", poolText(m.detail.pools)], ["Bits", m.storageBits]];
    byId("metrics").innerHTML = cards.map(x => `<div><b>${x[1]}</b><span>${x[0]}</span></div>`).join("");
    byId("bytecode").textContent = JSON.stringify({ byteCount: result.byteCount, bitLength: result.bitLength, bytes: result.bytes }, null, 2);
    byId("universe").textContent = JSON.stringify(result.universe, null, 2);
    byId("status").textContent = "worker compiled";
  }

  function fromEditor(base) {
    return { title: base.title, kind: base.kind, files: parseFiles(byId("sourceView").value) || base.files };
  }

  function parseFiles(text) {
    const files = {};
    const marker = "// FILE: ";
    const src = String(text || "");
    let index = 0;
    while (index < src.length) {
      const start = src.indexOf(marker, index);
      if (start < 0) break;
      const nameStart = start + marker.length;
      const firstBreak = src.indexOf("\n", nameStart);
      if (firstBreak < 0) break;
      const next = src.indexOf(marker, firstBreak + 1);
      const name = src.slice(nameStart, firstBreak).trim();
      const bodyEnd = next < 0 ? src.length : next;
      files[name] = trimEdges(src.slice(firstBreak + 1, bodyEnd));
      index = bodyEnd;
    }
    return Object.keys(files).length ? files : null;
  }

  function sourceText(project) { return Object.keys(project.files).map(k => `// FILE: ${k}\n${project.files[k]}`).join("\n\n"); }
  function currentBase() { return examples[Number(byId("projectSelect").value || 0)] || examples[0]; }
  function concat(project, ext) { return Object.keys(project.files).filter(k => endsWith(k, ext)).map(k => project.files[k]).join("\n"); }
  function byId(id) { return document.getElementById(id); }
  function poolText(p) { return `t${p.text}/s${p.symbols}/n${p.numbers}/c${p.colors}/x${p.custom}`; }
  function escapeHtml(value) { return String(value).split("&").join("&amp;").split("<").join("&lt;").split(">").join("&gt;"); }
  function escapeAttr(value) { return escapeHtml(value).split("\"").join("&quot;"); }
  function endsWith(text, suffix) { const s = String(text); return s.slice(s.length - suffix.length) === suffix; }
  function trimEdges(value) { let a = 0; let b = String(value).length; while (a < b && isSpace(value[a])) a += 1; while (b > a && isSpace(value[b - 1])) b -= 1; return String(value).slice(a, b); }
  function isSpace(ch) { return ch === " " || ch === "\n" || ch === "\t" || ch === "\r" || ch === "\f"; }

  function makeExamples() {
    const garden = makeGarden();
    const ball = makeBall();
    const dashboard = makeDashboard();
    const todo = makeTodo();
    const particles = makeParticles();
    const grid = n => makeGrid(n);
    return [garden, ball, dashboard, todo, particles, grid(12), grid(24), grid(48)];
  }

  function makeGarden() {
    return { title: "Bit Garden App", kind: "dom", files: {
      "index.html": `<article class="card"><h2>Awtsmoos Bit Garden</h2><p>Every logical bit is counted. Fields share bytes.</p><button id="ignite">Ignite</button><output id="spark">waiting...</output></article>`,
      "style.css": `.card{padding:28px;border-radius:24px;background:linear-gradient(135deg,#08111f,#14383a);color:#eaffff}.card h2{color:#73fff2}.card button{border:0;border-radius:999px;padding:10px 16px;background:#73fff2;color:#001;font-weight:900}.card output{display:block;margin-top:16px}`,
      "app.js": `const spark=document.getElementById("spark");
const button=document.getElementById("ignite");
let count=0;
button.addEventListener("click",()=>requestAnimationFrame(()=>{
  count++;
  spark.textContent="B'H exact bit pulse #"+count;
}));`
    } };
  }

  function makeBall() {
    return { title: "Real Canvas Ball App", kind: "canvas", files: {
      "index.html": `<section class="stage"><h2>Canvas Ball Engine</h2><p>Real JS source controls physics, pointer attraction, and drawing.</p><canvas id="stage" width="560" height="320"></canvas><output id="spark">canvas ready</output></section>`,
      "style.css": `.stage{padding:24px;border-radius:24px;background:#06141f;color:#eaffff}.stage canvas{width:100%;border-radius:18px;background:#02050a;touch-action:none}.stage output{display:block;margin-top:12px;color:#73fff2}`,
      "app.js": `const canvas=document.getElementById("stage");
const spark=document.getElementById("spark");
const ctx=canvas.getContext("2d");
const ball={x:90,y:80,vx:2.4,vy:1.6,radius:18};
const pointer={x:0,y:0,active:false};
canvas.addEventListener("pointermove",event=>{
  const rect=canvas.getBoundingClientRect();
  pointer.x=(event.clientX-rect.left)*canvas.width/rect.width;
  pointer.y=(event.clientY-rect.top)*canvas.height/rect.height;
  pointer.active=true;
});
function update(){
  if(pointer.active){
    ball.vx+=(pointer.x-ball.x)*0.004;
    ball.vy+=(pointer.y-ball.y)*0.004;
  }
  ball.x+=ball.vx;
  ball.y+=ball.vy;
  if(ball.x<ball.radius||ball.x>canvas.width-ball.radius)ball.vx*=-0.92;
  if(ball.y<ball.radius||ball.y>canvas.height-ball.radius)ball.vy*=-0.92;
}
function draw(){
  ctx.fillStyle="#02050a";
  ctx.fillRect(0,0,canvas.width,canvas.height);
  ctx.beginPath();
  ctx.arc(ball.x,ball.y,ball.radius,0,Math.PI*2);
  ctx.fillStyle="#73fff2";
  ctx.fill();
}
function frame(){
  update();
  draw();
  spark.textContent="ball x="+Math.round(ball.x)+" y="+Math.round(ball.y);
  requestAnimationFrame(frame);
}
frame();`
    } };
  }

  function makeDashboard() {
    const cards = Array.from({ length: 24 }, (_, i) => `<li class="vessel"><b>vessel ${i + 1}</b><span>${(i + 3) * 7} sparks</span></li>`).join("");
    return { title: "Dashboard Many Cards", kind: "dom", files: {
      "index.html": `<section class="dash"><h2>Awtsmoos Dashboard</h2><ul id="vessels">${cards}</ul><button id="ignite">Pulse</button><output id="spark">ready</output></section>`,
      "style.css": `.dash{padding:24px;background:#071923;color:#eaffff}.dash ul{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;padding:0}.vessel{list-style:none;padding:12px;border-radius:14px;background:#0d3340}.vessel b,.vessel span{display:block}`,
      "app.js": `const spark=document.getElementById("spark");
const button=document.getElementById("ignite");
const vessels=document.querySelectorAll(".vessel");
let pulse=0;
button.addEventListener("click",()=>{
  pulse++;
  vessels.forEach((vessel,index)=>{
    vessel.style.transform="scale("+(1+(index%3)*0.02)+")";
  });
  spark.textContent="dashboard pulse #"+pulse;
});`
    } };
  }

  function makeTodo() {
    return { title: "Todo DOM App", kind: "dom", files: {
      "index.html": `<section class="todo"><h2>Todo Compiler Demo</h2><input id="newItem" value="pack semantic ops"><button id="ignite">Add</button><ul id="list"><li>parse html</li><li>type css</li><li>lower js</li></ul><output id="spark">todo ready</output></section>`,
      "style.css": `.todo{padding:24px;background:#071923;color:#eef}.todo input,.todo button{padding:10px;border-radius:12px}.todo li{margin:8px 0;padding:10px;background:#123;border-radius:12px}`,
      "app.js": `const input=document.getElementById("newItem");
const button=document.getElementById("ignite");
const list=document.getElementById("list");
const spark=document.getElementById("spark");
let added=0;
button.addEventListener("click",()=>{
  const item=document.createElement("li");
  item.textContent=input.value;
  list.appendChild(item);
  added++;
  spark.textContent="items added: "+added;
});`
    } };
  }

  function makeParticles() {
    return { title: "Canvas Particles JS", kind: "canvas", files: {
      "index.html": `<section class="stage"><h2>Particle Field</h2><canvas id="stage" width="560" height="320"></canvas><output id="spark">particles ready</output></section>`,
      "style.css": `.stage{padding:24px;background:#06141f;color:#eaffff}.stage canvas{width:100%;border-radius:18px;background:#02050a;touch-action:none}`,
      "app.js": `const canvas=document.getElementById("stage");
const spark=document.getElementById("spark");
const ctx=canvas.getContext("2d");
const particles=Array.from({length:32},(_,index)=>({x:index*17%canvas.width,y:index*29%canvas.height,vx:(index%5-2)*0.4,vy:(index%7-3)*0.35}));
function step(){
  ctx.fillStyle="#02050a";
  ctx.fillRect(0,0,canvas.width,canvas.height);
  particles.forEach((p,index)=>{
    p.x+=p.vx;
    p.y+=p.vy;
    if(p.x<0||p.x>canvas.width)p.vx*=-1;
    if(p.y<0||p.y>canvas.height)p.vy*=-1;
    ctx.beginPath();
    ctx.arc(p.x,p.y,3+(index%4),0,Math.PI*2);
    ctx.fillStyle="#73fff2";
    ctx.fill();
  });
  spark.textContent="particles: "+particles.length;
  requestAnimationFrame(step);
}
step();`
    } };
  }

  function makeGrid(n) {
    return { title: `Grid ${n}`, kind: "dom", files: {
      "index.html": `<section class="grid"><h2>Grid ${n}</h2>${Array.from({ length: n }, (_, i) => `<article class="tile"><h3>Tile ${i + 1}</h3><p>Repeated tile shell.</p></article>`).join("")}<output id="spark">grid</output></section>`,
      "style.css": `.grid{padding:24px;display:grid;grid-template-columns:repeat(4,1fr);gap:12px;background:#071923;color:#eaffff}.tile{padding:14px;border-radius:18px;background:#0d3340}`,
      "app.js": `const spark=document.getElementById("spark");
spark.textContent="grid rendered with ${n} tiles";`
    } };
  }

  document.addEventListener("click", event => {
    if (event.target.id === "compile") compile();
    if (event.target.id === "loadExample") loadExample();
    if (event.target.classList && event.target.classList.contains("fileTab")) {
      syncOpenFileToMerged();
      renderFileTabs(fromEditor(currentBase()), event.target.dataset.file);
    }
  });
  document.addEventListener("input", event => { if (event.target.id === "fileEditor") syncOpenFileToMerged(); });
  document.addEventListener("change", event => { if (event.target.id === "projectSelect" || event.target.id === "rendererSelect") loadExample(); });
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot); else boot();
})();
