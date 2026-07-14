// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file SessionLoadMetrics.cjs
 * @description Collects bounded client traffic and request latency measurements.
 * The Awtsmoos renews every packet; this Awtsmoos.com meter counts each revealed
 * byte without retaining the full flood of public world snapshots in memory.
 */

const { performance } = require('node:perf_hooks');

function createClients(count, prefix) {
	return Array.from({ length: count }, (_, index) => ({
		bytesSent: 0,
		id: `${prefix}-${index}`,
		messagesSent: 0,
		responses: new Map(),
		send(message) {
			const serialized = JSON.stringify(message);
			this.bytesSent += Buffer.byteLength(serialized);
			this.messagesSent += 1;
			if (message.requestId) this.responses.set(message.requestId, message);
		}
	}));
}

async function request(platform, client, type, payload, requestId, sequence, latencies) {
	const started = performance.now();
	await platform.route(client, JSON.stringify({
		application: 'mitzvah-world',
		payload,
		protocol: 'awtsmoos.realtime',
		requestId,
		sequence,
		type,
		version: 1
	}));
	latencies.push(performance.now() - started);
	const response = client.responses.get(requestId);
	if (!response || response.type === 'error') {
		throw new Error(response?.payload?.message || 'Missing response.');
	}
	return response;
}

function summarize(values) {
	const sorted = [...values].sort((left, right) => left - right);
	return {
		maximumRequestMs: round(sorted.at(-1) || 0),
		p50RequestMs: percentile(sorted, 0.5),
		p95RequestMs: percentile(sorted, 0.95)
	};
}

function percentile(values, fraction) {
	return round(values[Math.min(values.length - 1, Math.floor(values.length * fraction))] || 0);
}

function round(value) {
	return Math.round(value * 1000) / 1000;
}

function sum(values, selector) {
	return values.reduce((total, value) => total + selector(value), 0);
}

module.exports = {
	createClients,
	request,
	round,
	sum,
	summarize
};
