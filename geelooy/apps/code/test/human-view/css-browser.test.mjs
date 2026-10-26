//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import { connectBrowser, navigateCode } from "./browser-harness.mjs";
import { openHumanTakeover, setSyntheticTab } from "./browser-fixtures.mjs";

const browser = await connectBrowser();
try {
	await browser.call("Emulation.setDeviceMetricsOverride", { width: 1180, height: 820, deviceScaleFactor: 1, mobile: false });
	await navigateCode(browser, "cssTakeover");
	const pre = await browser.evaluate(`(()=>{const rs=performance.getEntriesByType('resource');return{root:!!document.querySelector('.human-takeover-root'),styles:rs.filter(x=>x.name.includes('/css/features/human-view/')).length,modules:rs.filter(x=>x.name.includes('/js/features/human-view/')).length}})()`);
	assert.deepEqual(pre, { root: false, styles: 0, modules: 0 });
	const source = ".card { display: grid; }\n@media (max-width: 768px) { .card { display: block; } }";
	await setSyntheticTab(browser, "human-css-test", "semantic-test.css", source);
	assert.deepEqual(await openHumanTakeover(browser, "takeover=css"), { ok: true, state: "document" });
	const before = await browser.evaluate(`(()=>{const root=document.querySelector('.human-takeover-root');root.querySelector('[data-human-level-choice="behavior"]').click();const input=root.querySelector('.human-decision-form input[name="value"]');return{title:root.querySelector('#human-takeover-title').textContent,level:root.dataset.humanLevel,input:input?.value||null,decision:!!root.querySelector('.human-decision'),styles:[...document.querySelectorAll('link[data-human-view-style="true"]')].filter(x=>x.sheet).length}})()`);
	assert.deepEqual(before, { title: "semantic-test.css", level: "behavior", input: "768", decision: true, styles: 15 });
	const after = await browser.evaluate(`(async()=>{const root=document.querySelector('.human-takeover-root'),input=root.querySelector('.human-decision-form input[name="value"]');input.value='800';input.closest('form').requestSubmit();await new Promise(r=>setTimeout(r,650));const {State}=await import('/apps/code/js/state.js');const tab=State.tabs.find(x=>x.id==='human-css-test');return{editor:document.querySelector('#editor').value,tabContent:tab.content,dirty:tab.isDirty,level:root.dataset.humanLevel,input:root.querySelector('.human-decision-form input[name="value"]')?.value||null,feedback:root.querySelector('#human-takeover-feedback').textContent}})()`);
	const expected = ".card { display: grid; }\n@media (max-width: 800px) { .card { display: block; } }";
	assert.equal(after.editor, expected);
	assert.equal(after.tabContent, expected);
	assert.equal(after.dirty, true);
	assert.equal(after.input, "800");
	assert.equal(after.level, "behavior");
	assert.match(after.feedback, /re-read/i);
	const stale = await browser.evaluate(`(async()=>{const root=document.querySelector('.human-takeover-root'),editor=document.querySelector('#editor');editor.value=editor.value.replace('800px','801px');const input=root.querySelector('.human-decision-form input[name="value"]');input.value='900';input.closest('form').requestSubmit();await new Promise(r=>setTimeout(r,200));return{editor:editor.value,feedback:root.querySelector('#human-takeover-feedback').textContent}})()`);
	assert.match(stale.editor, /801px/);
	assert.doesNotMatch(stale.editor, /900px/);
	assert.match(stale.feedback, /changed since/i);
	assert.deepEqual(browser.exceptions, []);
	console.log("__LOCAL_HUMAN_TAKEOVER_CSS_PASS__");
} finally {
	browser.close();
}
