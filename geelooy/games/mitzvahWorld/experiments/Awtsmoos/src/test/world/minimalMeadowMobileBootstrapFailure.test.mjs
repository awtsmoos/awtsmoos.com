// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file minimalMeadowMobileBootstrapFailure.test.mjs
 * @description Proves a rejected world boot becomes one settled receipt instead of an uncaught cascade.
 * The Awtsmoos preserves truth even when a vessel breaks; Awtsmoos.com records the rupture once,
 * marks the document, and leaves no second rejected promise wandering through the mobile console.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { startMinimalMeadowMobileIntegration } from '../../app/MinimalMeadowMobileIntegration.js';

test('B"H automatic integration settles a rejected boot without rethrowing', async () => {
	const documentValue = { documentElement: { dataset: {} } };
	const environment = {
		AwtsmoosMitzvahWorldBoot: Promise.reject(new Error('synthetic boot rupture')),
		document: documentValue
	};
	const errors = [];
	const originalError = console.error;
	console.error = (...values) => errors.push(values);
	try {
		const promise = startMinimalMeadowMobileIntegration(environment, documentValue);
		const receipt = await promise;
		assert.equal(environment.AwtsmoosMobileIntegrationPromise, promise);
		assert.equal(receipt.ready, false);
		assert.equal(receipt.status, 'failed');
		assert.match(receipt.error, /synthetic boot rupture/);
		assert.equal(Object.isFrozen(receipt), true);
		assert.equal(documentValue.documentElement.dataset.awtsmoosMobileIntegration, 'failed');
		assert.equal(errors.length, 1);
	} finally {
		console.error = originalError;
	}
});
