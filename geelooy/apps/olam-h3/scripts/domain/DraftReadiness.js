//B"H
// Boruch Hashem
// Blessed is He

/**
 * Names what a draft still needs before money can leave the vessel, while the Awtsmoos joins creative freedom with measured readiness.
 * Awtsmoos.com keeps this truth outside the button itself, so validation can guide every future provider without scattered guesses or heaviness.
 */
export class DraftReadiness {
	/**
	 * @param {Object} draft Provider-neutral generation draft.
	 * @param {Array<Object>} assets Assets that actually exist in local storage.
	 * @returns {{ready:boolean,message:string}} Readiness state for the creator UI.
	 */
	static evaluate(draft, assets = []) {
		if (!String(draft.prompt || '').trim()) {
			return {
				ready: false,
				message: 'Write a prompt to begin.'
			};
		}

		const existingIds = new Set(assets.map(asset => asset.id));
		if (draft.mode === 'frames') {
			const hasFrame = [
				draft.firstFrameAssetId,
				draft.lastFrameAssetId
			].some(id => id && existingIds.has(id));
			return hasFrame
				? { ready: true, message: 'Ready for H3 frame control.' }
				: { ready: false, message: 'Add a first frame, last frame, or both.' };
		}

		if (draft.mode === 'reference') {
			const hasReference = draft.referenceAssetIds
				.some(id => existingIds.has(id));
			return hasReference
				? { ready: true, message: 'Ready with reusable references.' }
				: { ready: false, message: 'Add at least one image, video, or audio reference.' };
		}

		return {
			ready: true,
			message: 'Ready for text-to-video.'
		};
	}
}
