// B"H
// Boruch Hashem
// Blessed is He
// Exploratory: what does index.html do on load? Dump essential boot + launcher state + screenshot.
import { fileURLToPath } from 'node:url';
import { BrowserCdpHarness } from './BrowserCdpHarness.mjs';
import { startBrowserProof } from './BrowserProofProcess.mjs';

const repositoryRoot = fileURLToPath(new URL('../../../../../../../../', import.meta.url));
const processValue = await startBrowserProof(repositoryRoot);
const browser = await new BrowserCdpHarness(processValue.cdpPort).start();
let targetId = null;
try {
	const url = `${processValue.baseUrl}/geelooy/games/mitzvahWorld/index.html?explore=${Date.now()}`;
	const target = await browser.targets.create();
	targetId = target.id;
	const session = await browser.session(targetId);
	await session.send('Page.enable');
	await session.send('Runtime.enable');
	await browser.navigateTarget(targetId, url);
	await new Promise(r => setTimeout(r, 9000));
	const state = await browser.evaluate(targetId, `(() => {
		const boot = globalThis.AwtsmoosMitzvahWorldEssentialBoot || null;
		const worlds = [...document.querySelectorAll('[data-world-id]')].map(el => el.getAttribute('data-world-id'));
		return {
			href: location.href,
			title: document.title,
			worldButtons: worlds,
			boot: boot ? {
				certified: boot.certified,
				stalled: boot.stalledMilestone ? {
					name: boot.stalledMilestone.name,
					status: boot.stalledMilestone.status,
					code: boot.stalledMilestone.failureCode,
					message: boot.stalledMilestone.failureMessage
				} : null,
				milestones: Object.fromEntries(Object.entries(boot.milestones).map(([k, v]) => [k, {
					status: v.status,
					elapsedMs: v.elapsedMilliseconds,
					code: v.failureCode || null
				}]))
			} : null,
			runtime: Boolean(globalThis.AwtsmoosMitzvahWorld?.runtime),
			canvas: Boolean(document.querySelector('canvas')),
			bodyText: document.body ? document.body.innerText.slice(0, 400) : null
		};
	})()`);
	console.log('EXPLORE_STATE ' + JSON.stringify(state, null, 1).slice(0, 4000));
	const shot = await session.send('Page.captureScreenshot', { format: 'png' });
	const fs = await import('node:fs');
	fs.writeFileSync('/tmp/qa-explore.png', Buffer.from(shot.data, 'base64'));
	console.log('EXPLORE_SHOT /tmp/qa-explore.png');
} finally {
	if (targetId) await browser.closeTarget(targetId).catch(() => {});
	await browser.stop();
	await processValue.stop();
}
