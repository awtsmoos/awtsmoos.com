//B"H
// Boruch Hashem
// Blessed is He

const fs = require("node:fs");
const path = require("node:path");
const CDP = require("chrome-remote-interface");

const CHROME_PORT = 9380;
const OUTPUT_DIRECTORY = __dirname;

/**
 * The Awtsmoos lets Awtsmoos.com testify before it is reshaped. This witness
 * records the current geometry at five viewports and refuses to replace visual
 * evidence with memory or assumption.
 */
async function run() {
	const target = await CDP.New({ port: CHROME_PORT, url: "about:blank" });
	const client = await CDP({ port: CHROME_PORT, target });
	const { Emulation, Page, Runtime } = client;
	await Promise.all([Page.enable(), Runtime.enable()]);
	const evidence = {};
	for (const viewport of viewports()) {
		await setViewport(Emulation, viewport);
		await Page.navigate({ url: "http://127.0.0.1:8095/ai/" });
		await Page.loadEventFired();
		await delay(700);
		await evaluate(Runtime, syntheticFixture(viewport.scene));
		evidence[viewport.name] = await evaluate(Runtime, geometryProbe());
		await saveScreenshot(Page, `${viewport.name}.png`);
	}
	fs.writeFileSync(
		path.join(OUTPUT_DIRECTORY, "baseline-browser-evidence.json"),
		`${JSON.stringify(evidence, null, 2)}\n`
	);
	await client.close();
	await CDP.Close({ port: CHROME_PORT, id: target.id });
	console.log(JSON.stringify(evidence, null, 2));
}

function viewports() {
	return [
		{ name: "baseline-mobile-chat", width: 390, height: 844, mobile: true, scene: "chat" },
		{ name: "baseline-mobile-conversations", width: 390, height: 844, mobile: true, scene: "conversations" },
		{ name: "baseline-mobile-automation", width: 390, height: 844, mobile: true, scene: "automation" },
		{ name: "baseline-tablet", width: 768, height: 900, mobile: true, scene: "chat" },
		{ name: "baseline-laptop", width: 1280, height: 800, mobile: false, scene: "chat" },
		{ name: "baseline-desktop", width: 1440, height: 900, mobile: false, scene: "chat" },
		{ name: "baseline-ultrawide", width: 1920, height: 1080, mobile: false, scene: "chat" }
	];
}

function syntheticFixture(scene) {
	return `(() => {
		localStorage.removeItem('BH_ai_cockpit_layout_v2');
		document.body.dataset.mobileScene = ${JSON.stringify(scene)};
		const sidebar = document.getElementById('sidebar');
		const automation = document.getElementById('automation-panel');
		const main = document.querySelector('.main');
		sidebar?.classList.toggle('mobile-scene-active', ${JSON.stringify(scene)} === 'conversations');
		automation?.classList.toggle('mobile-scene-active', ${JSON.stringify(scene)} === 'automation');
		main?.classList.toggle('mobile-scene-active', ${JSON.stringify(scene)} === 'chat');
		const list = document.getElementById('conversation-items');
		if (list) list.innerHTML = Array.from({length:8}, (_, index) => '<li><span class="conversation-title">Conversation ' + (index + 1) + ' — a long remembered title</span></li>').join('');
		const chat = document.getElementById('chat-box');
		if (chat) chat.innerHTML = '<div class="message-shell end-flow"><div class="message user">Can the interface remain clear on every screen?</div></div><div class="message-shell start-flow"><div class="message assistant"><p>The conversation should breathe while navigation and automation remain close but never crush the center.</p><pre><code>const revelation = "wide enough to read";</code></pre><table><tr><th>Viewport</th><th>Goal</th></tr><tr><td>Mobile</td><td>One room at a time</td></tr></table></div></div>';
		if (automation && !automation.querySelector('.automation-panel-content')) automation.innerHTML += '<div class="automation-panel-content"><div class="right-panel-body">' + Array.from({length:8}, (_, index) => '<section class="automation-card"><h3>Automation group ' + (index + 1) + '</h3><label>Setting <input value="Precise control"></label><button type="button">Apply setting</button></section>').join('') + '</div></div>';
	})();`;
}

function geometryProbe() {
	return `(() => {
		const select = selector => document.querySelector(selector);
		const rect = selector => select(selector)?.getBoundingClientRect().toJSON() || null;
		const style = selector => select(selector) ? getComputedStyle(select(selector)) : null;
		return {
			viewport: { width: innerWidth, height: innerHeight },
			bodyScene: document.body.dataset.mobileScene || null,
			bodyOverflowX: getComputedStyle(document.body).overflowX,
			documentOverflow: document.documentElement.scrollWidth - innerWidth,
			container: rect('.container'),
			sidebar: rect('#sidebar'),
			main: rect('.main'),
			automation: rect('#automation-panel'),
			crown: rect('.mobile-app-crown'),
			dock: rect('.mobile-bottom-dock'),
			chat: rect('#chat-box'),
			composer: rect('.input-area'),
			gridColumns: style('.container')?.gridTemplateColumns,
			chatOverflowY: style('#chat-box')?.overflowY,
			visiblePanels: ['#sidebar','.main','#automation-panel'].filter(selector => { const node = select(selector); const computed = node && getComputedStyle(node); return computed && computed.display !== 'none' && computed.visibility !== 'hidden' && Number(computed.opacity) > 0 && node.getBoundingClientRect().width > 0; })
		};
	})()`;
}

async function setViewport(Emulation, viewport) {
	await Emulation.setDeviceMetricsOverride({
		width: viewport.width,
		height: viewport.height,
		deviceScaleFactor: viewport.mobile ? 2 : 1,
		mobile: viewport.mobile
	});
}

async function evaluate(Runtime, expression) {
	const response = await Runtime.evaluate({ expression, awaitPromise: true, returnByValue: true });
	if (response.exceptionDetails) {
		throw new Error(response.exceptionDetails.exception?.description || response.exceptionDetails.text);
	}
	return response.result.value;
}

async function saveScreenshot(Page, filename) {
	const image = await Page.captureScreenshot({ format: "png", captureBeyondViewport: false });
	fs.writeFileSync(path.join(OUTPUT_DIRECTORY, filename), Buffer.from(image.data, "base64"));
}

function delay(milliseconds) {
	return new Promise(resolve => setTimeout(resolve, milliseconds));
}

run().catch(error => {
	console.error(error.stack || error);
	process.exit(1);
});
