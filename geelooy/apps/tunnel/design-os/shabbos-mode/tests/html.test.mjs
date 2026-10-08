//B"H — Shabbos Mode HTML transform tests. Run: node tests/html.test.mjs
import { strict as assert } from "node:assert";
import {
	addShabbosClass, expandDetails, stripScripts, injectStyle, insertNotice, applyShabbosHtml,
} from "../html.mjs";
import { renderShabbosPage, shabbosClientScript } from "../index.mjs";

const SAMPLE = `<!DOCTYPE html><html lang="en" class="theme-light"><head><title>T</title></head><body><main><h1>Hi</h1><details><summary>Q</summary><p>A</p></details><script src="app.js"></script></main></body></html>`;

// 1. Class merged, not duplicated.
{
	const out = addShabbosClass(SAMPLE);
	assert.ok(out.includes('class="theme-light shabbos-mode"'), "class merged: " + out.slice(0, 120));
	assert.equal((out.match(/shabbos-mode/g) || []).length, 1, "not duplicated");
	const again = addShabbosClass(out);
	assert.equal((again.match(/shabbos-mode/g) || []).length, 1, "idempotent");
	console.log("ok 1 - class merged idempotently");
}

// 2. Class added when html has no class attr.
{
	const out = addShabbosClass("<html><body></body></html>");
	assert.ok(out.includes('<html class="shabbos-mode">'), "class added");
	console.log("ok 2 - class added to bare html tag");
}

// 3. Details expanded.
{
	const out = expandDetails('<details class="x"><summary>S</summary><p>P</p></details><details open><summary>O</summary></details>');
	assert.ok(out.includes('<details class="x" open>'), "closed details opened");
	assert.equal((out.match(/<details[^>]*open>/g) || []).length, 2, "already-open untouched");
	console.log("ok 3 - details expanded");
}

// 4. Scripts stripped except data-shabbos-keep.
{
	const html = '<script src="a.js"></script><script data-shabbos-keep>var x=1;</script><p>ok</p>';
	const out = stripScripts(html);
	assert.ok(!out.includes('src="a.js"'), "plain script removed");
	assert.ok(out.includes("data-shabbos-keep"), "kept script preserved");
	assert.ok(out.includes("<p>ok</p>"), "content preserved");
	console.log("ok 4 - scripts stripped selectively");
}

// 5. Style injected before </head>.
{
	const out = injectStyle(SAMPLE, ".x{color:red}");
	assert.ok(out.indexOf('data-shabbos="shabbos-mode"') < out.indexOf("</head>"), "style before /head");
	console.log("ok 5 - style injected in head");
}

// 6. Notice inserted after body open.
{
	const out = insertNotice(SAMPLE);
	assert.ok(out.includes('class="shabbos-notice"'), "notice present");
	assert.ok(out.includes("שבת שלום"), "hebrew greeting present");
	assert.ok(out.indexOf("shabbos-notice") > out.indexOf("<body>"), "after body open");
	console.log("ok 6 - notice inserted");
}

// 7. Full transform: class + css + details + notice + client script.
{
	const out = applyShabbosHtml(SAMPLE, { lat: 31.7, lon: 35.2, utcOffsetMin: 180 });
	assert.ok(out.includes("shabbos-mode"), "class applied");
	assert.ok(out.includes("animation: none !important"), "css injected");
	assert.ok(out.includes("@media print"), "print css injected");
	assert.ok(out.includes("<details open>"), "details expanded");
	assert.ok(out.includes("shabbos-notice"), "notice present");
	assert.ok(out.includes("data-shabbos-client"), "client script inlined");
	assert.ok(out.includes("getShabbosWindow"), "time fns embedded in client");
	console.log("ok 7 - full transform end to end");
}

// 8. Facade renderShabbosPage equals applyShabbosHtml with defaults.
{
	const a = renderShabbosPage(SAMPLE, { lat: 1, lon: 2, utcOffsetMin: 0 });
	assert.ok(a.includes("shabbos-mode"), "facade works");
	console.log("ok 8 - facade works");
}

// 9. Client script is syntactically valid JS.
{
	const src = shabbosClientScript({ lat: 31.7, lon: 35.2 });
	assert.ok(src.includes("Enter Shabbos mode"), "offer banner text");
	assert.ok(src.includes("localStorage"), "persistence");
	const { Script } = await import("node:vm");
	new Script(src, { filename: "shabbos-client.js" });
	console.log("ok 9 - client script parses as valid JS");
}

// 10. stripScripts option flows through.
{
	const out = applyShabbosHtml(SAMPLE, { stripScripts: true, inlineScript: false });
	assert.ok(!out.includes('src="app.js"'), "app script stripped");
	console.log("ok 10 - stripScripts option");
}

console.log("\nAll html tests passed.");
