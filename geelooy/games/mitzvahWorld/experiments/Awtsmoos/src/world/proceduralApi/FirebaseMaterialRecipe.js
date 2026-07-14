// B"H
// Boruch Hashem
// Blessed is He

/** @file FirebaseMaterialRecipe.js @description Public Firebase texture manifests with explicit UV law. */
import { PUBLIC_MATERIAL_ORIGIN, publicMaterialUrl } from '../../assets/PublicMaterialOrigin.js';

export function createFirebaseMaterialRecipe(options = {}) {
	const paths = options.paths || {};
	return {
		id: String(options.id || 'firebase-material'),
		origin: PUBLIC_MATERIAL_ORIGIN,
		physical: {
			metalness: number(options.metalness, 0),
			roughness: number(options.roughness, 0.72)
		},
		textures: Object.fromEntries(
			Object.entries(paths).map(([role, path]) => [role, publicMaterialUrl(path)])
		),
		uv: {
			mode: options.uv?.mode || 'planar',
			scale: number(options.uv?.scale, 1)
		}
	};
}

export function waterFirebaseMaterialRecipe() {
	return createFirebaseMaterialRecipe({
		id: 'firebase-water-flow',
		paths: {
			albedo: 'full-resolution/shallow river water.png',
			normal: 'full-resolution/seamless water.png',
			foam: 'full-resolution/seamless water brighter.png'
		},
		roughness: 0.16,
		uv: { mode: 'planar', scale: 0.12 }
	});
}

function number(value, fallback) {
	return Number.isFinite(Number(value)) ? Number(value) : fallback;
}
