// B"H — measures core-chunk fetch vs evaluation time.
import { fileURLToPath } from 'node:url';
import { BrowserCdpHarness } from './BrowserCdpHarness.mjs';
import { startBrowserProof } from './BrowserProofProcess.mjs';

const repositoryRoot = fileURLToPath(new URL('../../../../../../../../', import.meta.url));
const GAME_URL = '/geelooy/games/mitzvahWorld/index.html';

const processValue = await startBrowserProof(repositoryRoot);
const browser = await new BrowserCdpHarness(processValue.cdpPort).start();
let targetId = null;
try {
	const target = await browser.targets.create();
	targetId = target.id;
	await browser.navigateTarget(targetId, `${processValue.baseUrl}${GAME_URL}?netcap=1&t=${Date.now()}`);
	await browser.waitFor(targetId, `Boolean(document.querySelector('[data-world-id="living-village"]'))`, {
		intervalMs: 200, label: 'WORLD_LAUNCHER', timeoutMs: 15000
	});
	await new Promise(r => setTimeout(r, 6000));
	await browser.evaluate(targetId, `document.querySelector('[data-world-id="living-village"]').click()`);
	await new Promise(r => setTimeout(r, 25000));
	const out = await browser.evaluate(targetId, `(() => {
		const entries = performance.getEntriesByType('resource')
			.filter(e => /mitzvah-world-(core|foundation)\.compact\.js/.test(e.name))
			.map(e => ({ name: e.name.split('/').pop(), duration: Math.round(e.duration), size: e.transferSize }));
		const boot = globalThis.AwtsmoosMitzvahWorldEssentialBoot;
		return { entries, movement: boot?.milestones?.playerMovementEnabled?.status || null,
			startup: globalThis.AwtsmoosMitzvahWorldStartup || null };
	})()`).catch(e => ({ evalError: String(e).slice(0, 200) }));
	console.log('NET', JSON.stringify(out, null, 1).slice(0, 3000));
} finally {
	if (targetId) await browser.closeTarget(targetId).catch(() => {});
	await browser.stop().catch(() => {});
}
