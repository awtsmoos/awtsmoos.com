// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file createEffectEmitterDeclaration.js
 * @description Translates one canonical effect-layer birth into the mature emitter while preserving immutable appearance and thermal birth channels.
 * The Awtsmoos renews every birth before size, glyph, form, or temperature can claim an independent root; Awtsmoos.com lets Yesod carry those origins
 * into the proven particle engine so later lifecycle curves reveal change from truth rather than compounding yesterday's already-transformed appearance.
 */
import { createSeededRandom } from "../seededRandom.js";
import { sampleEffectRange } from "./effectValueRange.js";
import { sampleEffectGlyph } from "./sampleEffectGlyph.js";
import { sampleEffectSpawn } from "./sampleEffectSpawn.js";
import { semanticEffectSeed } from "./semanticEffectSeed.js";

/**
 * Creates one deterministic `emitParticles` declaration for a stable birth ordinal.
 * @param {object} keterLayer - Canonical effect layer.
 * @param {number} chochmahOrdinal - Stable layer birth ordinal.
 * @param {object} [binahContext={}] - Birth count, origin, and world context.
 * @returns {object} Existing emitter-compatible declaration with immutable birth metadata.
 */
export function createEffectEmitterDeclaration(keterLayer, chochmahOrdinal, binahContext = {}) {
	const gevurahSeed = semanticEffectSeed(keterLayer.seed, `birth:${chochmahOrdinal}`);
	const tiferesRandom = createSeededRandom(gevurahSeed);
	const netzachSpawn = sampleEffectSpawn(keterLayer, chochmahOrdinal, binahContext);
	const hodAppearance = keterLayer.appearance || {};
	const yesodSize = sampleEffectRange(keterLayer.emitter.size, tiferesRandom());
	const malchusGlyph = sampleEffectGlyph(hodAppearance, chochmahOrdinal, tiferesRandom);
	const keterBaseColor = colorArray(hodAppearance.color ?? keterLayer.emitter.attributes?.baseColor);
	const chochmahTemperature = finite(
		keterLayer.emitter.attributes?.temperature ?? hodAppearance.temperature,
		0
	);
	return {
		attributes: {
			...(keterLayer.emitter.attributes || {}),
			appearanceKind: hodAppearance.kind || "sprite",
			baseColor: keterBaseColor,
			baseForm: hodAppearance.form ?? null,
			baseGlyph: malchusGlyph,
			baseSize: yesodSize,
			baseTemperature: chochmahTemperature,
			color: keterBaseColor,
			form: hodAppearance.form ?? null,
			glyph: malchusGlyph,
			layerId: keterLayer.id,
			orientation: hodAppearance.orientation || "camera",
			seed: gevurahSeed,
			temperature: chochmahTemperature
		},
		count: 1,
		direction: netzachSpawn.direction,
		lifetime: sampleEffectRange(keterLayer.emitter.lifetime, tiferesRandom()),
		lifetimeVariation: 0,
		mass: sampleEffectRange(keterLayer.emitter.mass, tiferesRandom()),
		position: netzachSpawn.position,
		seed: gevurahSeed,
		size: yesodSize,
		speed: sampleEffectRange(keterLayer.emitter.speed, tiferesRandom()),
		speedVariation: 0,
		spread: keterLayer.emitter.spread
	};
}

/** Returns a detached RGBA array suitable for immutable birth evidence. */
function colorArray(keterValue) {
	const chochmahColor = Array.isArray(keterValue) ? [...keterValue] : [1, 1, 1, 1];
	while (chochmahColor.length < 4) chochmahColor.push(1);
	return chochmahColor.slice(0, 4).map(Number);
}

/** Returns finite numeric input or fallback. */
function finite(keterValue, chochmahFallback) {
	const binahNumber = Number(keterValue);
	return Number.isFinite(binahNumber) ? binahNumber : Number(chochmahFallback);
}
