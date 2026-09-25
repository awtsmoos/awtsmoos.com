// B"H — tests whether core-chunk import hangs after foundation-chunk import.
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
	await browser.navigateTarget(targetId, `${processValue.baseUrl}${GAME_URL}?importseq=1&t=${Date.now()}`);
	await browser.waitFor(targetId, `Boolean(document.querySelector('[data-world-id="living-village"]'))`, {
		intervalMs: 200, label: 'WORLD_LAUNCHER', timeoutMs: 15000
	});
	await new Promise(r => setTimeout(r, 4000));
	await browser.evaluate(targetId, `(() => {
		globalThis.__seq = [];
		const base = location.origin + '/games/mitzvahWorld/experiments/Awtsmoos/src/';
		const t0 = performance.now();
		import(base + 'mitzvah-world-foundation.compact.js').then(fns => {
			globalThis.__seq.push(['foundation-import-ms', Math.round(performance.now() - t0), Object.keys(fns).length]);
			const t1 = performance.now();
			import(base + 'mitzvah-world-core.compact.js').then(cns => {
				globalThis.__seq.push(['core-import-ms', Math.round(performance.now() - t1), Object.keys(cns).length]);
				globalThis.__seqDone = true;
			}).catch(e => { globalThis.__seq.push(['core-error', String(e).slice(0, 200)]); globalThis.__seqDone = true; });
		}).catch(e => { globalThis.__seq.push(['foundation-error', String(e).slice(0, 200)]); globalThis.__seqDone = true; });
	})()`);
	const out = await browser.waitFor(targetId, `Boolean(globalThis.__seqDone)`, {
		intervalMs: 500, label: 'IMPORT_SEQ', timeoutMs: 90000
	}).then(() => browser.evaluate(targetId, `globalThis.__seq`)).catch(e => ({ waitError: String(e).slice(0, 200) }));
	console.log('IMPORT_SEQ', JSON.stringify(out).slice(0, 1000));
} finally {
	if (targetId) await browser.closeTarget(targetId).catch(() => {});
	await browser.stop().catch(() => {});
}
