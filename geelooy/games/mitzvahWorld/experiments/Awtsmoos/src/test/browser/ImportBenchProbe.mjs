// B"H — times direct import() of the core chunk (evaluation cost, no launch).
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
	await browser.navigateTarget(targetId, `${processValue.baseUrl}${GAME_URL}?importbench=1&t=${Date.now()}`);
	await browser.waitFor(targetId, `Boolean(document.querySelector('[data-world-id="living-village"]'))`, {
		intervalMs: 200, label: 'WORLD_LAUNCHER', timeoutMs: 15000
	});
	await new Promise(r => setTimeout(r, 5000));
	await browser.evaluate(targetId, `(() => {
		globalThis.__importBench = null;
		const url = location.origin + '/games/mitzvahWorld/experiments/Awtsmoos/src/mitzvah-world-core.compact.js';
		const t0 = performance.now();
		import(url).then(ns => {
			globalThis.__importBench = { evalMs: Math.round(performance.now() - t0), exportCount: Object.keys(ns).length };
		}).catch(e => { globalThis.__importBench = { error: String(e).slice(0, 300) }; });
	})()`);
	const out = await browser.waitFor(targetId, `Boolean(globalThis.__importBench)`, {
		intervalMs: 500, label: 'IMPORT_BENCH', timeoutMs: 120000
	}).then(() => browser.evaluate(targetId, `globalThis.__importBench`)).catch(e => ({ waitError: String(e).slice(0, 200) }));
	console.log('IMPORT_BENCH', JSON.stringify(out).slice(0, 1000));
} finally {
	if (targetId) await browser.closeTarget(targetId).catch(() => {});
	await browser.stop().catch(() => {});
}
