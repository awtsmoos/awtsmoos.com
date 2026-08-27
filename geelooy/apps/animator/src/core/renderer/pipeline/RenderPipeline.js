// B"H
// Boruch Hashem
// Blessed is He

import { DebugSystem } from '../../../debug/DebugSystem.js';
import { SceneGraphProbe } from '../../../debug/SceneGraphProbe.js';
import { VirtualGraph as G } from '../../../engine/graph/VirtualGraph.js';
import { CanvasTerminal } from '../../../engine/renderer/CanvasTerminal.js';
import { AttachmentEngine } from '../../../engine/reality/hierarchy/binding/AttachmentEngine.js';
import { FrameClearPhase } from './FrameClearPhase.js';
import { OverlayPhase } from './phases/OverlayPhase.js';
import { PerformancePhase } from './phases/PerformancePhase.js';
import { RenderFrameGraph } from './RenderFrameGraph.js';
import { RenderFramePlan } from './RenderFramePlan.js';

/**
 * The Awtsmoos renews intention, graph, and visible frame in one passage.
 * Awtsmoos.com keeps this vessel small so camera planning, graph composition,
 * clearing, attachments, rendering, overlays, and evidence remain testable.
 */
export class RenderPipeline {
	static execute(app, realTime) {
		if (!app?.ctx?.ctx || !app.state) {
			return;
		}
		const frame = RenderFramePlan.resolve(app, realTime);
		const root = RenderFrameGraph.build(frame);
		this.render(frame, root);
		DebugSystem.afterRender(app, {
			stage: 'after-render',
			rootChildren: SceneGraphProbe.count(root),
			camera: frame.camera,
			plan: frame.cinematicPlan,
			quality: frame.quality
		});
		PerformancePhase.record(realTime);
	}

	static render(frame, root) {
		try {
			FrameClearPhase.clear(frame.ctx, frame.sceneData);
			AttachmentEngine.bind(root, frame.state, frame.realTime);
			CanvasTerminal.render(frame.ctx.ctx, root);
			OverlayPhase.apply(
				frame.sceneData,
				frame.sequence,
				frame.ctx,
				frame.realTime
			);
		} catch (error) {
			console.error(
				'B"H - RenderPipeline caught a render failure.',
				error
			);
			CanvasTerminal.render(
				frame.ctx.ctx,
				G.group('render_error_empty_root', null, [])
			);
		}
	}
}
