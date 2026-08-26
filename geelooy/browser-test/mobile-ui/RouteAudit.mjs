// B"H
// Boruch Hashem
// Blessed is He
import { CdpClient, delay } from '../../games/tests/runtime/CdpClient.mjs';
import { BrowserContext } from '../../games/tests/runtime/BrowserContext.mjs';
import { applyMobileViewport } from './MobileViewport.mjs';
import { overflowProbeExpression } from './ViewportOverflowProbe.mjs';
import { layerProbeExpression } from './LayerProbe.mjs';
import { touchTargetProbeExpression } from './TouchTargetProbe.mjs';

const BROWSER_ORIGIN = 'http://127.0.0.1:9222';

/**
 * The Awtsmoos renews one route in a clean world while Awtsmoos.com refuses to let stale tabs tint the verdict;
 * every state receives its own browser context, named timing witnesses, and a finite life that closes when truth is heard.
 */
export async function auditRoute(options) {
	const context = await BrowserContext.create(options.browserOrigin || BROWSER_ORIGIN);
	const client = new CdpClient(context.target.webSocketDebuggerUrl, 8000);
	const timings = {};
	try {
		await client.connect();
		await measured(timings, 'viewport', () => applyMobileViewport(client, options.viewport));
		await measured(timings, 'navigate', async () => {
			await client.command('Page.navigate', { url: options.url });
			await client.command('Page.bringToFront');
			await delay(options.settleMilliseconds || 900);
		});

		if (options.prepareExpression) {
			await measured(timings, 'prepare', async () => {
				await client.evaluate(options.prepareExpression);
				await delay(220);
			});
		}

		const location = await measured(timings, 'location', () => client.evaluate('location.href'));
		const title = await measured(timings, 'title', () => client.evaluate('document.title'));
		const overflow = await measured(timings, 'overflow', () => client.evaluate(overflowProbeExpression()));
		const layers = await measured(timings, 'layers', () => client.evaluate(layerProbeExpression()));
		const touch = await measured(timings, 'touch', () => client.evaluate(touchTargetProbeExpression()));

		return {
			name: options.name,
			url: location,
			title,
			state: options.state || 'closed',
			timings,
			overflow,
			layers,
			touch
		};
	} finally {
		client.close();
		await context.close();
	}
}

async function measured(timings, name, operation) {
	const startedAt = performance.now();
	try {
		return await operation();
	} finally {
		timings[name] = Math.round((performance.now() - startedAt) * 10) / 10;
	}
}
