//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file StudioFederationActions.js
 * The Awtsmoos renews backend and placement without confusing one choice with another role;
 * Awtsmoos.com lets human taps choose a specialist or move 2D through depth while one movie remains whole.
 */

import { compileMovieForMitzvahWorld, mitzvahWorldRoute } from '../backends/StudioMitzvahWorldBackend.js';
import { animatorGeneratorModules, animatorProductionGeneratorCatalog } from '../providers/StudioAnimatorGeneratorCatalog.js';
import { describeMitzvahWorldAssets } from '../providers/StudioMitzvahWorldAssetProvider.js';
import { searchMitzvahWorldTextures } from '../providers/StudioMitzvahWorldMaterialProvider.js';
import { restoreStudioMovieLayerToScreen, spatializeStudioMovieLayer } from '../api/StudioSpatialCommand.js';

/** Build modular UI actions for backend discovery and reversible 2D-in-3D placement. */
export function createStudioFederationActions(session) {
	return {
		selectMovieLayer({ event, store }) {
			store.set('selectedLayerId', event.currentTarget.dataset.layerId);
		},
		async setSpatialMode({ event, store }) {
			const layerId = store.get('selectedLayerId');
			if (!layerId) return store.set('status', 'Choose a scene layer first.');
			const space = event.currentTarget.dataset.spatialMode;
			const movie = space === 'screen'
				? restoreStudioMovieLayerToScreen(store.get('movie'), layerId)
				: spatializeStudioMovieLayer(store.get('movie'), layerId, defaultSpatial(space));
			await session.loadDocument(movie, `${layerId} → ${space}. Source layer preserved.`);
		},
		selectBackend({ event, store }) {
			store.set('selectedBackend', event.currentTarget.dataset.backendId);
		},
		async inspectAnimator({ store }) {
			const production = await animatorProductionGeneratorCatalog();
			const modules = animatorGeneratorModules();
			store.set('status', `Animator: ${production.map(item => item.id).join(', ')} · ${modules.length} separate modules.`);
		},
		async inspectMitzvahWorld({ store }) {
			const assets = describeMitzvahWorldAssets();
			const textures = await searchMitzvahWorldTextures('');
			store.set('status', `MitzvahWorld: ${assets.assets.length} authored GLB provider · ${textures.length} remote textures.`);
		},
		async compileMitzvahWorld({ store }) {
			const compiled = await compileMovieForMitzvahWorld(store.get('movie'));
			store.setSilent('mitzvahWorldDraft', compiled);
			store.set('status', 'Canonical movie compiled for MitzvahWorld without importing its runtime into Studio.');
		},
		openMitzvahWorld() {
			globalThis.open?.(mitzvahWorldRoute().replace('?studioHandoff=1', ''), '_blank', 'noopener');
		}
	};
}

function defaultSpatial(space) {
	return {
		space,
		position: { x: 0, y: 0, z: 0 },
		size: { width: 3.2, height: 1.8 },
		rotation: { x: 0, y: 0, z: 0 }
	};
}
