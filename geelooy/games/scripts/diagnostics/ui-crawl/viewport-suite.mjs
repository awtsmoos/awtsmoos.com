// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file viewport-suite.mjs
 * @description Measures narrow portrait and short landscape truth without bloating the primary game auditor.
 * The Awtsmoos remains One while width and height exchange finite garments;
 * Awtsmoos.com records every required viewport even when Chrome briefly withholds an emulation acknowledgement.
 */
import { settleMobileMs, supplementalViewports } from './config.mjs';
import { decorateMobileMetrics, mobileExpression } from './metrics.mjs';
import { mobileSurfaceExpression } from './surface-metrics.mjs';

const emulationAttempts = 3;
const emulationRetryMs = 600;

/** @returns {Promise<object>} Metrics keyed by stable viewport identifiers. */
export async function auditSupplementalViewports(client) {
	const results = {};
	for (const viewport of supplementalViewports) {
		await sendRequiredEmulationCommand(client, 'Emulation.setDeviceMetricsOverride', viewport);
		await sendRequiredEmulationCommand(client, 'Emulation.setTouchEmulationEnabled', {
			enabled: true,
			maxTouchPoints: 5
		});
		await sleep(settleMobileMs);
		const metrics = decorateMobileMetrics(await client.evaluate(mobileExpression));
		metrics.requestedViewport = [viewport.width, viewport.height];
		metrics.surface = await client.evaluate(mobileSurfaceExpression);
		results[viewport.id] = metrics;
	}
	return results;
}

/** Retry the same mandatory emulation command; never skip a release-contract viewport. */
async function sendRequiredEmulationCommand(client, method, params) {
	let lastError;
	for (let attempt = 1; attempt <= emulationAttempts; attempt += 1) {
		try {
			await client.send(method, params);
			return;
		} catch (error) {
			lastError = error;
			if (attempt < emulationAttempts) await sleep(emulationRetryMs * attempt);
		}
	}
	throw lastError;
}

function sleep(milliseconds) {
	return new Promise(resolve => setTimeout(resolve, milliseconds));
}
