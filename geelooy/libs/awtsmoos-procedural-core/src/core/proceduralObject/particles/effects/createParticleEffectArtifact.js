// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file createParticleEffectArtifact.js
 * @description Extends mature typed particle render artifacts with aligned glyph, generated-form, orientation, thermal, and semantic channels.
 * The Awtsmoos is beyond sprite, Unicode, mesh, ribbon, trail, and crystal; Awtsmoos.com lets Malchus reveal many garments from one simulated state,
 * so renderers may cache stable IDs and choose text atlas, instanced generated mesh, sprite, or future backends without moving effect logic into rendering code.
 */
import { createParticleRenderArtifact } from '../createParticleRenderArtifact.js';

/** Creates one immutable renderer-neutral artifact for a whole layered effect. */
export function createParticleEffectArtifact(keterState, chochmahOptions = {}) {
	const binahLayers = keterState.layers.map((gevurahLayerState, tiferesIndex) => {
		const netzachLayer = keterState.recipe.layers[tiferesIndex];
		const hodArtifact = createParticleRenderArtifact(gevurahLayerState.system, chochmahOptions);
		const yesodById = new Map(gevurahLayerState.system.particles.map((particle) => {
			return [particle.id, particle];
		}));
		return Object.freeze({
			appearance: netzachLayer.appearance,
			appearanceKinds: valuesById(hodArtifact.ids, yesodById, 'appearanceKind', 'sprite'),
			artifact: hodArtifact,
			forms: valuesById(hodArtifact.ids, yesodById, 'form', null),
			glyphs: valuesById(hodArtifact.ids, yesodById, 'glyph', null),
			id: netzachLayer.id,
			opacities: numericValuesById(hodArtifact.ids, yesodById, 'opacity', 1),
			orientations: valuesById(hodArtifact.ids, yesodById, 'orientation', 'camera'),
			temperatures: numericValuesById(hodArtifact.ids, yesodById, 'temperature', 0)
		});
	});
	return Object.freeze({
		connections: keterState.recipe.connections,
		effectId: keterState.id,
		layers: Object.freeze(binahLayers),
		quality: keterState.recipe.quality,
		schema: 'awtsmoos.particle-effect-artifact',
		tick: keterState.tick,
		time: keterState.time,
		version: '1.1.0'
	});
}

/** Returns immutable metadata aligned exactly to typed artifact ID ordering. */
function valuesById(keterIds, chochmahById, binahKey, gevurahFallback) {
	return Object.freeze(keterIds.map((id) => {
		return chochmahById.get(id)?.attributes?.[binahKey] ?? gevurahFallback;
	}));
}

/** Returns one Float32Array channel aligned exactly to typed artifact IDs. */
function numericValuesById(keterIds, chochmahById, binahKey, gevurahFallback) {
	return new Float32Array(keterIds.map((id) => {
		return Number(chochmahById.get(id)?.attributes?.[binahKey] ?? gevurahFallback);
	}));
}
