// B"H — verify the app's engine-adapter.js (hit-test, click dispatch, anchor
// nav, popup seam) against the VENDORED engine copy, in browser load order.
import { readFileSync } from "fs";
import { runInThisContext } from "vm";
import { pathToFileURL } from "url";

const APP = new URL("..", import.meta.url).pathname.replace(/\/$/, "");
const ENG = APP + "/engine";

// minimal browser globals the adapter touches
globalThis.ImageData = class ImageData {
  constructor(data, w, h) { this.data = data; this.width = w; this.height = h; }
};
globalThis.window = globalThis; // publishPageEngine writes window.__merkavaPageEngine

let pass = 0, fail = 0;
function assert(name, cond, detail = "") {
  if (cond) { pass++; console.log(`  PASS ${name}${detail ? " — " + detail : ""}`); }
  else { fail++; console.log(`  FAIL ${name}${detail ? " — " + detail : ""}`); }
}

// 1. browser load order: UMD classic scripts -> vm-core.js
const UMD_ORDER = ["CssSyntaxCharacters", "CssSyntaxTokenizer", "CssDeclarationParser", "CssRuleParser",
  "CssSelectorList", "CssSelectorScanner", "CssSpecificity", "CssConditionEvaluator",
  "CssRuleCompiler", "CssInheritedProperties", "CssAttributeSelector", "CssNthExpression",
  "CssPseudoMatcher", "CssSelectorMatcher", "CssRuleIndex", "CssTransition", "CssTransform", "CssPseudoElements"];
for (const n of UMD_ORDER) runInThisContext(readFileSync(`${ENG}/umd/${n}.js`, "utf8"), { filename: n + ".js" });
runInThisContext(readFileSync(`${ENG}/vm-core.js`, "utf8"), { filename: "vm-core.js" });

// 2. engine + the app's adapter module
const { createMerkavaEngine } = await import(pathToFileURL(`${ENG}/merkava-engine.js`).href);
const adapter = await import(pathToFileURL(`${APP}/js/engine-adapter.js`).href);
const engine = await createMerkavaEngine(readFileSync(`${ENG}/merkava-pixel.wasm`));
assert("engine has renderPage + createPage", typeof engine.renderPage === "function" && typeof engine.createPage === "function");

// 3. interactive page with a JS-driven button and an <a href>
const PAGE = `<!doctype html><html><head><style>
body{margin:0;background:#ffffff;}
#btn{position:absolute;left:50px;top:40px;width:120px;height:40px;background:#2244cc;color:#fff;}
#box{position:absolute;left:50px;top:110px;width:120px;height:60px;background:#22cc44;}
#lnk{position:absolute;left:50px;top:200px;width:200px;height:30px;color:#0000ee;}
</style></head><body>
<button id="btn">press me</button>
<div id="box"></div>
<a id="lnk" href="https://example.com/page2">go somewhere</a>
<script>
document.getElementById('btn').addEventListener('click', function() {
  document.getElementById('box').style.backgroundColor = '#ff0000';
});
</script>
</body></html>`;

const page = await adapter.createInteractivePage(engine, PAGE, { width: 400, height: 300 });
assert("createInteractivePage renders", page.lastRender && page.lastRender.width === 400, `backend=${page.lastRender.backend}`);
assert("guest script ran", page.scriptRuns.length === 1 && page.scriptRuns[0].ok === true);

// 4. hit-test the button (center ~ (110, 60)) -> dispatch -> box turns red
const isRed = (r, g, b) => r > 200 && g < 80 && b < 80;
const redBefore = page.countPixels(isRed);
const hitBtn = adapter.hitTest(page, 110, 60);
assert("hitTest finds the button", !!hitBtn && hitBtn.node.localName === "button", hitBtn ? hitBtn.node.localName : "null");
const clickBtn = adapter.clickPageAt(page, 110, 60);
assert("click dispatches to guest listener", clickBtn.hit && clickBtn.listenerCount === 1 && clickBtn.results[0].ok === true,
  JSON.stringify({ tag: clickBtn.tag, listeners: clickBtn.listenerCount }));
const redAfter = page.countPixels(isRed);
assert("guest mutation repainted (box red)", redAfter - redBefore > 3000, `red ${redBefore} -> ${redAfter}`);

// 5. hit-test the link (center ~ (150, 215)) -> href detected, no listeners
const clickLnk = adapter.clickPageAt(page, 150, 215);
assert("link hit returns href", clickLnk.hit && clickLnk.href === "https://example.com/page2",
  JSON.stringify({ tag: clickLnk.tag, href: clickLnk.href, prevented: clickLnk.defaultPrevented }));

// 6. empty area -> hits body (covers viewport), no href, no listeners
const clickEmpty = adapter.clickPageAt(page, 380, 290);
assert("empty area hits body only", clickEmpty.hit === true && clickEmpty.tag === "body" && clickEmpty.href === null && clickEmpty.listenerCount === 0,
  JSON.stringify({ tag: clickEmpty.tag, href: clickEmpty.href }));

// 7. preventDefault honored: link with a cancelling listener
const PAGE2 = `<!doctype html><html><head><style>
#lnk2{position:absolute;left:10px;top:10px;width:200px;height:30px;}
</style></head><body>
<a id="lnk2" href="https://example.com/nope">stay</a>
<script>
document.getElementById('lnk2').addEventListener('click', function(e) { e.preventDefault(); });
</script></body></html>`;
const page2 = await adapter.createInteractivePage(engine, PAGE2, { width: 400, height: 300 });
const clickCancel = adapter.clickPageAt(page2, 100, 25);
assert("preventDefault suppresses navigation", clickCancel.hit && clickCancel.defaultPrevented === true && clickCancel.href === "https://example.com/nope",
  JSON.stringify({ prevented: clickCancel.defaultPrevented, href: clickCancel.href }));

// 8. popup renderer seam: window.__merkavaPageEngine.renderPage
adapter.publishPageEngine(engine);
const seam = globalThis.__merkavaPageEngine;
assert("popup seam published", !!seam && typeof seam.renderPage === "function");
const pop = await seam.renderPage("<html><body><h1>hi</h1></body></html>", { width: 400, height: 300, css: "", js: false, wasm: true });
assert("popup render resolves pixels", pop.data instanceof Uint8ClampedArray && pop.width === 400 && pop.height === 300,
  `${pop.width}x${pop.height}`);

// 9. blitRender onto a stub canvas
let put = null;
const stubCanvas = { width: 0, height: 0, getContext: () => ({ putImageData: (img) => { put = img; } }) };
adapter.blitRender(stubCanvas, page.lastRender);
assert("blitRender paints canvas", stubCanvas.width === 400 && stubCanvas.height === 300 && put && put.width === 400);

// 10. static path still works (JS-off fallback)
const stub2 = { width: 0, height: 0, getContext: () => ({ putImageData: () => {} }) };
const st = adapter.renderToCanvas(engine, stub2, "<html><body><p>static</p></body></html>", { width: 200, height: 100 });
assert("renderToCanvas static path", st.width === 200 && st.height === 100 && st.backend === "merkava-wasm/1.0", st.backend);

console.log(`\n==== adapter-integration: ${pass} pass, ${fail} fail ====`);
process.exit(fail ? 1 : 0);
