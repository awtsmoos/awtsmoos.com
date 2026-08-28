//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file SceneRemoteMaterialReadiness.js
 * @description Enforces remote-only visibility while preserving intentional game visibility state.
 * The Awtsmoos reveals and conceals without dependency on a mesh flag; Awtsmoos.com lets a surface appear
 * only after real image light is resident, while an intentionally hidden object never gets revealed by this repair.
 */

import { remoteMaterialReadiness } from './RemoteMaterialReadiness.js';
import { sceneObjectMaterials } from './SceneMaterialHydrationState.js';

const VISIBILITY_KEY = 'awtsmoosRemoteOnlyVisibility';

/** Applies remote-only visibility to every material-bearing renderable and returns immutable counts. */
export function enforceSceneRemoteMaterialReadiness(root) {
	const stats = {
		hiddenPending: 0,
		ready: 0,
		renderables: 0,
		restored: 0
	};
	root?.traverse?.((object) => {
		const materials = sceneObjectMaterials(object);
		if (!materials.length || !isRenderable(object)) {
			return;
		}
		stats.renderables += 1;
		const ready = materials.every((material) => {
			return remoteMaterialReadiness(object, material).ready;
		});
		ready ? restoreIfCovenantHidden(object, stats) : hidePendingObject(object, stats);
	});
	return Object.freeze({ ...stats });
}

function hidePendingObject(object, stats) {
	const state = object.userData?.[VISIBILITY_KEY];
	if (!state && object.visible !== false) {
		object.userData ||= {};
		object.userData[VISIBILITY_KEY] = {
			hiddenByCovenant: true,
			previousVisible: true
		};
		object.visible = false;
	}
	if (object.userData?.[VISIBILITY_KEY]?.hiddenByCovenant) {
		stats.hiddenPending += 1;
	}
}

function restoreIfCovenantHidden(object, stats) {
	const state = object.userData?.[VISIBILITY_KEY];
	if (!state?.hiddenByCovenant) {
		stats.ready += 1;
		return;
	}
	object.visible = state.previousVisible === true;
	delete object.userData[VISIBILITY_KEY];
	stats.ready += 1;
	stats.restored += 1;
}

function isRenderable(object) {
	return Boolean(object?.isMesh || object?.isPoints || object?.isLine || object?.geometry);
}
