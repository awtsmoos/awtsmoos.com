//B"H
// Boruch Hashem
// Blessed is He
import { pageProbeExpression } from './pageProbe.mjs';
import { classifyProductEvidence } from './assertions.mjs';
import { progress } from './reporter.mjs';

const delay = milliseconds => new Promise(resolve => setTimeout(resolve, milliseconds));

/** Waits for the intended route and reports the last browser state on failure. */
async function waitForNavigation(session, expectedUrl) {
	let lastState = { href: '', readyState: '' };
	for (let attempt = 0; attempt < 60; attempt++) {
		const response = await session.client.send('Runtime.evaluate', {
			expression: '({href:location.href,readyState:document.readyState})',
			returnByValue: true
		});
		lastState = response.result?.value || lastState;
		if (lastState.href === expectedUrl && lastState.readyState === 'complete') return lastState;
		await delay(100);
	}
	throw new Error(`AUDIT_TIMEOUT navigation ${expectedUrl}; last=${lastState.href || 'unknown'} ready=${lastState.readyState || 'unknown'}`);
}

/** Audits one product after one honest navigation and several viewport emulations. */
export async function auditProduct({ product, session, baseUrl, viewports }) {
	progress(`${product.name} navigate`);
	await session.enable();
	const expectedUrl = `${baseUrl}${product.path}`;
	await session.client.send('Page.navigate', { url: expectedUrl });
	await waitForNavigation(session, expectedUrl);
	const rows = [];
	for (const viewport of viewports) {
		progress(`${product.name} ${viewport.name} ${viewport.width}x${viewport.height}`);
		await session.client.send('Emulation.setDeviceMetricsOverride', {
			width: viewport.width,
			height: viewport.height,
			deviceScaleFactor: 1,
			mobile: viewport.width <= 430
		});
		await delay(120);
		const response = await session.client.send('Runtime.evaluate', {
			expression: pageProbeExpression(product.selectors),
			returnByValue: true
		});
		rows.push({ viewport: viewport.name, ...(response.result?.value || {}) });
	}
	await session.client.send('Emulation.setEmulatedMedia', {
		features: [{ name: 'prefers-reduced-motion', value: 'reduce' }]
	});
	const reduced = await session.client.send('Runtime.evaluate', {
		expression: `matchMedia('(prefers-reduced-motion: reduce)').matches`,
		returnByValue: true
	});
	const events = session.recorder.snapshot();
	const failures = classifyProductEvidence(product, rows, events, baseUrl);
	return { name: product.name, path: product.path, rows, reducedMotion: reduced.result?.value === true, events, failures };
}
