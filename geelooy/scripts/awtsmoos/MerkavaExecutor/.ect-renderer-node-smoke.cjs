// B"H
const fs = require("fs");
const vm = require("vm");

let currentEngine = "virtual";
const frame = { contentDocument: makeDoc() };
const ect = {
  el: id => id === "preview" ? frame : { value: currentEngine },
  concatFiles: (project, ext) => Object.keys(project.files).filter(name => name.endsWith(ext)).map(name => project.files[name]).join("\n"),
  escapeHtml: value => String(value || "").replace(/[&<>]/g, ch => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[ch]))
};
const sandbox = { window: { AwtsEctBrowser: ect } };
vm.createContext(sandbox);
vm.runInContext(fs.readFileSync("app/browser/renderers.js", "utf8"), sandbox);

const compiled = {
  renderCss: '.card{padding:24px;border-radius:18px;background:#071923;color:#eaffff}button{padding:10px;border-radius:999px}',
  renderReconstruction: { html: '<article class="card"><h2>Awtsmoos Bit Garden</h2><button id="ignite">Ignite</button><output id="spark">waiting</output></article>', css: "" },
  reconstruction: { html: '<article><h2></h2><button></button><output></output></article>', css: "" }
};
let verdict = ect.render({ files: {} }, compiled);
assert(verdict.ok, "virtual renderer failed");
assert(verdict.engine === "Merkava Virtual DOM", "wrong virtual engine");
assert(frame.contentDocument.html.includes("Awtsmoos Bit Garden"), "virtual text missing");
assert(frame.contentDocument.html.includes("background:#071923"), "virtual exact css missing");

currentEngine = "webgl";
frame.contentDocument = makeDoc();
verdict = ect.render({ files: {} }, compiled);
assert(verdict.ok, "webgl renderer failed: " + verdict.error);
assert(verdict.engine === "Merkava WebGL", "wrong webgl engine");
assert(Number(frame.contentDocument.canvas.dataset.primitiveCount) >= 4, "webgl primitive count too small");
assert(frame.contentDocument.gl.drawCount > 0, "webgl drawArrays not called");
assert(frame.contentDocument.html.includes("measured CSS boxes") || frame.contentDocument.html.includes("compiled tree fallback"), "webgl title missing render path");
assert(frame.contentDocument.html.includes("Awtsmoos Bit Garden"), "webgl text overlay missing");
assert(frame.contentDocument.html.includes("Ignite"), "webgl button overlay missing");
console.log(JSON.stringify({ virtual: true, webgl: true, measured: verdict.measured, primitives: frame.contentDocument.canvas.dataset.primitiveCount, drawCount: frame.contentDocument.gl.drawCount }));

function makeDoc() {
  const doc = {
    html: "", canvas: null, gl: null, body: null, measure: null,
    defaultView: { getComputedStyle: node => ({ backgroundColor: node.tagName === "ARTICLE" ? "rgb(7, 25, 35)" : node.tagName === "BUTTON" ? "rgb(230, 230, 230)" : "rgb(255, 255, 255)" }) },
    open() { this.html = ""; },
    write(value) { this.html += value; if (value.includes("merkavaCanvas")) this.canvas = makeCanvas(this); if (value.includes("awtsMeasure")) this.measure = makeMeasure(this, value); this.body = makeBody(this); },
    close() {},
    getElementById(id) { if (id === "merkavaCanvas") return this.canvas; if (id === "awtsMeasure") return this.measure; if (id === "merkavaOverlay") return { set innerHTML(value) { doc.html += '<div id="merkavaOverlay">' + value + '</div>'; } }; return null; },
    createElement(name) { return name === "template" ? makeTemplate(this) : { className: "", textContent: "" }; }
  };
  return doc;
}
function makeBody(doc) { return { querySelectorAll() { return [1, 2, 3, 4]; }, appendChild(node) { doc.html += '<div class="' + node.className + '">' + node.textContent + '</div>'; } }; }
function makeMeasure(doc, html) { const nodes = parseTree(html, doc); return { getBoundingClientRect: () => ({ left: 0, top: 0, right: 360, bottom: 260, width: 360, height: 260 }), querySelectorAll: () => flatten(nodes) }; }
function makeTemplate(doc) { return { content: { children: [] }, set innerHTML(value) { this.content.children = parseTree(value, doc); } }; }
function makeElement(tag, doc) { return { nodeType: 1, tagName: tag.toUpperCase(), children: [], childNodes: [], parentElement: null, ownerDocument: doc, textContent: "", appendChild(child) { this.childNodes.push(child); if (child.nodeType === 1) this.children.push(child); } }; }
function parseTree(html, doc) { const root = { children: [] }; const stack = [root]; const re = /(<\/?[a-zA-Z0-9-]+[^>]*>)|([^<]+)/g; let m, count = 0; while ((m = re.exec(html))) { if (m[2]) { const text = m[2].trim(); if (text && stack[stack.length - 1].appendChild) stack[stack.length - 1].appendChild({ nodeType: 3, nodeValue: text }); continue; } const close = m[1][1] === "/"; const tag = (m[1].match(/^<\/?([a-zA-Z0-9-]+)/) || [,"x"])[1]; if (close) { if (stack.length > 1) stack.pop(); continue; } const node = makeElement(tag, doc); node.getBoundingClientRect = () => ({ left: 20 + count * 18, top: 20 + count * 34, right: 320 - count * 8, bottom: 84 + count * 34, width: 300 - count * 26, height: 64 }); count += 1; stack[stack.length - 1].children.push(node); if (!/\/$/.test(m[1])) stack.push(node); } return root.children; }
function flatten(nodes) { const out = []; nodes.forEach(node => { out.push(node); out.push(...flatten(node.children || [])); }); return out; }
function makeCanvas(doc) { return { dataset: {}, setAttribute() {}, width: 720, height: 520, getContext() { doc.gl = makeGl(this); return doc.gl; } }; }
function makeGl(canvas) { return { canvas, VERTEX_SHADER: 1, FRAGMENT_SHADER: 2, COMPILE_STATUS: 3, LINK_STATUS: 4, ARRAY_BUFFER: 5, STATIC_DRAW: 6, FLOAT: 7, TRIANGLES: 8, COLOR_BUFFER_BIT: 9, drawCount: 0, createShader() { return {}; }, shaderSource() {}, compileShader() {}, getShaderParameter() { return true; }, createProgram() { return {}; }, attachShader() {}, linkProgram() {}, getProgramParameter() { return true; }, viewport() {}, clearColor() {}, clear() {}, useProgram() {}, createBuffer() { return {}; }, bindBuffer() {}, bufferData() {}, getAttribLocation() { return 0; }, enableVertexAttribArray() {}, vertexAttribPointer() {}, drawArrays(mode, first, count) { this.drawCount = count; } }; }
function assert(value, message) { if (!value) throw new Error(message); }
