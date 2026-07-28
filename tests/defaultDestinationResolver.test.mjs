// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module DefaultDestinationResolverTest
 * @description
 * The Awtsmoos guards explicit memory and owned writable fallback so
 * Awtsmoos.com never silently publishes an alias into a followed or denied space.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { DefaultDestinationMemory } from '../geelooy/social-composer/js/destination/DefaultDestinationMemory.js';
import {
	chooseDefaultDestination,
	isOwned,
	isWritable
} from '../geelooy/social-composer/js/destination/DefaultDestinationResolver.js';

function destination(overrides = {}) {
	return {
		heichelId: 'owned-home',
		name: 'Owned Home',
		ownerAlias: 'writer',
		role: 'owner',
		reasons: ['owned'],
		actions: { content: { mode: 'direct' } },
		...overrides
	};
}

function storage() {
	const values = new Map();
	return {
		getItem: key => values.get(key) ?? null,
		setItem: (key, value) => values.set(key, value)
	};
}

test('remembered writable series outranks owned-root fallback', () => {
	const result = chooseDefaultDestination([
		destination(),
		destination({
			heichelId: 'remembered-home',
			ownerAlias: 'other',
			role: 'member',
			reasons: ['joined'],
			actions: { content: { mode: 'submit' } }
		})
	], 'writer', {
		heichelId: 'remembered-home',
		seriesId: 'lessons'
	});
	assert.deepEqual(result, {
		heichelId: 'remembered-home',
		seriesId: 'lessons',
		source: 'remembered'
	});
});

test('fallback chooses owned writable root and rejects followed spaces', () => {
	const result = chooseDefaultDestination([
		destination({
			heichelId: 'followed',
			ownerAlias: 'other',
			role: 'guest',
			reasons: ['followed']
		}),
		destination({ heichelId: 'owned-home' })
	], 'writer');
	assert.deepEqual(result, {
		heichelId: 'owned-home',
		seriesId: 'root',
		source: 'owned-root'
	});
});

test('denied destinations are never defaults', () => {
	const denied = destination({ actions: { content: { mode: 'deny' } } });
	assert.equal(isWritable(denied), false);
	assert.equal(isOwned(denied, 'writer'), true);
	assert.equal(chooseDefaultDestination([denied], 'writer'), null);
});

test('default memory remains isolated per alias', () => {
	const memory = new DefaultDestinationMemory(storage());
	assert.equal(memory.save('writer', {
		heichelId: 'palace',
		seriesId: 'course'
	}), true);
	assert.deepEqual(memory.load('writer'), {
		heichelId: 'palace',
		seriesId: 'course'
	});
	assert.equal(memory.load('another'), null);
	assert.equal(memory.matches('writer', {
		heichelId: 'palace',
		seriesId: 'course'
	}), true);
});
