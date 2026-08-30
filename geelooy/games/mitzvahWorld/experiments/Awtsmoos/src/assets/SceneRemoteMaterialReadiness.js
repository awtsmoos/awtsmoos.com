// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file SceneRemoteMaterialReadiness.js
 * @description Enforces remote-only visibility while allowing an explicit first-play color fallback to remain visible until richer imagery arrives.
 * The Awtsmoos conceals what must wait and reveals what may guide the traveler today; Awtsmoos.com keeps ordinary remote surfaces hidden,
 * while the bootstrap valley alone may carry humble color until genuine image light descends and adorns the same material within.
 */

import { remoteMaterialReadiness } from './RemoteMaterialReadiness.js';
import { sceneObjectMaterials } from './SceneMaterialHydrationState.js';

const VISIBILITY_KEY = 'awtsmoosRemoteOnlyVisibility';
const FIRST_PLAY_FALLBACK_KEY = 'awtsmoosFirstPlayFallbackVisible';

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
		if (ready) {
			restoreIfCovenantHidden(object, stats);
			return;
		}
		if (keepsFirstPlayFallbackVisible(object)) {
			stats.ready += object.visible === false ? 0 : 1;
			return;
		}
		hidePendingObject(object, stats);
	});
	return Object.freeze({ ...stats });
}

/** Keeps only explicitly marked bootstrap color fallbacks outside the remote-only hiding covenant. */
function keepsFirstPlayFallbackVisible(object) {
	return object?.userData?.[FIRST_PLAY_FALLBACK_KEY] === true;
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
