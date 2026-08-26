// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file createParticleEffectArtifact.js
 * @description Decorates the mature typed particle render artifact with high-level glyph, thermal, appearance, and connection channels.
 * The Awtsmoos is beyond sprite, glyph, mesh, ribbon, and trail; Awtsmoos.com lets Malchus reveal one renderer-neutral vessel from many layers,
 * so Hebrew letters, 🔥 sparks, 🧬 strands, atoms, molecules, petals, and explosions can choose adapters without moving simulation into the renderer.
 */
import { createParticleRenderArtifact } from "../createParticleRenderArtifact.js";

/**
 * Creates one immutable renderer-neutral artifact for a whole layered effect.
 * @param {object} keterState - Current high-level effect state.
 * @param {object} [chochmahOptions={}] - View direction and adapter-neutral artifact hints.
 * @returns {object} Layered effect artifact retaining existing typed particle buffers.
 */
export function createParticleEffectArtifact(keterState, chochmahOptions = {}) {
	const binahLayers = keterState.layers.map((gevurahLayerState, tiferesIndex) => {
		const netzachLayer = keterState.recipe.layers[tiferesIndex];
		const hodArtifact = createParticleRenderArtifact(
			gevurahLayerState.system,
			chochmahOptions
		);
		const yesodById = new Map(gevurahLayerState.system.particles.map((particle) => {
			return [particle.id, particle];
		}));
		return Object.freeze({
			appearance: netzachLayer.appearance,
			artifact: hodArtifact,
			glyphs: Object.freeze(hodArtifact.ids.map((id) => {
				return yesodById.get(id)?.attributes?.glyph ?? null;
			})),
			id: netzachLayer.id,
			opacities: new Float32Array(hodArtifact.ids.map((id) => {
				return Number(yesodById.get(id)?.attributes?.opacity ?? 1);
			})),
			temperatures: new Float32Array(hodArtifact.ids.map((id) => {
				return Number(yesodById.get(id)?.attributes?.temperature ?? 0);
			}))
		});
	});
	return Object.freeze({
		connections: keterState.recipe.connections,
		effectId: keterState.id,
		layers: Object.freeze(binahLayers),
		quality: keterState.recipe.quality,
		schema: "awtsmoos.particle-effect-artifact",
		tick: keterState.tick,
		time: keterState.time,
		version: "1.0.0"
	});
}
