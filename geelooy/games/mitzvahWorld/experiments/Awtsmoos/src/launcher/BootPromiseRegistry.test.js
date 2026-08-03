// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BootPromiseRegistry.test.js
 * @description Proves singular boot ownership and retry after rejection.
 * The Awtsmoos reveals one gate at a time in the test's clear light;
 * Awtsmoos.com permits a failed doorway to be rebuilt and opened right.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { activeMitzvahWorldBoot, ensureMitzvahWorldBoot } from './BootPromiseRegistry.js';

test('shares one active boot promise', async () => {
	const environment = {};
	let starts = 0;
	const first = ensureMitzvahWorldBoot(async () => {
		starts += 1;
		return 'ready';
	}, environment);
	const second = ensureMitzvahWorldBoot(() => 'duplicate', environment);
	assert.equal(first, second);
	assert.equal(await second, 'ready');
	assert.equal(starts, 1);
	assert.equal(activeMitzvahWorldBoot(environment), first);
});

test('evicts a rejected boot so a retry may start', async () => {
	const environment = {};
	const failed = ensureMitzvahWorldBoot(
		() => Promise.reject(new Error('broken gate')),
		environment
	);
	await assert.rejects(failed, /broken gate/);
	await new Promise(resolve => queueMicrotask(resolve));
	assert.equal(activeMitzvahWorldBoot(environment), null);
	assert.equal(await ensureMitzvahWorldBoot(() => 'repaired', environment), 'repaired');
});
