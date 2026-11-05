// B"H — CPU profile of the world-launch assembly phase.
import { fileURLToPath } from 'node:url';
import { writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
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
	const session = await browser.session(targetId);
	await session.send('Page.enable');
	await session.send('Runtime.enable');
	await browser.navigateTarget(targetId, `${processValue.baseUrl}${GAME_URL}?cpuprof=1&t=${Date.now()}`);
	await browser.waitFor(targetId, `Boolean(document.querySelector('[data-world-id="living-village"]'))`, {
		intervalMs: 200, label: 'WORLD_LAUNCHER', timeoutMs: 15000
	});
	await new Promise(r => setTimeout(r, 6000));
	await session.send('Profiler.enable');
	await session.send('Profiler.start');
	console.log('PROFILER_STARTED');
	await browser.evaluate(targetId, `document.querySelector('[data-world-id="living-village"]').click()`);
	// Wait for playerControllable or 60s.
	const t0 = Date.now();
	let done = false;
	while (Date.now() - t0 < 60000) {
		const v = await browser.evaluate(targetId,
			`Boolean(globalThis.AwtsmoosMitzvahWorldStartup?.milestones?.playerControllable)`).catch(() => false);
		if (v) { done = true; break; }
		await new Promise(r => setTimeout(r, 1000));
	}
	console.log('PLAYER_CONTROLLABLE=' + done);
	const { profile } = await session.send('Profiler.stop');
	const dir = path.join(os.homedir(), 'workspace', 'mitzvahworld-audit', 'release-gate-qa', 'evidence');
	await writeFile(path.join(dir, 'cpu-profile-launch.json'), JSON.stringify(profile).slice(0, 2000000));
	// Summarize top functions by hit count.
	const hits = new Map();
	for (const node of profile.nodes) {
		const fn = node.callFrame.functionName || '(anon)';
		const url = (node.callFrame.url || '').split('/').pop().split('?')[0];
		hits.set(fn + ' @ ' + url, (hits.get(fn + ' @ ' + url) || 0) + 1);
	}
	const top = [...hits.entries()].sort((a, b) => b[1] - a[1]).slice(0, 25);
	console.log('TOP_FRAMES', JSON.stringify(top, null, 1).slice(0, 3000));
} finally {
	if (targetId) await browser.closeTarget(targetId).catch(() => {});
	await browser.stop().catch(() => {});
}
