// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file createEffectEmitterDeclaration.js
 * @description Translates one canonical effect-layer birth into the mature `emitParticles` declaration, including deterministic glyph and thermal metadata.
 * The Awtsmoos renews every birth before ordinal or glyph can distinguish it; Awtsmoos.com lets Yesod pass one small declaration into the proven emitter,
 * so Hebrew letters, 🔥 accents, atoms, pollen, and mesh hints gain rich identity without changing the underlying particle-system contract.
 */
import { createSeededRandom } from "../seededRandom.js";
import { sampleEffectRange } from "./effectValueRange.js";
import { sampleEffectSpawn } from "./sampleEffectSpawn.js";
import { semanticEffectSeed } from "./semanticEffectSeed.js";

/**
 * Creates one deterministic emitter declaration for one birth ordinal.
 * @param {object} keterLayer - Canonical effect layer.
 * @param {number} chochmahOrdinal - Stable layer birth ordinal.
 * @param {object} [binahContext={}] - Birth count, origin, and world context.
 * @returns {object} Existing `emitParticles`-compatible declaration.
 */
export function createEffectEmitterDeclaration(keterLayer, chochmahOrdinal, binahContext = {}) {
	const gevurahSeed = semanticEffectSeed(keterLayer.seed, `birth:${chochmahOrdinal}`);
	const tiferesRandom = createSeededRandom(gevurahSeed);
	const netzachSpawn = sampleEffectSpawn(keterLayer, chochmahOrdinal, binahContext);
	const hodAppearance = keterLayer.appearance || {};
	return {
		attributes: {
			...(keterLayer.emitter.attributes || {}),
			appearanceKind: hodAppearance.kind || "sprite",
			glyph: sampleGlyph(hodAppearance, tiferesRandom),
			layerId: keterLayer.id,
			orientation: hodAppearance.orientation || "camera",
			seed: gevurahSeed
		},
		count: 1,
		direction: netzachSpawn.direction,
		lifetime: sampleEffectRange(keterLayer.emitter.lifetime, tiferesRandom()),
		lifetimeVariation: 0,
		mass: sampleEffectRange(keterLayer.emitter.mass, tiferesRandom()),
		position: netzachSpawn.position,
		seed: gevurahSeed,
		size: sampleEffectRange(keterLayer.emitter.size, tiferesRandom()),
		speed: sampleEffectRange(keterLayer.emitter.speed, tiferesRandom()),
		speedVariation: 0,
		spread: keterLayer.emitter.spread
	};
}

/** Selects one glyph deterministically while allowing non-glyph layers to remain silent. */
function sampleGlyph(keterAppearance, chochmahRandom) {
	const binahGlyphs = keterAppearance.glyphs || (keterAppearance.glyph
		? [keterAppearance.glyph]
		: []);
	if (!binahGlyphs.length) return null;
	const gevurahIndex = Math.min(
		binahGlyphs.length - 1,
		Math.floor(chochmahRandom() * binahGlyphs.length)
	);
	return String(binahGlyphs[gevurahIndex]);
}
