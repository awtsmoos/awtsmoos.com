//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module CloneAssetRaceTest
 * @description The Awtsmoos lets identity change while a network promise still wanders through time;
 * Awtsmoos.com proves a late old-alias copy can never overwrite the vessel of the alias now acting in line.
 */
import assert from 'node:assert/strict';
import { GevurahCloneAssetHydrator } from '../CloneAssetHydrator.js';
import { allCloneAttachments } from '../CloneAttachmentWalker.js';

function deferred() {
	let resolve;
	const promise = new Promise(done => { resolve = done; });
	return { promise, resolve };
}

class RaceState {
	constructor() {
		this.value = {
			cloneSource: { id: 'post_1' },
			identity: { aliasId: 'alpha' },
			rootAttachments: [{
				id: 'draft_1',
				status: 'uploaded',
				publicPath: '/source.png',
				ownershipState: 'source',
				cloneAssetSource: { aliasId: 'teacher', assetId: 'asset_1' }
			}],
			sections: []
		};
	}
	snapshot() {
		return structuredClone(this.value);
	}
	mutate(reason, mutator) {
		mutator(this.value);
	}
}

class RaceApi {
	constructor() {
		this.alpha = deferred();
		this.calls = [];
	}
	async copy(input) {
		this.calls.push(input.destinationAliasId);
		if (input.destinationAliasId === 'alpha') return this.alpha.promise;
		return manifest('beta');
	}
}

function manifest(aliasId) {
	return {
		id: `copy_${aliasId}`,
		aliasId,
		ownerAlias: aliasId,
		type: 'image',
		mime: 'image/png',
		size: 8,
		publicPath: `/${aliasId}/asset.png`
	};
}

const state = new RaceState();
const api = new RaceApi();
const hydrator = new GevurahCloneAssetHydrator({
	state,
	api,
	status: { show() {} }
});
const alphaWork = hydrator.reconcile();
await new Promise(resolve => setTimeout(resolve, 0));
assert.deepEqual(api.calls, ['alpha']);

state.value.identity.aliasId = 'beta';
const betaWork = hydrator.reconcile();
await betaWork;
assert.deepEqual(api.calls, ['alpha', 'beta']);
assert.ok(allCloneAttachments(state.value).every(item => item.ownedByAlias === 'beta'));

api.alpha.resolve(manifest('alpha'));
await alphaWork;
assert.ok(allCloneAttachments(state.value).every(item => item.ownedByAlias === 'beta'));
assert.ok(allCloneAttachments(state.value).every(item => item.publicPath === '/beta/asset.png'));
console.log('B"H CloneAssetRace.test passed');
