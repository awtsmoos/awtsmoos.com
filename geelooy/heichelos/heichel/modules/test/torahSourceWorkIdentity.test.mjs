// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file torahSourceWorkIdentity.test.mjs
 * @description
 * The Awtsmoos lets variant names reveal one stable sefer identity while every public title keeps its own graceful ray;
 * Awtsmoos.com proves live persisted children and known canonical fallbacks prevent duplicate Torah cards along the way.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	isPersistedWork,
	persistedWorkKeys,
	workIdentityKey
} from '../torahSourceWorkIdentity.js';
import { sourceWorkIncluded } from '../torahSourceHierarchy.js';

test('Torah Ohr display alias resolves to the stable work identity', () => {
	assert.equal(
		workIdentityKey('תורה אור (חב״ד)'),
		workIdentityKey('תורה אור')
	);
});

test('Likkutei Torah spelling variants share one identity', () => {
	assert.equal(
		workIdentityKey('לקוטי תורה (חב"ד)'),
		workIdentityKey('ליקוטי תורה')
	);
});

test('known persisted Chassidus works remain suppressed during metadata outages', () => {
	assert.equal(isPersistedWork({ title: 'תורה אור (חב״ד)' }), true);
	assert.equal(sourceWorkIncluded('chassidus', { title: 'תניא' }), false);
});

test('live persisted children expand duplicate suppression without code changes', () => {
	const live = [{ name: 'ספר חסידות חדש' }];
	const keys = persistedWorkKeys(live);
	assert.equal(isPersistedWork({ title: 'ספר חסידות חדש' }, keys), true);
	assert.equal(
		sourceWorkIncluded('chassidus', { title: 'ספר חסידות חדש' }, live),
		false
	);
});

test('unrelated source-backed Chassidus work stays visible', () => {
	assert.equal(
		sourceWorkIncluded('chassidus', { title: 'מאמר חסידות מקומי חדש' }, []),
		true
	);
});
