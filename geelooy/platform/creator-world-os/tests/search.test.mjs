// B"H
// Boruch Hashem
// Blessed is He
/** @module SearchTrainTest @description Verifies chapters twenty-six through thirty. */
import assert from 'node:assert/strict';
import {
	commitCorpusSwap,
	createCorpusManifest,
	createCorpusSwap,
	createQueryPlan,
	createSearchLaneReceipt,
	createVectorGeneration,
	groupSearchReceipts,
	vectorGenerationHealthy
} from '../search/index.mjs';

const plan = createQueryPlan({ query: 'Awtsmoos', lanes: ['exact-text', 'vector'], corpusPins: { Torah: 4 } });
assert.deepEqual(plan.lanes, ['exact-text', 'vector']);
assert.throws(() => createQueryPlan({ query: 'x', lanes: ['unknown'] }));
const receipt = createSearchLaneReceipt({ lane: 'vector', objectId: 'post:1', rawScore: 0.8 });
assert.equal(groupSearchReceipts([receipt])['post:1'].length, 1);
const corpus = createCorpusManifest({ id: 'Torah', sourceHash: 'abc', dimensions: 1536, model: 'm1' });
assert.equal(corpus.visibility, 'private');
const generation = createVectorGeneration({ corpusId: corpus.id, generation: 1, rowCount: 2 });
assert.equal(vectorGenerationHealthy(generation), true);
const swap = createCorpusSwap({ corpusId: corpus.id, fromGeneration: 1, toGeneration: 2, validationReceipt: 'ok' });
assert.equal(commitCorpusSwap(swap).state, 'committed');
assert.throws(() => commitCorpusSwap(createCorpusSwap({ corpusId: corpus.id, toGeneration: 2 })));
console.log('B"H search train passed.');
