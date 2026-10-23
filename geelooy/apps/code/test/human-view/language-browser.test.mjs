//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import { connectBrowser, navigateCode } from "./browser-harness.mjs";
import { openHumanTakeover, setSyntheticTab } from "./browser-fixtures.mjs";

const browser = await connectBrowser();
try {
	await browser.call("Emulation.setDeviceMetricsOverride", { width: 1180, height: 820, deviceScaleFactor: 1, mobile: false });
	await navigateCode(browser, "languageTakeover");
	const htmlSource = '<!doctype html><html><head><title>Page</title><style>.x{content:"<main>fake</main>"}</style></head><body><nav><a href="/">Home</a></nav><main><h1>Dashboard</h1><form><button>Save</button></form></main><script>const x="<button>Not real</button>";</script></body></html>';
	await setSyntheticTab(browser, "human-html-test", "page.html", htmlSource);
	assert.deepEqual(await openHumanTakeover(browser, "takeover=html"), { ok: true, state: "document" });
	const html = await browser.evaluate(`(()=>{const root=document.querySelector('.human-takeover-root');root.querySelector('[data-human-level-choice="structure"]').click();const text=root.querySelector('#human-view-body').innerText;return{landmarks:text.includes('Landmarks'),headings:text.includes('Headings'),controls:text.includes('Forms & controls'),links:text.includes('Links'),fake:text.includes('Not real')}})()`);
	assert.deepEqual(html, { landmarks: true, headings: true, controls: true, links: true, fake: false });

	const syntheticJs = 'import x from "y"; export function hello(){ return 1 }';
	await setSyntheticTab(browser, "human-js-test", "module.js", syntheticJs);
	assert.deepEqual(await openHumanTakeover(browser, "takeover=js", 5000), { ok: true, state: "document" });
	const js = await browser.evaluate(`(()=>{const root=document.querySelector('.human-takeover-root');root.querySelector('[data-human-level-choice="structure"]').click();const structure=root.querySelector('#human-view-body').innerText;root.querySelector('[data-human-level-choice="source"]').click();const source=root.querySelector('#human-view-body').innerText;return{depends:structure.includes('Depends on'),exposes:structure.includes('Exposes'),contains:structure.includes('Contains'),module:structure.includes('y'),hello:structure.includes('hello'),merkava:source.includes('Merkava AST'),level:root.dataset.humanLevel}})()`);
	assert.deepEqual(js, { depends: true, exposes: true, contains: true, module: true, hello: true, merkava: true, level: "source" });
	const sourceDescent = await browser.evaluate(`(async()=>{const root=document.querySelector('.human-takeover-root');const button=root.querySelector('.human-source-button');button.click();await new Promise(resolve=>setTimeout(resolve,80));const editor=document.querySelector('#editor');return{root:!!document.querySelector('.human-takeover-root'),start:editor.selectionStart,end:editor.selectionEnd,selected:editor.value.slice(editor.selectionStart,editor.selectionEnd)}})()`);
	assert.equal(sourceDescent.root, false);
	assert.equal(sourceDescent.selected, 'import x from "y";');
	assert.equal(sourceDescent.start, 0);
	assert.equal(sourceDescent.end, 'import x from "y";'.length);

	const realSource = await browser.evaluate(`fetch('/apps/code/js/features/human-view/navigation.js').then(response=>response.text())`);
	assert.match(realSource, /revealHumanViewSource/);
	await setSyntheticTab(browser, "human-real-js-test", "navigation.js", realSource);
	assert.deepEqual(await openHumanTakeover(browser, "takeover=real-js", 5000), { ok: true, state: "document" });
	const realJs = await browser.evaluate(`(()=>{const root=document.querySelector('.human-takeover-root');root.querySelector('[data-human-level-choice="structure"]').click();const text=root.querySelector('#human-view-body').innerText;return{contains:text.includes('Contains'),first:text.includes('revealHumanViewSource'),second:text.includes('revealSourceRange')}})()`);
	assert.deepEqual(realJs, { contains: true, first: true, second: true });
	assert.deepEqual(browser.exceptions, []);
	console.log("__LOCAL_HUMAN_TAKEOVER_LANGUAGES_PASS__");
} finally {
	browser.close();
}
