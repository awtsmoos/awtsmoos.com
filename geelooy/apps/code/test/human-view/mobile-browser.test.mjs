//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import { connectBrowser, navigateCode } from "./browser-harness.mjs";
import { openHumanTakeover, setSyntheticTab } from "./browser-fixtures.mjs";

const browser = await connectBrowser();
try {
	await browser.call("Emulation.setDeviceMetricsOverride", { width: 390, height: 844, deviceScaleFactor: 3, mobile: true });
	await navigateCode(browser, "mobileTakeover");
	const pre = await browser.evaluate(`(()=>{const rs=performance.getEntriesByType('resource');return{version:document.documentElement.dataset.codeAssetVersion||null,root:!!document.querySelector('.human-takeover-root'),styles:rs.filter(x=>x.name.includes('/css/features/human-view/')).length,modules:rs.filter(x=>x.name.includes('/js/features/human-view/')).length}})()`);
	assert.equal(pre.root, false);
	assert.equal(pre.styles, 0);
	assert.equal(pre.modules, 0);
	assert.ok(pre.version);
	await setSyntheticTab(browser, "human-mobile-test", "mobile.css", "@media (max-width: 768px) { .panel { display: block; } }");
	assert.deepEqual(await openHumanTakeover(browser, "takeover=mobile"), { ok: true, state: "document" });
	const mobile = await browser.evaluate(`(()=>{
		const root=document.querySelector('.human-takeover-root');
		const links=[...document.querySelectorAll('link[data-human-view-style="true"]')];
		const zoom=root.querySelector('.human-zoom');
		const actions=[...root.querySelectorAll('.human-header-actions button')];
		const levels=[...root.querySelectorAll('[data-human-level-choice]')];
		root.querySelector('[data-human-level-choice="behavior"]').click();
		const behavior=root.dataset.humanLevel;
		root.querySelector('[data-human-level-choice="source"]').click();
		return {
			linkCount:links.length,
			ready:links.every(link=>Boolean(link.sheet)&&link.dataset.humanViewLoaded==='true'),
			versions:links.map(link=>new URL(link.href).searchParams.get('v')),
			zoomDirection:getComputedStyle(zoom).flexDirection,
			minActionHeight:Math.min(...actions.map(button=>button.getBoundingClientRect().height)),
			levelCount:levels.length,
			behavior,
			source:root.dataset.humanLevel,
			scrollWidth:root.scrollWidth,
			clientWidth:root.clientWidth
		};
	})()`);
	assert.equal(mobile.linkCount, 8);
	assert.equal(mobile.ready, true);
	assert.ok(mobile.versions.every(version => version === pre.version));
	assert.equal(mobile.zoomDirection, "row");
	assert.ok(mobile.minActionHeight >= 38);
	assert.equal(mobile.levelCount, 4);
	assert.equal(mobile.behavior, "behavior");
	assert.equal(mobile.source, "source");
	assert.ok(mobile.scrollWidth <= mobile.clientWidth + 2);
	assert.deepEqual(browser.exceptions, []);
	console.log("__LOCAL_HUMAN_TAKEOVER_MOBILE_PASS__");
} finally {
	browser.close();
}
