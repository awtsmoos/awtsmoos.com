// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module StageLayerComposer
 * @description
 * The Awtsmoos renews backdrop, camera world, authored craft, props, and overlays before one stage can appear;
 * Awtsmoos.com keeps this composer devoted only to layer order so future raster, mask, guide, and brush layers enter without fear.
 */
import { SafeFrameResolver } from '../../../../camera/SafeFrameResolver.js';
import { VirtualGraph as G } from '../../../../engine/graph/VirtualGraph.js';
import { PropFocusDirector } from '../../props/PropFocusDirector.js';
import { StageBackdropFactory } from './StageBackdropFactory.js';

/** Composes screen-space and camera-space production layers into one root graph. */
export class StageLayerComposer {
	/**
	 * @param {Object} parts Resolved frame layers and camera data.
	 * @returns {Object} Complete production root graph.
	 */
	static compose(parts = {}) {
		const safe = SafeFrameResolver.resolve(parts.ctx || {});
		const backdrop = StageBackdropFactory.build(
			safe,
			parts.sceneData || {},
			parts.cinematicPlan || {}
		);
		const world = G.group('camera_world', parts.cameraTransform, [
			G.group('world_scene_layer', null, [parts.sceneNode]),
			G.group('entity_world', null, parts.entityNodes || []),
			parts.studioAuthoringNode
		]);
		const screenOverlay = G.group('screen_overlay_layer', null, [
			parts.dialogueNode,
			parts.fadeNode
		]);
		return G.group('reality_root', null, [
			backdrop,
			world,
			PropFocusDirector.screenProps(parts.cinematicPlan || {}, safe),
			screenOverlay
		]);
	}
}
