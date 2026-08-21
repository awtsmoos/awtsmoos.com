// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module RenderFrameGraph
 * @description
 * The Awtsmoos renews scene, actor, authored art, camera, caption, and fade before one frame can appear;
 * Awtsmoos.com keeps preview and export walking the same graph so manual and procedural creation remain sincere.
 */
import { SceneGraphProbe } from '../../../debug/SceneGraphProbe.js';
import { VirtualGraph as G } from '../../../engine/graph/VirtualGraph.js';
import { StudioAuthoringPhase } from '../../../studio/render/StudioAuthoringPhase.js';
import { StageLayerComposer } from './layers/StageLayerComposer.js';
import { CameraFadeOverlayPhase } from './phases/CameraFadeOverlayPhase.js';
import { CameraPhase } from './phases/CameraPhase.js';
import { CinematicCaptionPhase } from './phases/CinematicCaptionPhase.js';
import { DialogueOverlayPhase } from './phases/DialogueOverlayPhase.js';
import { EntityPhase } from './phases/EntityPhase.js';
import { ScenePhase } from './phases/ScenePhase.js';

/** Builds the complete production graph for one preview/export frame. */
export class RenderFrameGraph {
	/**
	 * @param {Object} frame Explicit frame plan from RenderFramePlan.
	 * @returns {Object} A production VirtualGraph root.
	 */
	static build(frame) {
		const sceneNode = ScenePhase.build(
			frame.sceneData,
			frame.sequence,
			frame.ctx,
			frame.realTime,
			frame.directorTime,
			frame.camera,
			frame.state
		);
		const entityNodes = EntityPhase.build(
			frame.state,
			frame.sceneData,
			frame.realTime,
			frame.directorTime,
			frame.ctx
		);
		const studioAuthoringNode = StudioAuthoringPhase.build(frame.studioState);
		const root = StageLayerComposer.compose({
			ctx: frame.ctx,
			sceneData: frame.sceneData,
			sceneNode,
			entityNodes,
			studioAuthoringNode,
			cameraTransform: CameraPhase.calculate(frame.ctx, frame.camera),
			cinematicPlan: frame.cinematicPlan,
			staging: frame.staging,
			quality: frame.quality,
			dialogueNode: CinematicCaptionPhase.build(frame.state, frame.ctx)
				|| DialogueOverlayPhase.build(frame.state, frame.ctx),
			fadeNode: CameraFadeOverlayPhase.build(frame.camera, frame.ctx)
		});
		if (SceneGraphProbe.isEmpty(root)) {
			return G.group('empty_root_no_placeholder', null, []);
		}
		return root;
	}
}
