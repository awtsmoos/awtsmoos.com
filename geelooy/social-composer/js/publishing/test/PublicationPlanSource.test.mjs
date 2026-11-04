// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module PublicationPlanSourceTest
 * @description
 * A composer launched from a bare source link (`?source=<id>` with no
 * Heichel parameter) used to deadlock forever on "Existing content
 * requires its canonical Heichel.": no control could ever fill the missing
 * scope. Awtsmoos.com proves the plan now inherits the destination's
 * Heichel for a scopeless source — while a source that names its own
 * Heichel is never rewritten.
 */

import assert from 'node:assert/strict';
import { buildPublicationPlan, publicationIssues, normalizedSource } from '../PublicationPlan.js';

function snapshot(canonicalSource) {
	return {
		identity: {
			aliasId: 'tedt',
			heichelId: 'qaTestMuseAuditPleaseDelete',
			seriesId: 'root'
		},
		canonicalSource,
		secondaryDestinations: [],
		publication: { idempotencyKey: 'key-1', scheduledAt: 0, visibility: 'public' },
		questionId: '',
		postKind: 'post',
		presentationKind: 'post'
	};
}

// The deadlock case: source id present, heichelId empty.
const healed = buildPublicationPlan(snapshot({
	type: 'post',
	id: 'post_1793681648915_pn77g4v6b8a',
	heichelId: '',
	seriesId: 'root',
	aliasId: 'tedt'
}));
assert.equal(healed.source.heichelId, 'qaTestMuseAuditPleaseDelete',
	'scopeless source must inherit the destination Heichel');
assert.deepEqual(publicationIssues(snapshot({
	type: 'post',
	id: 'post_1793681648915_pn77g4v6b8a',
	heichelId: '',
	seriesId: 'root',
	aliasId: 'tedt'
})), [], 'no canonical-Heichel issue may remain for a healed plan');

// A source that names its own Heichel is authoritative and untouched.
const scoped = buildPublicationPlan(snapshot({
	type: 'post',
	id: 'post-9',
	heichelId: 'elsewhere',
	seriesId: 'lessons',
	aliasId: 'tedt'
}));
assert.equal(scoped.source.heichelId, 'elsewhere');
assert.equal(scoped.source.seriesId, 'lessons');

// No source at all stays an empty object (fresh publication).
assert.deepEqual(buildPublicationPlan(snapshot(null)).source, {});
assert.deepEqual(normalizedSource(snapshot(null), { heichelId: 'x', seriesId: 'root' }), {});

console.log('social-composer PublicationPlanSource.test passed');
