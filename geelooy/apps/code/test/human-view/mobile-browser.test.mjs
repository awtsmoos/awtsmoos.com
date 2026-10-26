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
		let root=document.querySelector('.human-takeover-root');
		const links=[...document.querySelectorAll('link[data-human-view-style="true"]')];
		let zoom=root.querySelector('.human-zoom');
		let dock=root.querySelector('.human-mobile-dock');
		const zoomDirection=getComputedStyle(zoom).flexDirection;
		const dockDisplay=getComputedStyle(dock).display;
		const visibleActions=[...root.querySelectorAll('.human-header-actions button')].filter(button=>button.getBoundingClientRect().height>0);
		const minActionHeight=Math.min(...visibleActions.map(button=>button.getBoundingClientRect().height));
		const levelCount=root.querySelectorAll('[data-human-level-choice]').length;
		const dockModeCount=dock.querySelectorAll('[data-human-mode-choice]').length;
		root.querySelector('[data-human-level-choice="behavior"]').click();
		root=document.querySelector('.human-takeover-root');
		const behavior=root.dataset.humanLevel;
		root.querySelector('[data-human-level-choice="source"]').click();
		root=document.querySelector('.human-takeover-root');
		const source=root.dataset.humanLevel;
		dock=root.querySelector('.human-mobile-dock');
		dock.querySelector('[data-human-mode-choice="map"]').click();
		root=document.querySelector('.human-takeover-root');
		return{linkCount:links.length,ready:links.every(link=>Boolean(link.sheet)&&link.dataset.humanViewLoaded==='true'),versions:links.map(link=>new URL(link.href).searchParams.get('v')),zoomDirection,dockDisplay,minActionHeight,levelCount,dockModeCount,behavior,source,mapMode:root.dataset.humanMode,scrollWidth:root.scrollWidth,clientWidth:root.clientWidth};
	})()`);
	assert.equal(mobile.linkCount, 15);
	assert.equal(mobile.ready, true);
	assert.ok(mobile.versions.every(version => version === pre.version));
	assert.equal(mobile.zoomDirection, "row");
	assert.equal(mobile.dockDisplay, "grid");
	assert.ok(mobile.minActionHeight >= 38);
	assert.equal(mobile.levelCount, 4);
	assert.equal(mobile.dockModeCount, 4);
	assert.equal(mobile.behavior, "behavior");
	assert.equal(mobile.source, "source");
	assert.equal(mobile.mapMode, "map");
	assert.ok(mobile.scrollWidth <= mobile.clientWidth + 2);
	assert.deepEqual(browser.exceptions, []);
	console.log("__LOCAL_NEON_HUMAN_TAKEOVER_MOBILE_PASS__");
} finally {
	browser.close();
}
