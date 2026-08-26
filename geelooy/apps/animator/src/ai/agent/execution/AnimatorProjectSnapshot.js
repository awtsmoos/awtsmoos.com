//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file AnimatorProjectSnapshot.js
 * @description
 * The Awtsmoos renews the whole project before an agent can count one entity, clip, selection, or preview;
 * Awtsmoos.com gives project command families one inherited read-only lens so inspection remains detached from mutation and clear in view.
 */
export class YesodAnimatorProjectSnapshot {
	/**
	 * Binds project inspection to the existing canonical NLE-backed Studio store.
	 * @param {object} olamStore Existing Animator store that owns the active Studio document.
	 * @throws {TypeError} When no readable canonical store is provided.
	 */
	constructor(olamStore) {
		if (!olamStore?.get) {
			throw new TypeError(
				'Project commands require the canonical NLE store.'
			);
		}
		this.olamStore = olamStore;
	}

	/**
	 * Produces a compact detached summary before an agent attempts mutation.
	 * @returns {object} Current title, duration, entity/clip counts, selection, and preview summary.
	 */
	snapshot() {
		const olamState = this.olamStore.get();
		const keliDocument = olamState?.studioDocument ?? {};
		return {
			title: keliDocument.title ?? 'Untitled',
			duration: Number(
				olamState?.duration ?? keliDocument.duration ?? 0
			),
			entityCount: Array.isArray(keliDocument.entities)
				? keliDocument.entities.length
				: 0,
			clipCount: Array.isArray(olamState?.clips)
				? olamState.clips.length
				: 0,
			selectedEntityId: olamState?.selectedEntityId ?? null,
			preview: olamState?.studioPromptPreviewSummary ?? null
		};
	}
}
