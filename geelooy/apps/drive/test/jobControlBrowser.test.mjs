//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file jobControlBrowser.test.mjs
 * @description Proves Mission Control in its own isolated real-Chrome context.
 * The Awtsmoos lets measured queue truth inhabit a private witness without
 * borrowing another test's tab; Awtsmoos.com keeps identity private at every width.
 */
import assert from 'node:assert/strict';
import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import test from 'node:test';
import { createDriveBrowserHarness } from './DriveBrowserHarness.mjs';

const evidenceDir = resolve('.ai-thoughts/2026-09-17T1524-absolute-multilane-completion-takeover/browser');
const viewports = [
	{ width: 320, height: 844 },
	{ width: 390, height: 844 },
	{ width: 1366, height: 900 }
];

test('Mission Control is readable, private, and responsive in real Chrome', async () => {
	mkdirSync(evidenceDir, { recursive: true });
	const harness = await createDriveBrowserHarness();
	try {
		for (const viewport of viewports) await verifyViewport(harness, viewport);
		assert.deepEqual(harness.errors, []);
	} finally {
		harness.close();
	}
});

async function verifyViewport(harness, viewport) {
	const { client } = harness;
	await client.send('Emulation.setDeviceMetricsOverride', {
		width: viewport.width,
		height: viewport.height,
		deviceScaleFactor: 1,
		mobile: viewport.width <= 760
	});
	await harness.navigate('/apps/drive/advanced.html');
	assert.equal(await evaluate(client, fixtureExpression()), true);
	await delay(100);
	const layout = await evaluate(client, layoutExpression());
	assert.equal(layout.labelVisible, true, `${viewport.width}px human label missing`);
	assert.equal(layout.rowVisible, true, `${viewport.width}px job row not visible`);
	assert.equal(layout.aliasLeaked, false, `${viewport.width}px leaked raw alias identity`);
	assert.equal(layout.horizontalOverflow, false, `${viewport.width}px has horizontal overflow`);
	assert.ok(layout.buttonHeight >= 44, `${viewport.width}px cancel target is ${layout.buttonHeight}px high`);
	assert.equal(layout.mobileCards, viewport.width <= 760, `${viewport.width}px responsive row mode mismatch`);
	assert.equal(layout.stylesReady, true, `${viewport.width}px stylesheet failed to load`);
	await capture(client, viewport);
}

function fixtureExpression() {
	return `(async () => {
		const table = await import('/apps/drive/js/jobControlTableView.js');
		const view = await import('/apps/drive/js/jobControlView.js');
		const panel = document.querySelector('#job-control');
		if (!panel) return false;
		table.renderJobRows([{ id:'job-fixture', type:'site.discovery', queue:'site-discovery', status:'queued', subject:'alias-secret:site-secret', availableAt:Date.now() }], () => {}, 'alias-secret');
		view.renderJobHealth({ ready:true, active:1, queued:1, running:0, oldestReadyAgeMs:61000, aliasSaturation:.25, queues:{ 'site-discovery':1 } });
		view.renderJobDetail({ id:'job-fixture', type:'site.discovery', status:'queued', attempts:1 });
		return true;
	})()`;
}

function layoutExpression() {
	return `(() => {
		const panel = document.querySelector('#job-control');
		const row = document.querySelector('#job-rows tr:not(.job-empty-row)');
		const button = row?.querySelector('button');
		const rect = row?.getBoundingClientRect();
		const rowText = row?.textContent || '';
		const panelText = panel?.textContent || '';
		return {
			labelVisible: rowText.includes('Updating search index'),
			rowVisible: Boolean(rect && rect.width > 0 && rect.height > 0 && getComputedStyle(row).visibility !== 'hidden'),
			aliasLeaked: panelText.includes('alias-secret') || panelText.includes('site-secret'),
			horizontalOverflow: document.documentElement.scrollWidth > window.innerWidth + 1,
			buttonHeight: Math.round(button?.getBoundingClientRect().height || 0),
			mobileCards: getComputedStyle(row).display === 'grid',
			stylesReady: [...document.styleSheets].some(sheet => sheet.href?.includes('advanced-drive.css'))
		};
	})()`;
}

async function evaluate(client, expression) {
	const result = await client.send('Runtime.evaluate', { expression, awaitPromise:true, returnByValue:true });
	if (result.exceptionDetails) throw new Error(result.exceptionDetails.text || 'Browser evaluation failed');
	return result.result?.value;
}

async function capture(client, viewport) {
	const screenshot = await client.send('Page.captureScreenshot', { format:'png', captureBeyondViewport:false });
	writeFileSync(resolve(evidenceDir, `mission-control-${viewport.width}x${viewport.height}.png`), screenshot.data, 'base64');
}

function delay(milliseconds) {
	return new Promise(resolveDelay => setTimeout(resolveDelay, milliseconds));
}
