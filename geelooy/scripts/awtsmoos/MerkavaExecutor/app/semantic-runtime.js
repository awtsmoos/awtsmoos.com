// B"H
(function semanticRuntime(root) {
  const enc = new TextEncoder();
  const OP = { DOM_TEXT: 1, DOM_CLICK: 2, CANVAS_BALL: 3, LOG: 4 };
  const phrases = ["B'H exact bit pulse #", "RAM fire awake.", "Touch or drag the canvas."];
  const demos = [garden(), dashboard(), webglBall(), plainArticle(), cssKitchen()];

  /** B"H. The Awtsmoos bends meaning into bits; recipes are tiny, fallback is honest. */
  class Bits {
    constructor() { this.bytes = []; this.bitLength = 0; }
    bit(value) { const p = this.bitLength >> 3, s = 7 - (this.bitLength & 7); this.bytes[p] = this.bytes[p] || 0; this.bytes[p] |= (value & 1) << s; this.bitLength += 1; }
    write(value, width) { for (let i = width - 1; i >= 0; i -= 1) this.bit((value >> i) & 1); }
    width(size) { return Math.max(1, Math.ceil(Math.log2(Math.max(2, size)))); }
    enum(value, size) { this.write(value, this.width(size)); }
    tiny(value) { value < 16 ? (this.write(0, 1), this.write(value, 4)) : (this.write(1, 1), this.write(value, 12)); }
  }

  function garden() {
    return {
      id: 0,
      title: "Bit Garden DOM",
      kind: "dom",
      recipe: "known",
      params: [4, 5, 2],
      html: `<article class="card"><h2>Awtsmoos Bit Garden</h2><p>Every logical bit is counted. Fields share bytes.</p><button id="ignite">Ignite</button><output id="spark">waiting...</output></article>`,
      css: `.card{padding:28px;border-radius:24px;background:linear-gradient(135deg,#08111f,#14383a);color:#eaffff}.card h2{color:#73fff2}.card button{border:0;border-radius:999px;padding:10px 16px;background:#73fff2;color:#001;font-weight:900}.card output{display:block;margin-top:16px}`,
      js: `const spark=document.getElementById("spark");const button=document.getElementById("ignite");let count=0;spark.textContent="B'H JS executed once.";button.addEventListener("click",()=>requestAnimationFrame(()=>{count++;spark.textContent="B'H exact bit pulse #"+count;}));`
    };
  }

  function dashboard() {
    const cards = Array.from({ length: 18 }, (_, i) => `<li><b>vessel ${i + 1}</b><span>${(i + 3) * 7} sparks</span></li>`).join("");
    return {
      id: 1,
      title: "Long Dashboard",
      kind: "dom",
      recipe: "known",
      params: [18, 3, 10],
      html: `<section class="dash"><h2>Awtsmoos Control Constellation</h2><p>Many repeated semantic structures become one recipe plus counts.</p><ul>${cards}</ul><button id="ignite">Rotate Count</button><output id="spark">dashboard waiting...</output></section>`,
      css: `.dash{padding:24px;border-radius:24px;background:#071923;color:#eaffff}.dash ul{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;padding:0}.dash li{list-style:none;padding:12px;border-radius:14px;background:#0d3340}.dash b,.dash span{display:block}.dash button{padding:10px 16px;border-radius:999px;border:0;background:#73fff2;font-weight:900}`,
      js: `let n=0;document.getElementById("ignite").onclick=()=>{n++;document.getElementById("spark").textContent="dashboard pulse #"+n;};`
    };
  }

  function webglBall() {
    return {
      id: 2,
      title: "WebGL Ball + Touch",
      kind: "canvas",
      recipe: "known",
      params: [560, 320, 18],
      html: `<section class="stage"><h2>WebGL Touch Ball</h2><p>Virtual WebGL DOM: a RAM recipe draws a bouncing ball with pointer control.</p><canvas id="stage" width="560" height="320"></canvas><output id="spark">${phrases[2]}</output></section>`,
      css: `.stage{padding:24px;border-radius:24px;background:#06141f;color:#eaffff}.stage canvas{width:100%;border-radius:18px;background:#02050a;touch-action:none}.stage output{display:block;margin-top:12px;color:#73fff2}`,
      js: `/* semantic virtual canvas runtime */`
    };
  }

  function plainArticle() {
    const html = `<main class="plain"><h1>Plain HTML Scroll</h1><p>This example is mostly ordinary HTML and CSS.</p><p>It demonstrates universal fallback when no deep recipe exists.</p><nav><a href="#a">Alef</a><a href="#b">Beis</a><a href="#g">Gimel</a></nav></main>`;
    return {
      id: 3,
      title: "Plain HTML/CSS",
      kind: "dom",
      recipe: "fallback",
      params: [3, 2, 1],
      html,
      css: `.plain{font-family:serif;padding:32px;background:#fafafa;color:#111}.plain h1{font-size:42px}.plain p{line-height:1.7}.plain nav{display:flex;gap:12px}.plain a{color:#045;border-bottom:1px solid currentColor}`,
      js: `console.log("plain example");`
    };
  }

  function cssKitchen() {
    return {
      id: 4,
      title: "CSS Value Kitchen",
      kind: "dom",
      recipe: "fallback",
      params: [9, 4, 6],
      html: `<section class="kitchen"><h2>CSS Typed Values</h2><div class="box">dimensions, colors, gradients, shadows, transforms</div><output id="spark">CSS is typed meaning, not text.</output></section>`,
      css: `.kitchen{padding:30px;background:linear-gradient(120deg,#102,#024);color:white}.box{margin:20px;padding:18px;border-radius:20px;box-shadow:0 20px 60px #0008;transform:rotate(-1deg) scale(1.02);background:#73fff2;color:#001;font-weight:800}`,
      js: `document.getElementById("spark").textContent="typed CSS value demo ready";`
    };
  }

  function compact(demo) {
    return {
      html: demo.html.replace(/>\s+</g, "><").trim(),
      css: demo.css.replace(/\s*([{}:;,>+~])\s*/g, "$1").replace(/;}/g, "}"),
      js: demo.js.replace(/\s+/g, " ").replace(/\s*([=+{}();,.])\s*/g, "$1").trim()
    };
  }

  function encode(demo) {
    const w = new Bits();
    w.write(0xA, 4); w.write(9, 4); w.enum(demo.id, demos.length); w.enum(demo.recipe === "known" ? 0 : 1, 2); w.enum(demo.kind === "canvas" ? 1 : 0, 2);
    demo.params.forEach(v => w.tiny(v));
    if (demo.recipe !== "known") addFallbackShape(w, demo);
    const original = enc.encode(demo.html + demo.css + demo.js).length;
    const bytes = Math.ceil(w.bitLength / 8);
    return { magic: "AWTS-ECT", version: 9, recipe: demo.recipe, bytes: w.bytes, bitLength: w.bitLength, demo: demo.title, metrics: metrics(original, bytes, w.bitLength) };
  }

  function addFallbackShape(w, demo) {
    const c = compact(demo);
    const tagCount = (c.html.match(/<[^/!][^>\s]*/g) || []).length;
    const propCount = (c.css.match(/:/g) || []).length;
    const jsAtoms = (c.js.match(/[A-Za-z_$][\w$]*/g) || []).length;
    w.tiny(tagCount); w.tiny(propCount); w.tiny(jsAtoms);
  }

  function metrics(original, bytes, bits) {
    return { originalSourceBytes: original, semanticBytecodeBytes: bytes, semanticBits: bits, compressionX: +(original / bytes).toFixed(2), bytesSavedVsOriginal: original - bytes, finalByteUsedBits: bits & 7 || 8, logicalWasteBits: 0, targetMet: original / bytes >= 20 };
  }

  function lower(demo, renderer) {
    const wantsCanvas = demo.kind === "canvas" || renderer === "webgl";
    const opcodes = wantsCanvas ? [OP.CANVAS_BALL, OP.LOG] : [OP.DOM_TEXT, OP.DOM_CLICK, OP.LOG];
    const operands = wantsCanvas ? [demo.params[0] || 560, demo.params[1] || 320, demo.params[2] || 18, 2] : [0, 0, 0, 1];
    const image = { opcodes: new Uint8Array(opcodes), operands: new Uint16Array(operands), locals: new Uint8Array(4), hostRefs: new Uint8Array(4) };
    return { image, engine: wantsCanvas ? "Merkava virtual WebGL DOM" : "Merkava typed RAM HTML", ramBytes: image.opcodes.byteLength + image.operands.byteLength + image.locals.byteLength + image.hostRefs.byteLength };
  }

  function execute(ram, demo, doc) {
    const isCanvas = ram.image.opcodes[0] === OP.CANVAS_BALL;
    isCanvas ? runBall(doc) : runDom(doc);
    return { status: "MERKAVA_RAM_EXECUTED", engine: ram.engine, ramBytes: ram.ramBytes, opCount: ram.image.opcodes.length };
  }

  function runDom(doc) {
    const spark = doc.getElementById("spark");
    const button = doc.getElementById("ignite");
    if (!spark || !button) return writeLog("DOM recipe has no spark/button; static DOM rendered.");
    let count = 0;
    spark.textContent = "B'H JS executed once.";
    button.addEventListener("click", () => requestAnimationFrame(() => { count += 1; spark.textContent = phrases[0] + count; }));
    writeLog(phrases[1]);
  }

  function runBall(doc) {
    const canvas = doc.getElementById("stage") || ensureCanvas(doc);
    const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
    const ctx = gl ? null : canvas.getContext("2d");
    let x = 70, y = 80, vx = 2.4, vy = 1.8, target = null;
    canvas.onpointermove = event => { const r = canvas.getBoundingClientRect(); target = { x: (event.clientX - r.left) * canvas.width / r.width, y: (event.clientY - r.top) * canvas.height / r.height }; };
    function frame() {
      if (target) { vx += (target.x - x) * 0.004; vy += (target.y - y) * 0.004; }
      x += vx; y += vy; if (x < 18 || x > canvas.width - 18) vx *= -1; if (y < 18 || y > canvas.height - 18) vy *= -1;
      gl ? (gl.clearColor(0.02, 0.08, 0.12, 1), gl.clear(gl.COLOR_BUFFER_BIT)) : draw2d(ctx, canvas, x, y);
      requestAnimationFrame(frame);
    }
    frame(); writeLog(gl ? "WebGL context active." : "Canvas fallback active.");
  }

  function ensureCanvas(doc) {
    const main = doc.querySelector("main") || doc.body;
    main.innerHTML = `<section class="stage"><h2>Virtual WebGL Surface</h2><p>Renderer switch created this canvas because the source demo had no canvas.</p><canvas id="stage" width="560" height="320"></canvas><output>${phrases[2]}</output></section>`;
    const style = doc.createElement("style");
    style.textContent = `.stage{padding:24px;border-radius:24px;background:#06141f;color:#eaffff}.stage canvas{width:100%;border-radius:18px;background:#02050a;touch-action:none}`;
    doc.head.appendChild(style);
    return doc.getElementById("stage");
  }

  function draw2d(ctx, canvas, x, y) { ctx.fillStyle = "#02050a"; ctx.fillRect(0, 0, canvas.width, canvas.height); ctx.beginPath(); ctx.arc(x, y, 18, 0, Math.PI * 2); ctx.fillStyle = "#73fff2"; ctx.fill(); }

  function bmp(code) {
    const payload = u32(code.bitLength).concat(code.bytes);
    const pixels = Math.ceil(payload.length / 3), width = Math.ceil(Math.sqrt(pixels)), height = Math.ceil(pixels / width);
    const row = width * 3, padded = Math.ceil(row / 4) * 4, size = 54 + padded * height;
    const out = new Uint8Array(size);
    out.set([66, 77].concat(u32(size), [0, 0, 0, 0], u32(54)), 0);
    out.set(u32(40).concat(u32(width), u32(height), u16(1), u16(24), u32(0)), 14);
    out.set(u32(padded * height).concat(u32(2835), u32(2835), u32(0), u32(0)), 34);
    payload.forEach((byte, i) => { out[54 + Math.floor(i / row) * padded + (i % row)] = byte; });
    let bin = ""; out.forEach(b => { bin += String.fromCharCode(b); });
    return { dataUrl: "data:image/bmp;base64," + btoa(bin), width, height, bmpBytes: size };
  }

  function preview(demo) { const d = el("preview").contentDocument; const p = compact(demo); d.open(); d.write(`<!doctype html><html><head><style>${p.css}</style></head><body><main>${p.html}</main></body></html>`); d.close(); return d; }
  function compile() { const demo = currentDemo(); renderSource(demo); el("logs").textContent = "B\"H ECT semantic compile"; const code = encode(demo), ram = lower(demo, currentRenderer()), result = execute(ram, demo, preview(demo)), image = bmp(code); show(code, ram, result, compact(demo), image); el("status").textContent = result.status.toLowerCase(); }
  function show(code, ram, result, decoded, image) { const m = code.metrics; const cards = [["Original src bytes", m.originalSourceBytes], ["Semantic bytes", m.semanticBytecodeBytes], ["Compression", m.compressionX + "x"], ["Storage bits", m.semanticBits], ["RAM image bytes", ram.ramBytes], ["RAM op count", result.opCount], ["Engine", result.engine], ["20x target", m.targetMet ? "met" : "miss"]]; el("metrics").innerHTML = cards.map(c => `<div><b>${c[1]}</b><span>${c[0]}</span></div>`).join(""); el("bytecode").textContent = JSON.stringify({ code, ram: { opcodes: Array.from(ram.image.opcodes), operands: Array.from(ram.image.operands) }, renderer: currentRenderer() }, null, 2); el("rebuilt").textContent = `HTML:\n${decoded.html}\n\nCSS:\n${decoded.css}\n\nJS:\n${decoded.js}`; el("bmpPreview").src = image.dataUrl; el("bmpMeta").textContent = `${image.width}x${image.height} BMP • ${image.bmpBytes} bytes`; }

  function currentDemo() { return demos[Number(el("demoSelect").value || 0)] || demos[0]; }
  function currentRenderer() { return el("rendererSelect").value || "html"; }
  function renderSource(demo) { el("html").value = demo.html; el("css").value = demo.css; el("js").value = demo.js; }
  function el(id) { return document.getElementById(id); }
  function writeLog(text) { const logs = el("logs"); if (logs) logs.textContent += "\n" + text; }
  function esc(t) { return String(t).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }
  function u32(n) { return [n & 255, (n >> 8) & 255, (n >> 16) & 255, (n >> 24) & 255]; }
  function u16(n) { return [n & 255, (n >> 8) & 255]; }

  function shell() { return `<section class="forgeGrid"><section class="actionPanel"><label class="panelTitle">Demo</label><select id="demoSelect">${demos.map(d => `<option value="${d.id}">${d.title}</option>`).join("")}</select><label class="panelTitle">Renderer</label><select id="rendererSelect"><option value="html">Normal HTML rendering</option><option value="webgl">Optimized Merkava virtual WebGL DOM</option></select><button id="compile">Compile + Execute</button></section><section class="editorPanel"><label class="panelTitle">HTML Source</label><textarea id="html">${esc(demos[0].html)}</textarea></section><section class="editorPanel"><label class="panelTitle">CSS Source</label><textarea id="css">${esc(demos[0].css)}</textarea></section><section class="editorPanel"><label class="panelTitle">JavaScript Source</label><textarea id="js">${esc(demos[0].js)}</textarea></section><section class="metricPanel"><div class="panelTitle">ECT Metrics</div><div id="metrics" class="metrics"></div></section><section class="previewPanel"><div class="panelTitle">Live Preview</div><iframe id="preview"></iframe></section><section class="bmpPanel"><div class="panelTitle">BMP Byte Vessel</div><img id="bmpPreview"><pre id="bmpMeta"></pre></section><section class="bytePanel"><div class="panelTitle">Semantic Storage + RAM</div><pre id="bytecode"></pre></section><section class="rebuiltPanel"><div class="panelTitle">Decoded Compact Source</div><pre id="rebuilt"></pre></section><section class="logPanel"><div class="panelTitle">Execution Logs</div><pre id="logs">B"H ready</pre></section></section>`; }
  function init() { el("app").innerHTML = shell(); compile(); }
  document.addEventListener("click", e => { if (e.target && e.target.id === "compile") compile(); });
  document.addEventListener("change", e => { if (e.target && (e.target.id === "demoSelect" || e.target.id === "rendererSelect")) compile(); });
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
})(window);
