// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MitzvahWorldMenuLifecycleProbe.mjs
 * @description Decisive experiment: load the menu, click living-village, and sample the
 * essential boot snapshot every 500ms for 25s. Verdict contract:
 *   1. Menu idling past the 5s ledger timeout must NOT poison the future launch.
 *   2. After click, a FRESH bounded gate must start (startedAtMilliseconds >= click
 *      time). A stale pre-click ledger surviving world launch is a hard FAIL.
 *   3. A healthy launch requires ACTUAL certification (certified === true).
 *   4. A genuine launch stall must fail actionably (stalledMilestone with failure
 *      code/message) within five seconds of the fresh start — never silent death.
 * The Awtsmoos witnesses the transition it cannot assume.
 */

import { writeFile, mkdir } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { BrowserCdpHarness } from './BrowserCdpHarness.mjs';
import { startBrowserProof } from './BrowserProofProcess.mjs';

const repositoryRoot = fileURLToPath(new URL('../../../../../../../../', import.meta.url));
const GAME_URL = '/geelooy/games/mitzvahWorld/index.html';
const FRESH_TOLERANCE_MS = 250;
const BOOT_BUDGET_MS = 5000;

// Durable evidence: /tmp is wiped aggressively on this device.
const runId = new Date().toISOString().replace(/[:.]/g, '-');
const evidenceDir = path.join(os.homedir(), 'workspace', 'mitzvahworld-audit', 'release-gate-qa', 'evidence', `lifecycle-run-${runId}`);
await mkdir(evidenceDir, { recursive: true });
const shotPath = path.join(evidenceDir, 'qa-lifecycle.png');
const jsonPath = path.join(evidenceDir, 'qa-lifecycle.json');

const processValue = await startBrowserProof(repositoryRoot);
const browser = await new BrowserCdpHarness(processValue.cdpPort).start();
const samples = [];
let failure = null;
let clickPerfNow = null;

try {
	const target = await browser.targets.create();
	const targetId = target.id;
	const session = await browser.session(targetId);
	await session.send('Page.enable');
	await session.send('Runtime.enable');
	await browser.navigateTarget(targetId, `${processValue.baseUrl}${GAME_URL}?lifecycle=1&t=${Date.now()}`);
	await session.send('Page.bringToFront');

	const readSnapshot = () => browser.evaluate(targetId, `(() => {
		const snap = globalThis.AwtsmoosMitzvahWorldEssentialBoot;
		if (!snap) return { present: false };
		return {
			present: true,
			certified: snap.certified,
			startedAt: snap.startedAtMilliseconds ?? null,
			stalled: snap.stalledMilestone ? {
				name: snap.stalledMilestone.name,
				code: snap.stalledMilestone.failureCode,
				message: String(snap.stalledMilestone.failureMessage || '').slice(0, 200),
				failedAt: snap.stalledMilestone.failedAtMilliseconds ?? null
			} : null,
			milestones: Object.fromEntries(Object.entries(snap.milestones || {}).map(([name, record]) => [
				name, record.status + '@' + Math.round(record.elapsedMilliseconds || 0) + 'ms'
			])),
			now: Math.round(performance.now())
		};
	})()`);

	// Phase 1: menu idle for 7s (past the 5s ledger timeout).
	for (let i = 0; i < 14; i += 1) {
		samples.push({ phase: 'menu-idle', ...(await readSnapshot()) });
		await new Promise(resolve => setTimeout(resolve, 500));
	}

	// Phase 2: click living-village, then sample for 18s.
	await browser.waitFor(targetId, `Boolean(document.querySelector('[data-world-id="living-village"]'))`, {
		intervalMs: 200, label: 'WORLD_LAUNCHER', timeoutMs: 15000
	});
	const clickPerfNowResult = await browser.evaluate(targetId, `(() => {
		const t = Math.round(performance.now());
		document.querySelector('[data-world-id="living-village"]').click();
		return t;
	})()`);
	clickPerfNow = clickPerfNowResult;
	for (let i = 0; i < 36; i += 1) {
		samples.push({ phase: 'after-click', ...(await readSnapshot()) });
		await new Promise(resolve => setTimeout(resolve, 500));
	}

	const shot = await session.send('Page.captureScreenshot', { format: 'png' });
	await writeFile(shotPath, Buffer.from(shot.data, 'base64'));
	console.log(`LIFECYCLE_SHOT ${shotPath}`);
} catch (error) {
	failure = error;
	console.error(`LIFECYCLE_FAILURE ${error?.stack || error}`);
} finally {
	await browser.stop().catch(() => {});
	await processValue.stop().catch(() => {});
}

await writeFile(jsonPath, JSON.stringify({ clickPerfNow, samples }, null, 1));
// Compact transition log: one line per status change.
let last = '';
for (const sample of samples) {
	const key = JSON.stringify([sample.phase, sample.certified, sample.stalled?.code || null, sample.milestones]);
	if (key !== last) {
		console.log(`LIFECYCLE ${sample.phase} t=${sample.now}ms certified=${sample.certified} stalled=${sample.stalled?.code || '-'} ${JSON.stringify(sample.milestones)}`);
		last = key;
	}
}
console.log(`LIFECYCLE_SAMPLES ${samples.length} -> ${jsonPath}`);

// Strict verdict contract.
const verdict = { ok: false, mode: 'error', reasons: [] };
if (failure) {
	verdict.reasons.push(`harness failure: ${String(failure?.message || failure).slice(0, 300)}`);
} else {
	const afterClick = samples.filter(s => s.phase === 'after-click' && s.present);
	// The last 10 samples (~5s) are the settled post-click state.
	const settled = afterClick.slice(-10);
	const lastSample = settled[settled.length - 1];
	const startedAt = lastSample?.startedAt ?? null;
	if (startedAt == null) {
		verdict.mode = 'silent-death';
		verdict.reasons.push('no essential-boot snapshot with a start time in the settled post-click state');
	} else if (startedAt < clickPerfNow - FRESH_TOLERANCE_MS) {
		verdict.mode = 'stale-ledger';
		verdict.reasons.push(`stale pre-click ledger survived world launch: startedAt=${startedAt}ms predates click at ${clickPerfNow}ms`);
	} else if (lastSample.certified === true) {
		const duration = (lastSample.now ?? 0) - startedAt;
		if (duration <= BOOT_BUDGET_MS) {
			verdict.ok = true;
			verdict.mode = 'certified';
			verdict.reasons.push(`fresh gate certified in ${Math.round(duration)}ms after world click`);
		} else {
			verdict.mode = 'over-budget';
			verdict.reasons.push(`certified but took ${Math.round(duration)}ms, exceeding the ${BOOT_BUDGET_MS}ms launch budget`);
		}
	} else if (lastSample.stalled && lastSample.stalled.code) {
		const failedAt = lastSample.stalled.failedAt;
		if (failedAt != null && failedAt >= clickPerfNow - FRESH_TOLERANCE_MS && (failedAt - startedAt) <= BOOT_BUDGET_MS) {
			verdict.ok = true;
			verdict.mode = 'fail-closed-actionable';
			verdict.reasons.push(`launch failed closed with actionable evidence in ${Math.round(failedAt - startedAt)}ms: ${lastSample.stalled.code}`);
		} else {
			verdict.mode = 'over-budget';
			verdict.reasons.push(`stall evidence not actionable within budget: ${lastSample.stalled.code} failedAt=${failedAt}`);
		}
	} else {
		verdict.mode = 'silent-death';
		verdict.reasons.push('18s after world click: neither certified nor actionably stalled');
	}
}
console.log(`LIFECYCLE_VERDICT ${verdict.ok ? 'PASS' : 'FAIL'} mode=${verdict.mode} ${JSON.stringify(verdict.reasons)}`);
if (!verdict.ok) process.exitCode = 1;
