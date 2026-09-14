//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file isolated-probe.mjs
 * @description Gives one real-gameplay probe exclusive ownership of one Chrome
 * target, one event stream, and one mobile viewport before returning its evidence.
 *
 * Architectural invariants:
 * - Every probe starts in a fresh target with browser cache disabled.
 * - Browser exceptions and required network failures are release failures.
 * - Probe code may observe canonical state but must act through user-facing input.
 * - The target closes in `finally`, including assertion or navigation failures.
 */
import assert from 'node:assert/strict';
import { MerkavaCdpClient } from '../ui-crawl/cdp-client.mjs';

const MOBILE_VIEWPORT = {
	width: 390,
	height: 844,
	deviceScaleFactor: 2,
	mobile: true
};

/**
 * Run one title probe in an isolated mobile browser target.
 * @param {string} origin Local public-root server origin.
 * @param {object} probe Title-specific ready/action contract.
 * @returns {Promise<object>} Immutable-by-convention gameplay evidence.
 */
export async function runProbeIsolated(origin, probe) {
	const client = await MerkavaCdpClient.create();
	const faults = createFaults();
	client.setEventSink(message => captureFault(faults, message));
	try {
		await client.send('Emulation.setDeviceMetricsOverride', MOBILE_VIEWPORT);
		await client.send('Emulation.setTouchEmulationEnabled', {
			enabled: true,
			maxTouchPoints: 5
		});
		await client.send('Page.navigate', {
			url: `${origin}/games/${probe.slug}/?gameplaySmoke=1`
		});
		await client.send('Page.bringToFront');
		const ready = await client.waitFor(
			probe.readyExpression,
			probe.readyTimeoutMs || 15000
		);
		assert.equal(ready, true, `${probe.slug} did not become gameplay-ready`);
		const evidence = await probe.run(client);
		assert.deepEqual(faults.exceptions, [], `${probe.slug} emitted browser exceptions`);
		assert.deepEqual(faults.networkFailures, [], `${probe.slug} emitted network failures`);
		return {
			slug: probe.slug,
			viewport: [MOBILE_VIEWPORT.width, MOBILE_VIEWPORT.height],
			evidence,
			exceptions: [],
			networkFailures: []
		};
	} finally {
		client.setEventSink(null);
		await client.close();
	}
}

/** Create bounded fault collections for one browser target. */
function createFaults() {
	return {
		exceptions: [],
		networkFailures: []
	};
}

/** Capture only failures that can invalidate actual gameplay readiness. */
function captureFault(faults, message) {
	if (message.method === 'Runtime.exceptionThrown') {
		const detail = message.params?.exceptionDetails?.exception?.description
			|| message.params?.exceptionDetails?.text
			|| 'browser exception';
		faults.exceptions.push(detail);
		return;
	}
	if (message.method !== 'Network.loadingFailed') {
		return;
	}
	const errorText = message.params?.errorText || '';
	if (errorText !== 'net::ERR_ABORTED') {
		faults.networkFailures.push(errorText || 'network failure');
	}
}
