// B"H — MitzvahWorld post-click movement timing probe (60s window).
import { mkdir, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { BrowserCdpHarness } from './BrowserCdpHarness.mjs';
import { startBrowserProof } from './BrowserProofProcess.mjs';

const repositoryRoot = fileURLToPath(new URL('../../../../../../../../', import.meta.url));
const GAME_URL = '/geelooy/games/mitzvahWorld/index.html';
const runId = new Date().toISOString().replace(/[:.]/g, '-');
const evidenceDir = path.join(os.homedir(), 'workspace', 'mitzvahworld-audit', 'release-gate-qa', 'evidence', `timing-run-${runId}`);
await mkdir(evidenceDir, { recursive: true });

const processValue = await startBrowserProof(repositoryRoot);
const browser = await new BrowserCdpHarness(processValue.cdpPort).start();
let targetId = null;

const SNIPPET = `(() => {
	const s = globalThis.AwtsmoosMitzvahWorldEssentialBoot;
	if (!s) return null;
	const out = { certified: s.certified, milestones: {} };
	for (const [k, m] of Object.entries(s.milestones)) out.milestones[k] = m.status + '@' + Math.round(m.elapsedMilliseconds);
	return out;
})()`;

try {
	const target = await browser.targets.create();
	targetId = target.id;
	await browser.navigateTarget(targetId, `${processValue.baseUrl}${GAME_URL}?timing=1&t=${Date.now()}`);
	await browser.waitFor(targetId, `Boolean(document.querySelector('[data-world-id="living-village"]'))`, {
		intervalMs: 200, label: 'WORLD_LAUNCHER', timeoutMs: 15000
	});
	await new Promise(r => setTimeout(r, 7000)); // menu idle past the 5s timeout
	await browser.evaluate(targetId, `document.querySelector('[data-world-id="living-village"]').click()`);
	const events = [];
	let lastSig = '';
	const t0 = Date.now();
	while (Date.now() - t0 < 60000) {
		const snap = await browser.evaluate(targetId, SNIPPET).catch(() => null);
		if (snap) {
			const sig = JSON.stringify(snap.milestones);
			if (sig !== lastSig) {
				lastSig = sig;
				events.push({ atMs: Date.now() - t0, ...snap });
				console.log('TIMING', JSON.stringify({ atMs: Date.now() - t0, ...snap.milestones }));
			}
			if (snap.certified) break;
		}
		await new Promise(r => setTimeout(r, 250));
	}
	const final = await browser.evaluate(targetId, SNIPPET).catch(() => null);
	await writeFile(path.join(evidenceDir, 'timing.json'), JSON.stringify({ events, final }, null, 1));
	console.log('TIMING_DONE events=' + events.length + ' certified=' + (final?.certified ?? 'unknown'));
} finally {
	if (targetId) await browser.closeTarget(targetId).catch(() => {});
	await browser.stop().catch(() => {});
}
