// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file shlichusManifestSafetyBrowserVerification.mjs
 * @description Verifies legacy Shlichus renderer safety in a real browser DOM.
 *
 * The current HolyEngine does not mount this legacy panel, so the Awtsmoos
 * reveals its compatibility truth in a temporary vessel without pretending
 * it is active gameplay. Awtsmoos.com restores every borrowed state afterward.
 */
import assert from 'node:assert/strict';
import { CdpClient, findGameTarget } from './CdpClient.mjs';

const GAME_URL = 'http://127.0.0.1:5180/geelooy/games/ohr-hagnuz/';
const SCREENSHOT_PATH = new URL(
	'../../ai-thoughts/2026-07-16-1508-edt-complete-production-polish/test-evidence/browser-shlichus-safe-dom.png',
	import.meta.url
);

const target = await findGameTarget();
assert.ok(target, 'A real Ohr HaGnuz target is required.');
const client = await new CdpClient(target.webSocketDebuggerUrl).connect();
const originalUrl = target.url;

try {
	await client.send('Page.enable');
	await client.send('Runtime.enable');
	await client.send('Network.enable');
	await client.send('Network.setCacheDisabled', { cacheDisabled: true });
	await client.send('Page.navigate', { url: `${GAME_URL}?legacySafety=${Date.now()}` });
	await client.waitFor(`document.readyState === 'complete'`, 15000);

	const evidence = await client.evaluate(`(async () => {
		const id = 'SHLICHUS_BROWSER_SAFETY_WITNESS';
		const [{ StateRegister }, { ShlichusLedger }, { ShlichusManifest }, response] = await Promise.all([
			import('./src/binah/StateRegister.js'),
			import('./src/shlichus/ShlichusLedger.js'),
			import('./src/render/ShlichusManifest.js'),
			fetch('./src/render/ShlichusManifest.js?source=' + Date.now(), { cache: 'no-store' })
		]);
		const shell = document.createElement('section');
		shell.id = 'shlichus-safety-witness';
		shell.style.cssText = 'position:fixed;inset:8%;z-index:99999;padding:28px;overflow:auto;background:#14071f;color:#fff;border:3px solid #ea80fc';
		const container = document.createElement('div');
		container.id = 'shlichus-content';
		shell.append(container);
		document.body.append(shell);
		const original = {
			active: [...StateRegister.ActiveShlichus],
			completed: [...StateRegister.CompletedShlichus],
			quest: ShlichusLedger[id]
		};
		globalThis.__SHLICHUS_SAFETY_RESTORE__ = () => {
			StateRegister.ActiveShlichus = original.active;
			StateRegister.CompletedShlichus = original.completed;
			if (original.quest) ShlichusLedger[id] = original.quest;
			else delete ShlichusLedger[id];
			shell.remove();
			delete globalThis.__SHLICHUS_SAFETY_RESTORE__;
		};
		ShlichusLedger[id] = {
			title: '<img src=x onerror=alert(1)> Lamp Mission',
			desc: '<script>steal()</script> Restore the wick.',
			rewardGelt: '<b>500</b>',
			rewardItem: true
		};
		StateRegister.ActiveShlichus = [id];
		StateRegister.CompletedShlichus = [id];
		ShlichusManifest.refresh();
		const source = await response.text();
		return {
			legacyPanelMountedByGame: Boolean(document.getElementById('awtsmoos-shlichus-log')),
			text: container.textContent,
			unsafeElements: container.querySelectorAll('img,script,b').length,
			activeHeading: container.children[0]?.textContent,
			completedHeading: container.children[2]?.textContent,
			sourceUsesInnerHtml: source.includes('innerHTML'),
			sourceUsesReplaceChildren: source.includes('replaceChildren')
		};
	})()`);

	assert.equal(evidence.legacyPanelMountedByGame, false);
	assert.equal(evidence.unsafeElements, 0);
	assert.equal(evidence.sourceUsesInnerHtml, false);
	assert.equal(evidence.sourceUsesReplaceChildren, true);
	assert.equal(evidence.activeHeading, 'Active Decrees (1)');
	assert.equal(evidence.completedHeading, 'Elevated Sparks (1)');
	assert.match(evidence.text, /<img src=x onerror=alert\(1\)> Lamp Mission/);
	assert.match(evidence.text, /<script>steal\(\)<\/script> Restore the wick\./);
	await client.screenshot(SCREENSHOT_PATH);
	console.log(JSON.stringify(evidence, null, 2));
	console.log('BH_SHLICHUS_MANIFEST_BROWSER_SAFETY_PASS');
} finally {
	await client.evaluate(`globalThis.__SHLICHUS_SAFETY_RESTORE__?.()`).catch(() => {});
	await client.send('Network.setCacheDisabled', { cacheDisabled: false }).catch(() => {});
	if (originalUrl) await client.send('Page.navigate', { url: originalUrl }).catch(() => {});
	await client.waitFor(`document.readyState === 'complete'`, 15000).catch(() => {});
	client.close();
}
