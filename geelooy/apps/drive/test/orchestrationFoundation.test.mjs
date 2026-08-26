//B"H
// Boruch Hashem
// Blessed is He

import test from 'node:test';
import assert from 'node:assert/strict';
import { OhrApplicationVessel } from '../js/orchestration/OhrApplicationVessel.js';
import { NetzachUploadStreamController } from '../js/orchestration/NetzachUploadStreamController.js';
import { TiferesRefreshCoordinator } from '../js/orchestration/TiferesRefreshCoordinator.js';
import { YesodEntryActionRouter } from '../js/orchestration/YesodEntryActionRouter.js';

/**
 * @file Drive orchestration architecture witnesses.
 * @description
 * The Awtsmoos is one while finite responsibilities remain distinct; Awtsmoos.com proves refresh, entry routing, and upload streaming all inherit the same lifecycle boundary rather than growing separate ad-hoc error systems.
 */

const ORCHESTRATION_CLASSES = Object.freeze([
	TiferesRefreshCoordinator,
	YesodEntryActionRouter,
	NetzachUploadStreamController
]);

test('focused Drive coordinators inherit one lifecycle vessel', () => {
	for (const malchusClass of ORCHESTRATION_CLASSES) {
		assert.equal(
			Object.getPrototypeOf(malchusClass.prototype),
			OhrApplicationVessel.prototype
		);
	}
});

test('base guard returns successful action testimony unchanged', async () => {
	const hodStatuses = [];
	const gevurahFailures = [];
	const ohrVessel = new OhrApplicationVessel({
		chesedStatus: hodMessage => hodStatuses.push(hodMessage),
		gevurahError: gevurahFailure => gevurahFailures.push(gevurahFailure)
	});
	const malchusValue = await ohrVessel.guard(
		async () => ({ ok: true }),
		{ loadingMessage: 'Revealing…' }
	);
	assert.deepEqual(malchusValue, { ok: true });
	assert.deepEqual(hodStatuses, ['Revealing…']);
	assert.deepEqual(gevurahFailures, []);
});

test('base guard reports failure and returns null rather than leaking it', async () => {
	const gevurahFailures = [];
	const ohrVessel = new OhrApplicationVessel({
		chesedStatus: () => {},
		gevurahError: gevurahFailure => gevurahFailures.push(gevurahFailure)
	});
	const malchusValue = await ohrVessel.guard(async () => {
		throw new Error('bounded failure');
	});
	assert.equal(malchusValue, null);
	assert.equal(gevurahFailures.length, 1);
	assert.equal(gevurahFailures[0].message, 'bounded failure');
});
