// B"H — MitzvahWorld post-click error capture probe (in-page hooks).
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
	await browser.navigateTarget(targetId, `${processValue.baseUrl}${GAME_URL}?errcap=1&t=${Date.now()}`);
	await browser.waitFor(targetId, `Boolean(document.querySelector('[data-world-id="living-village"]'))`, {
		intervalMs: 200, label: 'WORLD_LAUNCHER', timeoutMs: 15000
	});
	await browser.evaluate(targetId, `(() => {
		globalThis.__errcap = [];
		const push = (kind, text) => globalThis.__errcap.push(kind + ': ' + String(text).slice(0, 400));
		window.addEventListener('error', e => push('window.error', e.message + ' @ ' + (e.filename || '') + ':' + (e.lineno || '')), true);
		window.addEventListener('unhandledrejection', e => push('unhandledrejection', e.reason?.message || e.reason), true);
		const origErr = console.error.bind(console);
		console.error = (...a) => { push('console.error', a.map(String).join(' ')); origErr(...a); };
	})()`);
	await new Promise(r => setTimeout(r, 7000));
	await browser.evaluate(targetId, `document.querySelector('[data-world-id="living-village"]').click()`);
	await new Promise(r => setTimeout(r, 30000));
	const out = await browser.evaluate(targetId, `(() => ({
		errs: globalThis.__errcap || [],
		boot: globalThis.AwtsmoosMitzvahWorldEssentialBoot ? {
			certified: globalThis.AwtsmoosMitzvahWorldEssentialBoot.certified,
			stalled: globalThis.AwtsmoosMitzvahWorldEssentialBoot.stalledMilestone?.failureCode || null,
			movement: globalThis.AwtsmoosMitzvahWorldEssentialBoot.milestones?.playerMovementEnabled?.status || null
		} : null,
		startup: globalThis.AwtsmoosMitzvahWorldStartup || null,
		bodyText: document.body?.innerText?.slice(0, 600) || null
	}))()`).catch(e => ({ evalError: String(e).slice(0, 200) }));
	console.log('OUT', JSON.stringify(out, null, 1).slice(0, 4000));
} finally {
	if (targetId) await browser.closeTarget(targetId).catch(() => {});
	await browser.stop().catch(() => {});
}
