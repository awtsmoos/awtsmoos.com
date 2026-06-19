// B"H
import { CanvasTerminal } from '../../../engine/renderer/CanvasTerminal.js';
import { VirtualGraph as G } from '../../../engine/graph/VirtualGraph.js';
import { ScenePhase } from './phases/ScenePhase.js';
import { EntityPhase } from './phases/EntityPhase.js';
import { CameraPhase } from './phases/CameraPhase.js';
import { DialogueOverlayPhase } from './phases/DialogueOverlayPhase.js';
import { CameraFadeOverlayPhase } from './phases/CameraFadeOverlayPhase.js';
import { CinematicCaptionPhase } from './phases/CinematicCaptionPhase.js';
import { OverlayPhase } from './phases/OverlayPhase.js';
import { PerformancePhase } from './phases/PerformancePhase.js';
import { CinematicSceneTreatment } from './phases/CinematicSceneTreatment.js';
import { StageLayerComposer } from './layers/StageLayerComposer.js';
import { FrameClearPhase } from './FrameClearPhase.js';
import { AttachmentEngine } from '../../../engine/reality/hierarchy/binding/AttachmentEngine.js';
import { SceneGraphProbe } from '../../../debug/SceneGraphProbe.js';
import { DebugSystem } from '../../../debug/DebugSystem.js';
import { AutomaticShotDirector } from '../../../director/camera/AutomaticShotDirector.js';
import { CinematicMobileShotDirector } from '../../../director/camera/CinematicMobileShotDirector.js';
import { FrameQualityOracle } from '../../../director/quality/FrameQualityOracle.js';
import { CinematicStagingDirector } from '../../../director/staging/CinematicStagingDirector.js';

/** Unified graph render pipeline: story plan, shot plan, camera, proof, pixels. */
export class RenderPipeline {
  static execute(app, realTime) {
    if (!app?.ctx?.ctx || !app.state) return;
    const { ctx, state, director } = app;
    const directorTime = director?.getElapsed ? director.getElapsed() : realTime / 1000;
    const rawCamera = this.rawCamera(state);
    const plan = AutomaticShotDirector.plan({ ctx, state, time: directorTime, camera: rawCamera });
    const cam = CinematicMobileShotDirector.resolve(ctx, state, rawCamera, plan);
    const quality = FrameQualityOracle.score(plan, cam);
    const staging = CinematicStagingDirector.resolve(plan);
    const sceneData = CinematicSceneTreatment.apply(state.get('scene') || {}, cam);
    const sequence = state.get('activeSequence');
    const sceneNode = ScenePhase.build(sceneData, sequence, ctx, realTime, directorTime, cam, state);
    const entityNodes = EntityPhase.build(state, sceneData, realTime, directorTime, ctx);
    const cameraTransform = CameraPhase.calculate(ctx, cam);
    let root = StageLayerComposer.compose({
      ctx, sceneNode, entityNodes, cameraTransform, cinematicPlan: plan, staging, quality,
      dialogueNode: CinematicCaptionPhase.build(state, ctx) || DialogueOverlayPhase.build(state, ctx),
      fadeNode: CameraFadeOverlayPhase.build(cam, ctx)
    });
    if (SceneGraphProbe.isEmpty(root)) root = G.group('empty_root_no_placeholder', null, []);
    this.render(ctx, state, root, sceneData, sequence, realTime);
    DebugSystem.afterRender(app, { stage: 'after-render', rootChildren: SceneGraphProbe.count(root), camera: cam, plan, quality });
    PerformancePhase.record(realTime);
  }

  static rawCamera(state) {
    const raw = state?.get ? state.get('camera') : null;
    if (!raw) return { x: 0, y: 0, zoom: 1, shot: 'group', cameraId: 'group' };
    return { ...raw, x: Number(raw.x) || 0, y: Number(raw.y) || 0, zoom: Number(raw.zoom) || 1, shot: raw.shot || raw.framing || raw.cameraId || 'group', cameraId: raw.cameraId || raw.id || raw.shot || 'group' };
  }

  static render(ctx, state, root, sceneData, sequence, realTime) {
    try {
      FrameClearPhase.clear(ctx);
      AttachmentEngine.bind(root, state, realTime);
      CanvasTerminal.render(ctx.ctx, root);
      OverlayPhase.apply(sceneData, sequence, ctx, realTime);
    } catch (error) {
      console.error('B"H - RenderPipeline caught a render failure.', error);
      CanvasTerminal.render(ctx.ctx, G.group('render_error_empty_root', null, []));
    }
  }
}
