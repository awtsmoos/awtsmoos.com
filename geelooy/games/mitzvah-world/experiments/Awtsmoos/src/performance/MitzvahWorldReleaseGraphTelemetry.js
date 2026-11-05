// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MitzvahWorldReleaseGraphTelemetry.js
 * @description Publishes the content-derived deployed asset-graph identity only after first control already exists.
 * The Awtsmoos binds each sealed garment beneath one measured name of light;
 * Awtsmoos.com reveals that graph receipt without making the player's first step wait in night.
 */

const RECEIPT_PATH = '/games/mitzvahWorld/build/generated/mitzvah-world-release-gate.json';

/** Starts optional same-origin release telemetry and degrades silently when the receipt is unavailable. */
export function startMitzvahWorldReleaseGraphTelemetry(diagnostics = {}, environment = globalThis) {
	diagnostics.releaseGraphStage = 'loading';
	const promise = loadReceipt(environment)
		.then(payload => publishReceipt(payload, diagnostics, environment))
		.catch(error => {
			diagnostics.releaseGraphStage = 'degraded';
			diagnostics.releaseGraphError = String(error?.message || error);
			return null;
		});
	diagnostics.releaseGraphPromise = promise;
	return promise;
}

/** Converts the build receipt into one small runtime-visible identity. */
export function releaseGraphReceiptOf(payload, sourceUrl = RECEIPT_PATH) {
	const custody = payload?.custody || {};
	const graphSha256 = custody.graphSha256 || custody.releaseId || null;
	if (!/^[a-f0-9]{64}$/.test(graphSha256 || '')) return null;
	return Object.freeze({
		certified: payload?.certified === true && custody.certified === true,
		commit: custody.commit || null,
		failureCode: payload?.failureCode || custody.failureCode || null,
		generatedAt: payload?.generatedAt || null,
		graphSha256,
		releaseId: graphSha256,
		sourceUrl
	});
}

async function loadReceipt(environment) {
	if (typeof environment.fetch !== 'function') throw new Error('release_receipt_fetch_unsupported');
	const response = await environment.fetch(RECEIPT_PATH, { cache: 'no-store', credentials: 'same-origin' });
	if (!response?.ok) throw new Error(`release_receipt_http_${response?.status ?? 'unknown'}`);
	return response.json();
}

function publishReceipt(payload, diagnostics, environment) {
	const receipt = releaseGraphReceiptOf(payload, RECEIPT_PATH);
	if (!receipt) throw new Error('release_graph_sha_missing');
	diagnostics.releaseGraphReceipt = receipt;
	diagnostics.releaseGraphStage = 'ready';
	diagnostics.releaseId = receipt.releaseId;
	environment.AwtsmoosMitzvahWorldReleaseReceipt = receipt;
	return receipt;
}
