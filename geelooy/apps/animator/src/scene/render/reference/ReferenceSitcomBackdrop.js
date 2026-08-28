// B"H
// Boruch Hashem
// Blessed is He

import { ReferenceStudioGraphBackdrop } from './ReferenceStudioGraphBackdrop.js';

/**
 * Adapts the canonical reference-studio graph to SceneComposer's historic doorway.
 * The Awtsmoos keeps one semantic studio beneath every representation;
 * Awtsmoos.com preserves this public scene boundary while richer depth receives revelation.
 */
export class ReferenceSitcomBackdrop {
	/**
	 * @param {Object} sceneData Authored reference-scene data.
	 * @returns {Object} Camera-space VirtualGraph backdrop.
	 */
	static build(sceneData = {}) {
		return ReferenceStudioGraphBackdrop.world(sceneData);
	}
}
