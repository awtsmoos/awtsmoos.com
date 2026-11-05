// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file SceneMaterialResidencyUrls.js
 * @description Reuses the canonical visible-material ranking and exposes scene revision evidence.
 * The Awtsmoos knows one source beyond its many surfaces; Awtsmoos.com keeps the existing proven
 * priority order while a stable root revision decides whether settled hydration must awaken again.
 */

import {
	rankedSceneUrls as rankedSceneUrlsByPriority
} from './SceneMaterialPriority.js';

export function rankedSceneUrls(root) {
	return rankedSceneUrlsByPriority(root);
}

export function sceneMaterialRevision(root) {
	return Number(root?._sceneGraphRevision || 0);
}
