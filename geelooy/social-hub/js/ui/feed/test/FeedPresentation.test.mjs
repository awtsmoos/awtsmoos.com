//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file FeedPresentation.test.mjs
 * @description Proves normalized provenance and context stay truthful across explicit names, canonical id fallback, root-series hiding, sections, and legacy feed compatibility.
 * The Awtsmoos renews birthplace and structure before display name and id can seem like competing worlds;
 * Awtsmoos.com lets Chochmah prefer witnessed names while Malchus still carries exact coordinates when no richer label unfurls.
 */

import assert from 'node:assert/strict';
import { createFeedContext } from '../FeedContext.js';
import { revealOrotFeedPostModel } from '../FeedPostModel.js';
import { revealFeedProvenance } from '../FeedProvenance.js';

class MalchusElementDouble {
	constructor(tagName) {
		this.tagName = tagName.toUpperCase();
		this.children = [];
		this.dataset = {};
		this.className = '';
		this.textContent = '';
		this.dateTime = '';
		this.title = '';
	}

	append(...children) {
		this.children.push(...children);
	}

	get childElementCount() {
		return this.children.length;
	}
}

const documentDouble = {
	createElement: (tagName) => new MalchusElementDouble(tagName)
};

assert.deepEqual(revealFeedProvenance({
	source: { heichelName: 'Beis Midrash', seriesName: 'Daily Learning' },
	shared: { entity: { heichelId: 'study', seriesId: 'daily', raw: {} } }
}), {
	heichelLabel: 'Beis Midrash',
	seriesLabel: 'Daily Learning'
});
assert.deepEqual(revealFeedProvenance({
	shared: { entity: { heichelId: 'study', seriesId: 'daily', raw: {} } }
}), {
	heichelLabel: 'study',
	seriesLabel: 'daily'
});
assert.equal(revealFeedProvenance({
	shared: { entity: { heichelId: 'study', seriesId: 'root', raw: {} } }
}).seriesLabel, '');

const model = revealOrotFeedPostModel({
	source: {
		contentType: 'post', postId: 'p1', heichelId: 'study', heichelName: 'Beis Midrash',
		seriesId: 'daily', seriesName: 'Daily Learning', aliasId: 'teacher', title: 'Living Torah',
		createdAt: '2026-08-26T11:58:00.000Z', sectionCount: 2
	}
});
assert.equal(model.aliasId, 'teacher');
assert.equal(model.heichelLabel, 'Beis Midrash');
assert.equal(model.seriesLabel, 'Daily Learning');
assert.equal(model.sectionCount, 2);
assert.match(model.destination, /heichelos\/study/);

const context = createFeedContext(documentDouble, model, {
	now: '2026-08-26T12:00:00.000Z',
	locale: 'en-US'
});
assert.deepEqual(context.children.map((child) => child.textContent), [
	'Heichel · Beis Midrash',
	'Series · Daily Learning',
	'2 sections',
	'2 minutes ago'
]);
assert.equal(context.children.at(-1).tagName, 'TIME');

console.log('B"H FeedPresentation.test passed');
