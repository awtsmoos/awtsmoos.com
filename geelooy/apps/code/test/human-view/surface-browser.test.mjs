//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import { connectBrowser, navigateCode } from "./browser-harness.mjs";
import { openHumanTakeover, setSyntheticTab } from "./browser-fixtures.mjs";

const browser = await connectBrowser();
try {
	await browser.call("Emulation.setDeviceMetricsOverride", { width: 1180, height: 820, deviceScaleFactor: 1, mobile: false });
	await navigateCode(browser, "neonSurface");
	const source = ".card { display: grid; gap: 16px; }\n@media (max-width: 768px) { .card { display: block; } }";
	await setSyntheticTab(browser, "human-neon-test", "neon.css", source);
	assert.deepEqual(await openHumanTakeover(browser, "takeover=neon"), { ok: true, state: "document" });
	const documentState = await browser.evaluate(`(()=>{const root=document.querySelector('.human-takeover-root');const styles=getComputedStyle(root);return{mode:root.dataset.humanMode,document:!!root.querySelector('.human-takeover-document'),desktopModes:root.querySelectorAll('.human-mode-tabs [data-human-mode-choice]').length,meaning:styles.getPropertyValue('--human-meaning').trim(),structure:styles.getPropertyValue('--human-structure').trim(),behavior:styles.getPropertyValue('--human-behavior').trim(),source:styles.getPropertyValue('--human-source').trim()}})()`);
	assert.equal(documentState.mode, "document");
	assert.equal(documentState.document, true);
	assert.equal(documentState.desktopModes, 4);
	assert.ok(documentState.meaning && documentState.structure && documentState.behavior && documentState.source);

	const mapState = await browser.evaluate(`(()=>{const root=document.querySelector('.human-takeover-root');root.querySelector('.human-mode-tabs [data-human-mode-choice="map"]').click();return{mode:root.dataset.humanMode,rootNode:!!root.querySelector('.human-map-root'),sections:root.querySelectorAll('.human-map-section').length,facts:root.querySelectorAll('.human-map-fact').length}})()`);
	assert.equal(mapState.mode, "map");
	assert.equal(mapState.rootNode, true);
	assert.ok(mapState.sections > 0);
	assert.ok(mapState.facts > 0);

	const sourceState = await browser.evaluate(`(()=>{const root=document.querySelector('.human-takeover-root');root.querySelector('.human-map-fact').click();return{mode:root.dataset.humanMode,detail:!!root.querySelector('.human-source-detail'),snippet:!!root.querySelector('.human-source-snippet'),index:!!root.querySelector('.human-source-index')}})()`);
	assert.deepEqual(sourceState, { mode: "source", detail: true, snippet: true, index: true });

	const behaviorState = await browser.evaluate(`(()=>{const root=document.querySelector('.human-takeover-root');root.querySelector('.human-mode-tabs [data-human-mode-choice="behavior"]').click();const input=root.querySelector('.human-decision-form input[name="value"]');return{mode:root.dataset.humanMode,studio:!!root.querySelector('.human-behavior-studio'),input:input?.value||null,context:root.querySelectorAll('.human-device-context strong').length}})()`);
	assert.deepEqual(behaviorState, { mode: "behavior", studio: true, input: "768", context: 3 });
	assert.deepEqual(browser.exceptions, []);
	console.log("__LOCAL_NEON_HUMAN_TAKEOVER_SURFACE_PASS__");
} finally {
	browser.close();
}
