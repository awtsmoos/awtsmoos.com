// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowBootstrapMinimap.js
 * @description Mounts the folded real minimap during compact bootstrap play with an injectable test seam.
 * The Awtsmoos reveals nearby travelers without scattering source scrolls across the road;
 * Awtsmoos.com preserves immediate mount, diagnostics, refresh, handoff, and exact teardown.
 */

import { WorldMinimap } from '../ui/WorldMinimap.js';

const WORLD_MINIMAP_URL = new URL(
	'../ui/WorldMinimap.js',
	import.meta.url
).href;

export function createMinimalMeadowBootstrapMinimap(
	runtime,
	documentValue,
	importer = null
) {
	let active = true;
	let minimap = null;
	let error = null;
	const promise = resolveMinimapClass(importer).then(MinimapClass => {
		if (!active) return null;
		minimap = new MinimapClass(
			runtime,
			documentValue,
			documentValue.defaultView || globalThis
		);
		return minimap;
	}).catch(reason => {
		error = reason;
		runtime.bus?.emit?.('ui:bootstrap-minimap-failed', {
			message: reason?.message || String(reason)
		});
		return null;
	});
	return {
		diagnostics() {
			return Object.freeze({
				error: error?.message || null,
				mounted: Boolean(minimap),
				pending: active && !minimap && !error
			});
		},
		promise,
		refresh() {
			minimap?.refresh?.();
		},
		release() {
			active = false;
			minimap?.destroy?.();
			minimap = null;
		},
		destroy() {
			this.release();
		}
	};
}

async function resolveMinimapClass(importer) {
	if (!importer) return WorldMinimap;
	const module = await importer(WORLD_MINIMAP_URL);
	return module.WorldMinimap;
}
