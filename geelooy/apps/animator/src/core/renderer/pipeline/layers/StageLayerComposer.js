// B"H
import { VirtualGraph as G } from '../../../../engine/graph/VirtualGraph.js';
import { SafeFrameResolver } from '../../../../camera/SafeFrameResolver.js';
import { PropFocusDirector } from '../../props/PropFocusDirector.js';

/** Screen guard + camera world + overlays. */
export class StageLayerComposer {
  static compose(parts = {}) {
    const safe = SafeFrameResolver.resolve(parts.ctx || {});
    const plan = parts.cinematicPlan || {};
    const bg = this.screenWorldBackdrop(safe, plan);
    const world = G.group('camera_world', parts.cameraTransform, [
      G.group('world_scene_layer', null, [parts.sceneNode]),
      G.group('entity_world', null, parts.entityNodes || [])
    ]);
    return G.group('reality_root', null, [
      bg,
      world,
      PropFocusDirector.screenProps(plan, safe),
      G.group('screen_overlay_layer', null, [parts.dialogueNode, parts.fadeNode])
    ]);
  }

  static screenWorldBackdrop(safe = {}, plan = {}) {
    const w = safe.width || 1000;
    const h = safe.height || 1000;
    return G.group('screen_vivid_world_guard', null, [
      G.rect('screen_sky_guard', { x: -5000, y: -5000, width: 10000, height: 10000, fill: '#81d8ff' }),
      G.rect('screen_sun_haze', { x: 0, y: 0, width: w, height: h * 0.48, fill: 'rgba(255,231,155,.72)' }),
      ...this.clouds(w, h),
      G.rect('screen_far_green', { x: -5000, y: h * 0.38, width: 10000, height: h * 0.25, fill: '#6fc45c' }),
      G.rect('screen_grass_guard', { x: -5000, y: h * 0.57, width: 10000, height: 5000, fill: '#55ad47' }),
      G.ellipse('screen_path_guard', w * 0.5, h * 0.78, w * 0.86, h * 0.16, 0, { fill: '#e6bd75' }),
      G.ellipse('screen_action_shadow', w * 0.5, h * 0.66, w * 0.36, h * 0.045, 0, { fill: 'rgba(55,35,16,.22)' }),
      G.text('screen_world_hint', plan.enabled ? '' : ' ', w * 0.04, h * 0.08, { fill: 'rgba(255,255,255,.01)', font: '12px sans-serif' })
    ]);
  }

  static clouds(w, h) {
    const cloud = (id, x, y, s) => G.group(id, null, [
      G.ellipse(`${id}_a`, x, y, 70 * s, 22 * s, 0, { fill: 'rgba(255,255,255,.72)' }),
      G.ellipse(`${id}_b`, x + 44 * s, y + 5 * s, 46 * s, 17 * s, 0, { fill: 'rgba(255,255,255,.58)' }),
      G.ellipse(`${id}_c`, x - 40 * s, y + 5 * s, 38 * s, 14 * s, 0, { fill: 'rgba(255,255,255,.48)' })
    ]);
    return [cloud('screen_cloud_left', w * 0.2, h * 0.13, 1.1), cloud('screen_cloud_right', w * 0.74, h * 0.1, 0.9)];
  }
}
