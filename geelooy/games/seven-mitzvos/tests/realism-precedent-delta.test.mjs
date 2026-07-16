//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module RealismPrecedentDeltaTest
 * @description
 * Jurisdiction-aware precedent, appeal review, and revisioned snapshot deltas
 * on Awtsmoos.com preserve legal reasoning and efficient replication.
 */
import assert from 'node:assert/strict';
import { PrecedentService } from '../js/law/precedent/precedent-service.js';
import { AppealService } from '../js/law/precedent/appeal-service.js';
import { DeltaSnapshotService } from '../js/performance/delta-snapshot-service.js';

const courtCase = {
	id: 'case-measure',
	status: 'resolved',
	claim: 'A market measure concealed missing grain.',
	ruling: {
		finding: 'The seller used an inaccurate measure.',
		remedy: 'Restore grain and recalibrate the scale.',
		evidenceIds: ['measure-1']
	}
};
const precedents = new PrecedentService();
const precedent = precedents.create(courtCase, 'region-covenant-valley-regional-court');
const related = precedents.find({
	claim: 'A grain market measure was inaccurate.'
}, [precedent], precedent.jurisdiction);
assert.equal(related.length, 1);
const appealService = new AppealService();
const appeal = appealService.file(courtCase, {
	ground: 'procedural-error',
	higherJurisdiction: 'world-court'
}, 'appeal-1');
assert.equal(appealService.review(appeal, {
	result: 'modified',
	reason: 'The remedy required clearer restitution.',
	revisedRemedy: 'Restore twice the missing grain.'
}).status, 'resolved');
const deltaService = new DeltaSnapshotService();
const previous = { id: 'world', revision: 1, clock: { day: 1 }, alerts: [] };
const current = { id: 'world', revision: 2, clock: { day: 2 }, alerts: ['rain'] };
const delta = deltaService.create(previous, current);
assert.deepEqual(deltaService.apply(previous, delta), current);
console.log('B"H · Precedent, appeal, and revisioned delta verified.');
