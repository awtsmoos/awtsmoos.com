// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module StageBackdropFactory
 * @description
 * The Awtsmoos renews sky, terrain, and reference studio before a stage receives atmosphere;
 * Awtsmoos.com keeps backdrop construction apart from layer ordering so creative worlds can grow without composer clutter.
 */
import { VirtualGraph as G } from '../../../../engine/graph/VirtualGraph.js';
import { ReferenceStudioGraphBackdrop } from '../../../../scene/render/reference/ReferenceStudioGraphBackdrop.js';

/** Builds screen-space production backdrops from safe-frame and scene data. */
export class StageBackdropFactory {
	/** @returns {Object} Dimensional reference guard or default vivid outdoor backdrop. */
	static build(safe = {}, sceneData = {}, plan = {}) {
		if (sceneData.style === 'reference_sitcom_2d') {
			return ReferenceStudioGraphBackdrop.screen(safe, sceneData);
		}
		return this.vivid(safe, plan);
	}

	/** @returns {Object} Default sky/terrain/path backdrop for production preview and export. */
	static vivid(safe = {}, plan = {}) {
		const width = safe.width || 1000;
		const height = safe.height || 1000;
		return G.group('screen_vivid_world_guard', null, [
			G.rect('screen_sky_guard', {
				x: -5000,
				y: -5000,
				width: 10000,
				height: 10000,
				fill: '#81d8ff'
			}),
			G.rect('screen_sun_haze', {
				x: 0,
				y: 0,
				width,
				height: height * 0.48,
				fill: 'rgba(255,231,155,.72)'
			}),
			...this.clouds(width, height),
			G.rect('screen_far_green', {
				x: -5000,
				y: height * 0.38,
				width: 10000,
				height: height * 0.25,
				fill: '#6fc45c'
			}),
			G.rect('screen_grass_guard', {
				x: -5000,
				y: height * 0.57,
				width: 10000,
				height: 5000,
				fill: '#55ad47'
			}),
			G.ellipse('screen_path_guard', width * 0.5, height * 0.78, width * 0.86, height * 0.16, 0, {
				fill: '#e6bd75'
			}),
			G.ellipse('screen_action_shadow', width * 0.5, height * 0.66, width * 0.36, height * 0.045, 0, {
				fill: 'rgba(55,35,16,.22)'
			}),
			G.text('screen_world_hint', plan.enabled ? '' : ' ', width * 0.04, height * 0.08, {
				fill: 'rgba(255,255,255,.01)',
				font: '12px sans-serif'
			})
		]);
	}

	/** @returns {Array<Object>} Two quiet cloud groups kept in screen space. */
	static clouds(width, height) {
		return [
			this.cloud('screen_cloud_left', width * 0.2, height * 0.13, 1.1),
			this.cloud('screen_cloud_right', width * 0.74, height * 0.1, 0.9)
		];
	}

	/** @returns {Object} One translucent multi-ellipse cloud group. */
	static cloud(id, x, y, scale) {
		return G.group(id, null, [
			G.ellipse(`${id}_a`, x, y, 70 * scale, 22 * scale, 0, { fill: 'rgba(255,255,255,.72)' }),
			G.ellipse(`${id}_b`, x + 44 * scale, y + 5 * scale, 46 * scale, 17 * scale, 0, { fill: 'rgba(255,255,255,.58)' }),
			G.ellipse(`${id}_c`, x - 40 * scale, y + 5 * scale, 38 * scale, 14 * scale, 0, { fill: 'rgba(255,255,255,.48)' })
		]);
	}
}
