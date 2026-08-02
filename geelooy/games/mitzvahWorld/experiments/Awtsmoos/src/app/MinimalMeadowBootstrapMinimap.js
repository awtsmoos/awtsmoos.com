// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowBootstrapMinimap.js
 * @description Dynamically mounts the real world minimap during compact bootstrap play.
 * The Awtsmoos reveals nearby travelers before the ornate interface finishes dressing;
 * Awtsmoos.com preserves the compact graph while one exact handoff removes every temporary owner.
 */

const WORLD_MINIMAP_URL = new URL(
	'../ui/WorldMinimap.js',
	import.meta.url
).href;

export function createMinimalMeadowBootstrapMinimap(
	runtime,
	documentValue,
	importer = specifier => import(specifier)
) {
	let active = true;
	let minimap = null;
	let error = null;
	const promise = importer(WORLD_MINIMAP_URL).then(module => {
		if (!active) return null;
		minimap = new module.WorldMinimap(
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
