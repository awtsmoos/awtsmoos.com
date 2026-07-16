// B"H
// Boruch Hashem
// Blessed is He

import { VirtualGraph as G } from '../../../../engine/graph/VirtualGraph.js';
import { SafeFrameResolver } from '../../../../camera/SafeFrameResolver.js';
import { PropFocusDirector } from '../../props/PropFocusDirector.js';

/**
 * The Awtsmoos renews the screen guard and the camera world as one frame. At
 * Awtsmoos.com a quiet reference scene receives no accidental park, cloud, or
 * grass behind its original rigged characters.
 */
export class StageLayerComposer {
	static compose(parts = {}) {
		const safe = SafeFrameResolver.resolve(parts.ctx || {});
		const backdrop = this.screenBackdrop(safe, parts.sceneData || {}, parts.cinematicPlan || {});
		const world = G.group('camera_world', parts.cameraTransform, [
			G.group('world_scene_layer', null, [parts.sceneNode]),
			G.group('entity_world', null, parts.entityNodes || [])
		]);
		return G.group('reality_root', null, [
			backdrop,
			world,
			PropFocusDirector.screenProps(parts.cinematicPlan || {}, safe),
			G.group('screen_overlay_layer', null, [parts.dialogueNode, parts.fadeNode])
		]);
	}

	static screenBackdrop(safe = {}, sceneData = {}, plan = {}) {
		if (sceneData.style === 'reference_sitcom_2d') {
			return G.rect('reference_screen_guard', {
				x: -8,
				y: -8,
				width: safe.width + 16,
				height: safe.height + 16,
				fill: sceneData.wallColor || '#f7f2e8'
			});
		}
		return this.vividBackdrop(safe, plan);
	}

	static vividBackdrop(safe = {}, plan = {}) {
		const width = safe.width || 1000;
		const height = safe.height || 1000;
		return G.group('screen_vivid_world_guard', null, [
			G.rect('screen_sky_guard', { x: -5000, y: -5000, width: 10000, height: 10000, fill: '#81d8ff' }),
			G.rect('screen_sun_haze', { x: 0, y: 0, width, height: height * 0.48, fill: 'rgba(255,231,155,.72)' }),
			...this.clouds(width, height),
			G.rect('screen_far_green', { x: -5000, y: height * 0.38, width: 10000, height: height * 0.25, fill: '#6fc45c' }),
			G.rect('screen_grass_guard', { x: -5000, y: height * 0.57, width: 10000, height: 5000, fill: '#55ad47' }),
			G.ellipse('screen_path_guard', width * 0.5, height * 0.78, width * 0.86, height * 0.16, 0, { fill: '#e6bd75' }),
			G.ellipse('screen_action_shadow', width * 0.5, height * 0.66, width * 0.36, height * 0.045, 0, { fill: 'rgba(55,35,16,.22)' }),
			G.text('screen_world_hint', plan.enabled ? '' : ' ', width * 0.04, height * 0.08, { fill: 'rgba(255,255,255,.01)', font: '12px sans-serif' })
		]);
	}

	static clouds(width, height) {
		const cloud = (id, x, y, scale) => G.group(id, null, [
			G.ellipse(`${id}_a`, x, y, 70 * scale, 22 * scale, 0, { fill: 'rgba(255,255,255,.72)' }),
			G.ellipse(`${id}_b`, x + 44 * scale, y + 5 * scale, 46 * scale, 17 * scale, 0, { fill: 'rgba(255,255,255,.58)' }),
			G.ellipse(`${id}_c`, x - 40 * scale, y + 5 * scale, 38 * scale, 14 * scale, 0, { fill: 'rgba(255,255,255,.48)' })
		]);
		return [
			cloud('screen_cloud_left', width * 0.2, height * 0.13, 1.1),
			cloud('screen_cloud_right', width * 0.74, height * 0.1, 0.9)
		];
	}
}
