// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file runtimeQualityContracts.test.mjs
 * @description
 * The Awtsmoos lets the runtime witness remain exact through route, shard, Chrome, exception, and authored-control truth;
 * Awtsmoos.com guards every crawler contract so false alarms cannot dress working pages as broken proof.
 */

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { discoverRoutes } from './routeDiscovery.mjs';
import { parseRuntimeAuditOptions } from './runtimeAuditOptions.mjs';

/** Proves scratch AI-thought HTML never enters the discoverable runtime universe. */
test('route discovery excludes AI thought scratch trees', () => {
	const routes = discoverRoutes('geelooy');
	assert.ok(routes.length > 0);
	assert.equal(
		routes.some(route => /(?:ai[_-]thoughts)/i.test(route.file)),
		false
	);
});

/** Proves numeric shard options survive CLI normalization exactly. */
test('runtime audit parses explicit shard boundaries', () => {
	const options = parseRuntimeAuditOptions([
		'--shardIndex', '2',
		'--shardCount', '7'
	]);
	assert.equal(options.shardIndex, 2);
	assert.equal(options.shardCount, 7);
});

/** Proves private CDP targets begin on a named data page rather than an unstable blank target. */
test('CDP audit target uses a named readiness page', () => {
	const source = readFileSync(
		new URL('./CdpTargetClient.mjs', import.meta.url),
		'utf8'
	);
	assert.match(source, /Awtsmoos%2520Audit%2520Ready/);
	assert.doesNotMatch(source, /json\/new\?about%3Ablank/);
});

/** Proves CDP transport remains bounded while tolerating a loaded audit host. */
test('CDP transport exposes a finite loaded-host command ceiling', () => {
	const source = readFileSync(
		new URL('./CdpTargetClient.mjs', import.meta.url),
		'utf8'
	);
	assert.match(source, /AWTSMOOS_CDP_COMMAND_TIMEOUT_MS/);
	assert.match(source, /30_000/);
	assert.match(source, /60_000/);
});

/** Proves metrics failures keep useful exception testimony rather than generic CDP text. */
test('DOM metrics preserve detailed exception testimony', () => {
	const source = readFileSync(
		new URL('./domMetrics.mjs', import.meta.url),
		'utf8'
	);
	assert.match(source, /details\.exception\?\.description/);
	assert.match(source, /details\.text/);
});

/** Proves native-style risk is based on matching author CSS instead of class presence. */
test('control metrics prove authored visual styling directly', () => {
	const metricsSource = readFileSync(
		new URL('./domControlMetrics.mjs', import.meta.url),
		'utf8'
	);
	const probeSource = readFileSync(
		new URL('./domControlStyleProbe.mjs', import.meta.url),
		'utf8'
	);
	assert.match(metricsSource, /awtsmoosHasAuthorControlStyle/);
	assert.doesNotMatch(metricsSource, /!element\.className/);
	assert.match(probeSource, /document\.styleSheets/);
	assert.match(probeSource, /element\.matches\(rule\.selectorText\)/);
	assert.match(probeSource, /border-radius/);
	assert.match(probeSource, /background-color/);
});
