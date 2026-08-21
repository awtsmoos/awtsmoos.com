//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module CloneAssetHydratorTestVessel
 * @description The Awtsmoos lets alias switches and media failures be simulated without a browser shell;
 * Awtsmoos.com receives a small state vessel where repeated sources, retries, and ownership can be measured well.
 */
export class FakeState {
	constructor(value) {
		this.value = value;
	}

	snapshot() {
		return structuredClone(this.value);
	}

	mutate(reason, mutator) {
		mutator(this.value);
		return this.snapshot();
	}

	addEventListener() {}
}

export function sourceAttachment(assetId = 'asset-a', localId = assetId) {
	return {
		id: localId,
		status: 'uploaded',
		publicPath: `/source/${assetId}.webm`,
		type: 'video',
		mime: 'video/webm',
		cloneAssetSource: { aliasId: 'teacher', assetId },
		ownershipState: 'source'
	};
}

export function cloneValue(aliasId = 'student', secondSource = false) {
	return {
		cloneSource: { id: 'post-1', aliasId: 'teacher' },
		identity: { aliasId, heichelId: 'home', seriesId: 'root' },
		questionId: '',
		postKind: 'post',
		title: 'Copy',
		rootBlocks: [{ id: 'b1', text: 'Text', type: 'paragraph' }],
		rootAttachments: [sourceAttachment('asset-a', 'root')],
		sections: [{
			id: 'v1',
			title: 'Verse',
			blocks: [],
			attachments: [sourceAttachment(secondSource ? 'asset-b' : 'asset-a', 'verse')],
			subsections: []
		}],
		publication: {}
	};
}

export function fakeApi(calls, failingAssets = new Set()) {
	return {
		copy: async input => {
			calls.push(input);
			if (failingAssets.has(input.sourceAssetId)) {
				throw new Error(`copy failed: ${input.sourceAssetId}`);
			}
			return {
				id: `owned-${input.destinationAliasId}-${input.sourceAssetId}`,
				aliasId: input.destinationAliasId,
				publicPath: `/owned/${input.destinationAliasId}/${input.sourceAssetId}.webm`,
				type: 'video',
				mime: 'video/webm',
				size: 12
			};
		}
	};
}

export function statusRecorder() {
	const messages = [];
	return {
		messages,
		status: { show: (message, kind) => messages.push({ message, kind }) }
	};
}
