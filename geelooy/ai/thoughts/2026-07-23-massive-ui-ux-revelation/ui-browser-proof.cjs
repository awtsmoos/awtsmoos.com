//B"H
// Boruch Hashem
// Blessed is He

const fs = require("node:fs");
const path = require("node:path");
const CDP = require("chrome-remote-interface");

const PORT = 9381;
const ROOT = __dirname;

/**
 * A real browser becomes the witness of Malchus. The Awtsmoos creates viewport,
 * input, focus, and pixel anew; Awtsmoos.com records geometry instead of asking
 * memory to impersonate evidence.
 */
async function run() {
	const target = await CDP.New({ port: PORT, url: "about:blank" });
	const client = await CDP({ port: PORT, target });
	const { Emulation, Page, Runtime } = client;
	await Promise.all([Page.enable(), Runtime.enable()]);
	const evidence = {};
	for (const viewport of viewports()) {
		await prepareViewport(Emulation, Page, Runtime, viewport);
		if (viewport.scene) {
			await click(Runtime, `.mobile-nav-${viewport.scene}`);
		}
		evidence[viewport.name] = await probe(Runtime, viewport);
		await screenshot(Page, `${viewport.name}.png`);
	}
	evidence.escape = await verifyEscape(Emulation, Page, Runtime);
	evidence.ok = Object.values(evidence).every(item => item?.ok !== false);
	fs.writeFileSync(
		path.join(ROOT, "ui-browser-evidence.json"),
		`${JSON.stringify(evidence, null, 2)}\n`
	);
	await client.close();
	await CDP.Close({ port: PORT, id: target.id });
	if (!evidence.ok) {
		throw new Error(`UI browser proof failed: ${JSON.stringify(evidence)}`);
	}
	console.log(JSON.stringify(evidence, null, 2));
}

function viewports() {
	return [
		{ name: "mobile-chat", width: 390, height: 844, mobile: true, scene: "chat" },
		{ name: "mobile-conversations", width: 390, height: 844, mobile: true, scene: "conversations" },
		{ name: "mobile-automation", width: 390, height: 844, mobile: true, scene: "automation" },
		{ name: "tablet-chat", width: 768, height: 900, mobile: true, scene: "chat" },
		{ name: "laptop", width: 1280, height: 800, mobile: false },
		{ name: "desktop", width: 1440, height: 900, mobile: false },
		{ name: "ultrawide", width: 1920, height: 1080, mobile: false }
	];
}

async function prepareViewport(Emulation, Page, Runtime, viewport) {
	await Emulation.setDeviceMetricsOverride({
		width: viewport.width,
		height: viewport.height,
		deviceScaleFactor: viewport.mobile ? 2 : 1,
		mobile: viewport.mobile
	});
	await Page.navigate({ url: fixtureUrl() });
	await waitForReady(Runtime);
}

async function probe(Runtime, viewport) {
	const threshold = viewport.width >= 1300 ? 560 : 520;
	return evaluate(Runtime, `(() => {
		const rect = selector => document.querySelector(selector)?.getBoundingClientRect().toJSON() || null;
		const main = rect('.main');
		const sidebar = rect('#sidebar');
		const automation = rect('#automation-panel');
		const composer = rect('.input-area');
		const dock = rect('.mobile-bottom-dock');
		const crown = rect('.mobile-app-crown');
		const active = document.body.dataset.mobileScene || 'desktop';
		const horizontalOverflow = document.documentElement.scrollWidth - innerWidth;
		const mobile = innerWidth <= 900;
		const selectors = { chat:'.main', conversations:'#sidebar', automation:'#automation-panel' };
		const activePanel = document.querySelector(selectors[active] || '.main');
		const otherPanelsInert = mobile ? [...document.querySelectorAll('#sidebar,.main,#automation-panel')].filter(node => node !== activePanel).every(node => node.inert) : true;
		const composerClear = !mobile || (composer.bottom <= dock.top + 1 && composer.left >= 0 && composer.right <= innerWidth + 1);
		const touchTargets = !mobile || [...document.querySelectorAll('.mobile-bottom-dock button,.mobile-app-crown button')].every(node => node.getBoundingClientRect().height >= 44);
		const centerWide = mobile || main.width >= ${threshold};
		return { ok:horizontalOverflow <= 1 && otherPanelsInert && composerClear && touchTargets && centerWide, viewport:{width:innerWidth,height:innerHeight}, active, horizontalOverflow, main, sidebar, automation, composer, dock, crown, otherPanelsInert, composerClear, touchTargets, centerWide, grid:getComputedStyle(document.querySelector('.container')).gridTemplateColumns };
	})()`);
}

async function verifyEscape(Emulation, Page, Runtime) {
	await prepareViewport(
		Emulation,
		Page,
		Runtime,
		{ width: 390, height: 844, mobile: true }
	);
	await click(Runtime, ".mobile-crown-menu");
	await evaluate(
		Runtime,
		`document.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true}))`
	);
	await delay(380);
	return evaluate(
		Runtime,
		`({ ok:document.body.dataset.mobileScene==='chat' && document.activeElement===document.querySelector('.mobile-crown-menu'), scene:document.body.dataset.mobileScene, focus:document.activeElement?.className || '' })`
	);
}

function fixtureUrl() {
	return "http://127.0.0.1:8096/ai/thoughts/2026-07-23-massive-ui-ux-revelation/ui-fixture.html";
}

async function waitForReady(Runtime) {
	for (let attempt = 0; attempt < 80; attempt += 1) {
		if (await evaluate(Runtime, `document.body?.dataset?.fixtureReady === 'true'`)) {
			return;
		}
		await delay(50);
	}
	throw new Error("UI fixture did not become ready.");
}

async function click(Runtime, selector) {
	await evaluate(Runtime, `document.querySelector(${JSON.stringify(selector)}).click()`);
	await delay(380);
}

async function evaluate(Runtime, expression) {
	const result = await Runtime.evaluate({
		expression,
		awaitPromise: true,
		returnByValue: true
	});
	if (result.exceptionDetails) {
		throw new Error(
			result.exceptionDetails.exception?.description
			|| result.exceptionDetails.text
		);
	}
	return result.result.value;
}

async function screenshot(Page, filename) {
	const image = await Page.captureScreenshot({
		format: "png",
		captureBeyondViewport: false
	});
	fs.writeFileSync(path.join(ROOT, filename), Buffer.from(image.data, "base64"));
}

function delay(milliseconds) {
	return new Promise(resolve => setTimeout(resolve, milliseconds));
}

run().catch(error => {
	console.error(error.stack || error);
	process.exit(1);
});
