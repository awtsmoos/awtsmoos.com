//B"H
// Boruch Hashem
// Blessed is He
/** Captures review snapshots from the same bounded CDP vessel used for structural runtime evidence. */
import fs from 'node:fs';
import path from 'node:path';
import { TargetSession } from './targetSession.mjs';
import { progress } from './reporter.mjs';

const delay = milliseconds => new Promise(resolve => setTimeout(resolve, milliseconds));

export async function captureVisualMatrix({ products, viewports, baseUrl, devtoolsUrl, timeoutMs, outputDirectory }) {
	fs.mkdirSync(outputDirectory, { recursive: true });
	const captures = [];
	for (const product of products) {
		let session;
		try {
			session = await TargetSession.create({ baseUrl, devtoolsUrl, timeoutMs });
			await session.enable();
			await session.client.send('Page.navigate', { url: `${baseUrl}${product.path}` });
			await waitForComplete(session, `${baseUrl}${product.path}`);
			for (const viewport of viewports) {
				progress(`visual ${product.name} ${viewport.width}x${viewport.height}`);
				await session.client.send('Emulation.setDeviceMetricsOverride', {
					width: viewport.width,
					height: viewport.height,
					deviceScaleFactor: 1,
					mobile: viewport.width <= 430
				});
				await delay(150);
				const result = await session.client.send('Page.captureScreenshot', { format: 'png', fromSurface: true });
				const filename = `${slug(product.name)}-${viewport.width}x${viewport.height}.png`;
				const file = path.join(outputDirectory, filename);
				fs.writeFileSync(file, Buffer.from(result.data, 'base64'));
				captures.push({ product: product.name, path: product.path, viewport, file, bytes: fs.statSync(file).size });
			}
		} finally {
			await session?.close();
		}
	}
	return captures;
}

async function waitForComplete(session, expectedUrl) {
	for (let attempt = 0; attempt < 60; attempt++) {
		const response = await session.client.send('Runtime.evaluate', {
			expression: '({href:location.href,ready:document.readyState})',
			returnByValue: true
		});
		const state = response.result?.value || {};
		if (state.href === expectedUrl && state.ready === 'complete') return;
		await delay(100);
	}
	throw new Error(`AUDIT_TIMEOUT visual navigation ${expectedUrl}`);
}

function slug(value) {
	return String(value).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}
