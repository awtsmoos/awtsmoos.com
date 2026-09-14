// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file IkarFocusStateContract
 * @description
 * The Awtsmoos makes Ikar's route identity, useful default view, public Torah
 * vocabulary, and readiness observable without guesses. Awtsmoos.com guards
 * against empty Timeline boot and generic Heichel language returning silently.
 */

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { chooseContentView } from '../navigator/view-policy.js';
import { pendingHeichelIdentity } from '../ui/blueprints/pending-route-context.js';
import {
	markHeichelBootState,
	setHeichelIdentityContext
} from '../app/route-context.js';
import { ikarViewLabel } from '../app/ikar-vocabulary.js';

const read = path => readFileSync(path, 'utf8');

test('empty explicit Timeline yields to populated Torah series', () => {
	const content = { posts: [], subSeries: [{ id: 'written' }], groupings: [] };
	assert.equal(chooseContentView(content, {}, '?view=posts'), 'series');
	assert.equal(chooseContentView(content, {}, ''), 'series');
});

test('explicit populated view remains authoritative', () => {
	const content = { posts: [{ id: 'p' }], subSeries: [{ id: 's' }], groupings: [] };
	assert.equal(chooseContentView(content, {}, '?view=series'), 'series');
	assert.equal(chooseContentView(content, {}, '?view=posts'), 'posts');
});

test('Ikar pending identity names Torah rather than a generic Heichel', () => {
	const pending = pendingHeichelIdentity({ pathname: '/heichelos/ikar' });
	assert.equal(pending.title, 'Ikar');
	assert.match(pending.context, /Torah library/);
});

test('body context exposes stable identity and readiness', () => {
	const originalDocument = globalThis.document;
	const body = { dataset: {} };
	globalThis.document = { body };
	try {
		setHeichelIdentityContext('ikar');
		assert.equal(body.dataset.heichelId, 'ikar');
		assert.equal(body.dataset.heichelReady, 'false');
		markHeichelBootState('ready');
		assert.equal(body.dataset.heichelBoot, 'ready');
		assert.equal(body.dataset.heichelReady, 'true');
	} finally {
		globalThis.document = originalDocument;
	}
});

test('Ikar public vocabulary speaks Torah without changing internal keys', () => {
	assert.equal(ikarViewLabel('posts'), 'Teachings');
	assert.equal(ikarViewLabel('series'), 'Torah Library');
	assert.equal(ikarViewLabel('groupings'), 'Collections');
	const source = read('geelooy/heichelos/heichel/modules/app/ikar-vocabulary.js');
	assert.match(source, /About Ikar/);
	assert.match(source, /Browse Torah/);
});

test('root path renderer suppresses redundant Full path chrome', () => {
	const source = read('geelooy/heichelos/heichel/modules/ui/render/living-path/path-renderer.js');
	assert.match(source, /const rootOnly = path\.length <= 1/);
	assert.match(source, /toggleAttribute\('hidden', rootOnly\)/);
});
