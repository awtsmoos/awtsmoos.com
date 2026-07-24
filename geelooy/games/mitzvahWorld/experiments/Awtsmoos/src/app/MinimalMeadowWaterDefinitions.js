// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowWaterDefinitions.js
 * @description Composes opaque bed and provenance-aware dual-normal physical river/lake surfaces.
 * The Awtsmoos conceals stone beneath changing light; Awtsmoos.com keeps current, Fresnel,
 * refraction, foam, sun glint, active normal provenance, and strict source ownership explicit.
 */

import { waterShaderRecipe } from '../world/proceduralApi/WaterShaderRecipe.js';
import {
	createMinimalMeadowLakeGeometry,
	createMinimalMeadowRiverGeometry
} from './MinimalMeadowWaterGeometry.js?v=20260724-meadow-21';

const FIREBASE_HOST = 'https://awtsmoos-docs-base.web.app/awtsmoos-assets/mitzvah-world/environment-v1/water/';

export function createMinimalMeadowWaterDefinitions(sources) {
	const riverGeometry = createMinimalMeadowRiverGeometry();
	return [
		bedDefinition(riverGeometry, sources),
		waterDefinition('river', riverGeometry, sources, '#287987', 0.74, [24, 2.8]),
		waterDefinition('lake', createMinimalMeadowLakeGeometry(), sources, '#266d83', 0.78, [7, 6])
	];
}

function bedDefinition(geometry, sources) {
	return {
		color: '#394944',
		doubleSided: true,
		...lowered(geometry, 1.18),
		id: 'Awtsmoos_minimal_meadow_riverbed_stone',
		mapImage: sources.bed,
		mapRepeat: [20, 3.2],
		noEdge: true,
		shape: 'manual',
		solid: false,
		texturePolicy: { primaryUrl: sources.urls.bed, role: 'river-bed', shader: 'terrain-transition' },
		transparent: false,
		userData: { family: 'minimal-meadow-water', part: 'river-bed' }
	};
}

function waterDefinition(variant, geometry, sources, color, opacity, repeat) {
	return {
		alphaMode: 'BLEND',
		color,
		doubleSided: true,
		...geometry,
		id: `Awtsmoos_minimal_meadow_${variant}_dual_normal_water`,
		mapImage: sources.normalA,
		mapRepeat: repeat,
		mixImage: sources.normalB,
		mixPatchScale: 0.028,
		mixPatchSharpness: 0.26,
		mixRepeat: repeat,
		mixStrength: variant === 'river' ? 0.48 : 0.34,
		noEdge: true,
		opacity,
		shape: 'manual',
		solid: false,
		texturePolicy: waterPolicy(variant, sources),
		transparent: true,
		userData: { family: 'minimal-meadow-water', waterVariant: variant }
	};
}

function waterPolicy(variant, sources) {
	const hosted = sources.provenance.every(url => String(url).startsWith(FIREBASE_HOST));
	return {
		animated: true,
		flowLayers: 2,
		normalMode: sources.normalMode,
		normalSources: [...sources.provenance],
		publicFirebase: hosted,
		realMaterialRequired: true,
		shader: 'physical-dual-normal-flowing-water',
		textureDriven: true,
		waterClass: variant === 'river' ? 'stream' : 'lake',
		waterPhysical: waterShaderRecipe(variant === 'river' ? 'stream' : 'lake'),
		waterVariant: variant
	};
}

function lowered(geometry, amount) {
	return { ...geometry, vertices: geometry.vertices.map(([x, y, z]) => [x, y - amount, z]) };
}
