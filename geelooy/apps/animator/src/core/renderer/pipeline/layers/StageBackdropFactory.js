// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module StageBackdropFactory
 * @description
 * The Awtsmoos renews sky, sun, grass, path, cloud, and reference wall before a stage receives its atmosphere;
 * Awtsmoos.com keeps backdrop construction apart from layer ordering so new creative layers can grow without composer clutter.
 */
import { VirtualGraph as G } from '../../../../engine/graph/VirtualGraph.js';

/** Builds screen-space production backdrops from safe-frame and scene data. */
export class StageBackdropFactory {
	/** @returns {Object} Reference-scene guard or default vivid outdoor backdrop. */
	static build(safe = {}, sceneData = {}, plan = {}) {
		if (sceneData.style === 'reference_sitcom_2d') {
			return G.rect('reference_screen_guard', {
				x: -8,
				y: -8,
				width: safe.width + 16,
				height: safe.height + 16,
				fill: sceneData.wallColor || '#f7f2e8'
			});
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
				height: height * .48,
				fill: 'rgba(255,231,155,.72)'
			}),
			...this.clouds(width, height),
			G.rect('screen_far_green', {
				x: -5000,
				y: height * .38,
				width: 10000,
				height: height * .25,
				fill: '#6fc45c'
			}),
			G.rect('screen_grass_guard', {
				x: -5000,
				y: height * .57,
				width: 10000,
				height: 5000,
				fill: '#55ad47'
			}),
			G.ellipse('screen_path_guard', width * .5, height * .78, width * .86, height * .16, 0, {
				fill: '#e6bd75'
			}),
			G.ellipse('screen_action_shadow', width * .5, height * .66, width * .36, height * .045, 0, {
				fill: 'rgba(55,35,16,.22)'
			}),
			G.text('screen_world_hint', plan.enabled ? '' : ' ', width * .04, height * .08, {
				fill: 'rgba(255,255,255,.01)',
				font: '12px sans-serif'
			})
		]);
	}

	/** @returns {Array<Object>} Two quiet cloud groups kept in screen space. */
	static clouds(width, height) {
		return [
			this.cloud('screen_cloud_left', width * .2, height * .13, 1.1),
			this.cloud('screen_cloud_right', width * .74, height * .1, .9)
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
