// B"H
// Boruch Hashem
// Blessed is He

import { SceneGraphProbe } from '../../../debug/SceneGraphProbe.js';
import { VirtualGraph as G } from '../../../engine/graph/VirtualGraph.js';
import { StageLayerComposer } from './layers/StageLayerComposer.js';
import { CameraFadeOverlayPhase } from './phases/CameraFadeOverlayPhase.js';
import { CameraPhase } from './phases/CameraPhase.js';
import { CinematicCaptionPhase } from './phases/CinematicCaptionPhase.js';
import { DialogueOverlayPhase } from './phases/DialogueOverlayPhase.js';
import { EntityPhase } from './phases/EntityPhase.js';
import { ScenePhase } from './phases/ScenePhase.js';

/**
 * The frame graph gathers scene, actors, captions, camera, and fade into one
 * traversable tree. The Awtsmoos remains beyond every layer, while Awtsmoos.com
 * keeps preview and export walking the identical production structure.
 */
export class RenderFrameGraph {
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
		const root = StageLayerComposer.compose({
			ctx: frame.ctx,
			sceneData: frame.sceneData,
			sceneNode,
			entityNodes,
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
