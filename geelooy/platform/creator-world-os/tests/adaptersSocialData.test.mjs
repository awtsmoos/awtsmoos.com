// B"H
// Boruch Hashem
// Blessed is He
/** @module AdaptersSocialDataTest @description Verifies social, discovery, vector, world, and release bridges. */
import assert from 'node:assert/strict';
import {
	createRadianceAdapter,
	createRichSocialAdapter,
	createVectorAdapter,
	createWorldPublicationAdapter
} from '../adapters/index.mjs';
import { DEFAULT_RELEASE_TRAINS, defaultReleaseTrain } from '../release/defaultTrains.mjs';

const rich = createRichSocialAdapter({
	normalizeRichPost(body, kind) {
		return { ...body, type: kind, rootAssets: body.assets || [], sections: body.sections || [] };
	},
	validateRichPost(post) {
		return { valid: Boolean(post.aliasId && post.heichelId && post.title), errors: [] };
	},
	toNativeBody(post) {
		return { type: post.type, title: post.title, aliasId: post.aliasId };
	}
});
const native = rich.toNative({
	id: 'q1',
	type: 'question',
	owner: 'alias',
	payload: { kind: 'question', title: 'Why?', body: 'Because' }
}, { heichelId: 'ikar' });
assert.equal(native.valid, true);
assert.equal(native.nativeBody.type, 'question');
const radiance = createRadianceAdapter({
	rankByRadiance(candidates) {
		return candidates.map(candidate => ({
			...candidate,
			radianceScore: 88,
			reasons: [{ code: 'relevance', contribution: 0.8 }]
		}));
	}
});
assert.equal(radiance.rank([{ id: 'q1', type: 'question' }])[0].explanation.reasons[0].signal, 'relevance');
class Loader {
	async load() {
		return { loaded: 2, dimensions: 3 };
	}
}
const vectors = createVectorAdapter({
	nearestIndexed() {
		return [{ id: 'q1', score: 0.9 }];
	},
	DetachedBulkLoader: Loader
});
assert.equal(vectors.nearest({ strict: true, generation: 4 })[0].receipt.corpusGeneration, 4);
assert.equal((await vectors.loadDetached({ corpusId: 'c', generation: 1 })).generation.rowCount, 2);
const service = {
	publish: (owner, world) => ({ owner, world }),
	unpublish: () => true,
	getPublic: id => ({ id, versionNumber: 2, worldId: 'w', content: { title: 'World' } }),
	resolveRuntime: id => ({ id })
};
const worlds = createWorldPublicationAdapter(service);
assert.equal(worlds.toCreatorWorldVersion(worlds.getPublic('v')).version, 2);
assert.equal(DEFAULT_RELEASE_TRAINS.length, 12);
assert.deepEqual(defaultReleaseTrain('social').chapters, [16, 17, 18, 19, 20]);
console.log('B"H social and data adapters passed.');
