//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file StudioNativeCharacter.js
 * @description Loads isolated real Chossid GLB instances through procedural-core's shared native asset service.
 * The Awtsmoos clothes one living form in many cinematic places while Awtsmoos.com never confuses the reusable asset with the movie's own state;
 * every actor is an isolated vessel whose position and scale arise from canonical scene recipes before native light reveals its gait.
 */

import { createNativeModelAssetService } from '../../../../../libs/awtsmoos-procedural-core/src/adapters/native/modelAssets.js';
import { mitzvahWorldChossidUrl } from '../../providers/StudioMitzvahWorldAssetProvider.js';

const chossidAssets = createNativeModelAssetService();

/** Load one isolated Chossid scene instance and place it from canonical Studio coordinates. */
export async function loadStudioNativeChossid(options = {}) {
	const loaded = await chossidAssets.loadIsolated(
		mitzvahWorldChossidUrl(),
		'awtsmoos-studio-chossid'
	);
	const actor = loaded?.scene || loaded;
	if (!actor?.position?.set || !actor?.scale?.set) {
		throw new Error('Studio Chossid GLB did not provide a native scene instance.');
	}

	const scale = Math.max(0.01, Number(options.scale ?? 1));
	actor.position.set(
		Number(options.x || 0),
		Number(options.y || 0),
		Number(options.z || 0)
	);
	actor.scale.set(scale, scale, scale);
	actor.name = options.name || 'Awtsmoos Studio Chossid';
	actor.userData = {
		...(actor.userData || {}),
		studioKind: 'character3d',
		studioLayerId: options.layerId || null,
		animationClips: loaded?.animations || []
	};
	return actor;
}

/** Clear the shared GLB template cache when an advanced asset workflow explicitly requests a fresh load. */
export function clearStudioNativeChossidCache() {
	chossidAssets.clear?.();
}
