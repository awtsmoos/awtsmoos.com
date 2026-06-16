// B"H
import assert from "node:assert";
import { runRenderLab, runRenderMode } from "./renderLab.js";

const html = `<!doctype html><body><style>main{background:#123;color:white;padding:20px}</style><main><h1>B"H Lab</h1><button id="draw">draw</button></main></body>`;
const one = await runRenderMode("merkava-image", { html, entry: "index.html", width: 320, height: 180 });
assert.strictEqual(one.ok, true);
assert(one.screenshot, "merkava-image should create screenshot metadata");
assert(one.screenshot.dataUrl.startsWith("data:image/png;base64,"));
const lab = await runRenderLab({ html, modes: ["merkava", "merkava-image"], width: 320, height: 180 });
assert.strictEqual(lab.ok, true);
assert.strictEqual(lab.results.length, 2);
assert(lab.reportHtml.includes("DOM-DOM / Merkava Render Lab"));
assert(lab.summary.screenshotModes >= 1);
console.log("BHY render lab service tests passed");
