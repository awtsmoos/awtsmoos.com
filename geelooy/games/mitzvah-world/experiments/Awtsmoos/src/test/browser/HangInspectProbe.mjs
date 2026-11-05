// B"H — inspects the hung launch: boot tracker stage + texture state.
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
	await browser.navigateTarget(targetId, `${processValue.baseUrl}${GAME_URL}?hanginspect=1&t=${Date.now()}`);
	await browser.waitFor(targetId, `Boolean(document.querySelector('[data-world-id="living-village"]'))`, {
		intervalMs: 200, label: 'WORLD_LAUNCHER', timeoutMs: 15000
	});
	await new Promise(r => setTimeout(r, 6000));
	await browser.evaluate(targetId, `document.querySelector('[data-world-id="living-village"]').click()`);
	await new Promise(r => setTimeout(r, 20000));
	const out = await browser.evaluate(targetId, `(() => {
		const boot = globalThis.AwtsmoosBootTracker;
		const snap = globalThis.AwtsmoosMitzvahWorldEssentialBoot;
		// Find terrain/texture state via resource timings for texture URLs.
		const tex = performance.getEntriesByType('resource')
			.filter(e => /texture|terrain|\.png|\.jpg|\.webp/i.test(e.name))
			.map(e => ({ name: e.name.split('/').pop().slice(0, 60), duration: Math.round(e.duration), size: e.transferSize }));
		return {
			bootStage: boot ? String(boot.currentStage || boot.stage || JSON.stringify(boot).slice(0, 300)) : 'no-tracker',
			movement: snap?.milestones?.playerMovementEnabled?.status || null,
			stalled: snap?.stalledMilestone?.failureCode || null,
			pendingResources: tex.filter(t => t.duration > 5000).slice(0, 10),
			texCount: tex.length,
			startup: globalThis.AwtsmoosMitzvahWorldStartup || null,
			trackerKeys: globalThis.AwtsmoosBootTracker ? Object.keys(globalThis.AwtsmoosBootTracker).slice(0, 12) : null
		};
	})()`).catch(e => ({ evalError: String(e).slice(0, 200) }));
	console.log('HANG', JSON.stringify(out, null, 1).slice(0, 3000));
} finally {
	if (targetId) await browser.closeTarget(targetId).catch(() => {});
	await browser.stop().catch(() => {});
}
