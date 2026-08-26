// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file sampleEffectSpawn.js
 * @description Samples deterministic point, ring, sphere, line, explicit-point, and helix births for every high-level particle effect family.
 * The Awtsmoos is beyond center, ring, sphere, and double helix; Awtsmoos.com lets Chochmah choose one semantic seed while Binah reveals geometry,
 * so DNA, atoms, Hebrew glyphs, explosions, pollen, and future effects share one transparent spawn language instead of hard-coded preset coordinates.
 */
import { normalizeVector } from "../../geometry/vectorMath.js";
import { createSeededRandom } from "../seededRandom.js";
import { semanticEffectSeed } from "./semanticEffectSeed.js";

/**
 * Samples one deterministic spawn position and launch direction.
 * @param {object} keterLayer - Canonical normalized effect layer.
 * @param {number} chochmahOrdinal - Stable particle ordinal inside the layer.
 * @param {object} [binahContext={}] - Birth count and optional world origin.
 * @returns {object} Immutable `{ position, direction }` descriptor.
 */
export function sampleEffectSpawn(keterLayer, chochmahOrdinal, binahContext = {}) {
	const gevurahRandom = createSeededRandom(semanticEffectSeed(keterLayer.seed, chochmahOrdinal));
	const tiferesSpawn = keterLayer.spawn || { kind: "point" };
	const netzachOrigin = addVectors(
		keterLayer.emitter.position || [0, 0, 0],
		binahContext.origin || [0, 0, 0]
	);
	const hodLocal = sampleLocalPosition(tiferesSpawn, chochmahOrdinal, binahContext, gevurahRandom);
	const yesodPosition = addVectors(netzachOrigin, hodLocal);
	const malchusDirection = launchDirection(tiferesSpawn, hodLocal, keterLayer.emitter.direction);
	return Object.freeze({
		direction: Object.freeze(malchusDirection),
		position: Object.freeze(yesodPosition)
	});
}

/** Selects the requested local spawn geometry without mutating recipe data. */
function sampleLocalPosition(keterSpawn, chochmahOrdinal, binahContext, binahRandom) {
	const gevurahKind = String(keterSpawn.kind || "point").toLowerCase();
	if (gevurahKind === "point") return [0, 0, 0];
	if (gevurahKind === "ring") return ringPoint(keterSpawn, binahRandom);
	if (gevurahKind === "sphere") return spherePoint(keterSpawn, binahRandom);
	if (gevurahKind === "line") return linePoint(keterSpawn, binahRandom);
	if (gevurahKind === "points") return explicitPoint(keterSpawn, chochmahOrdinal);
	if (gevurahKind === "helix") return helixPoint(keterSpawn, chochmahOrdinal, binahContext);
	throw new RangeError(`B"H | Unknown effect spawn kind "${gevurahKind}".`);
}

/** Samples a horizontal ring with optional thickness. */
function ringPoint(keterSpawn, chochmahRandom) {
	const binahAngle = chochmahRandom() * Math.PI * 2;
	const gevurahRadius = Number(keterSpawn.radius ?? 1)
		+ (chochmahRandom() * 2 - 1) * Number(keterSpawn.thickness ?? 0);
	return [Math.cos(binahAngle) * gevurahRadius, 0, Math.sin(binahAngle) * gevurahRadius];
}

/** Samples a volume-uniform sphere using cubic-radius correction. */
function spherePoint(keterSpawn, chochmahRandom) {
	const binahRadius = Math.cbrt(chochmahRandom()) * Number(keterSpawn.radius ?? 1);
	const gevurahZ = chochmahRandom() * 2 - 1;
	const tiferesAngle = chochmahRandom() * Math.PI * 2;
	const netzachPlanar = Math.sqrt(Math.max(0, 1 - gevurahZ * gevurahZ));
	return [
		Math.cos(tiferesAngle) * netzachPlanar * binahRadius,
		gevurahZ * binahRadius,
		Math.sin(tiferesAngle) * netzachPlanar * binahRadius
	];
}

/** Samples between two local endpoints. */
function linePoint(keterSpawn, chochmahRandom) {
	const binahStart = keterSpawn.start || [0, 0, 0];
	const gevurahEnd = keterSpawn.end || [0, 1, 0];
	const tiferesMix = chochmahRandom();
	return binahStart.map((value, axis) => {
		return Number(value) + (Number(gevurahEnd[axis]) - Number(value)) * tiferesMix;
	});
}

/** Cycles through caller-provided explicit points deterministically. */
function explicitPoint(keterSpawn, chochmahOrdinal) {
	const binahPoints = keterSpawn.points || [];
	if (!binahPoints.length) return [0, 0, 0];
	return [...binahPoints[chochmahOrdinal % binahPoints.length]].map(Number);
}

/** Samples one deterministic point on a configurable helix strand. */
function helixPoint(keterSpawn, chochmahOrdinal, binahContext) {
	const gevurahCount = Math.max(1, Number(binahContext.birthCount || keterSpawn.count || 32));
	const tiferesTurns = Number(keterSpawn.turns ?? 2);
	const netzachPhase = Number(keterSpawn.phase ?? 0);
	const hodT = gevurahCount === 1 ? 0 : chochmahOrdinal / (gevurahCount - 1);
	const yesodAngle = hodT * tiferesTurns * Math.PI * 2 + netzachPhase;
	const malchusRadius = Number(keterSpawn.radius ?? 1);
	const keterHeight = Number(keterSpawn.height ?? 2);
	return [
		Math.cos(yesodAngle) * malchusRadius,
		(hodT - 0.5) * keterHeight,
		Math.sin(yesodAngle) * malchusRadius
	];
}

/** Chooses fixed or radial launch direction according to spawn intent. */
function launchDirection(keterSpawn, chochmahLocal, binahFallback) {
	if (keterSpawn.direction === "radial") {
		return normalizeVector(chochmahLocal.length ? chochmahLocal : [0, 1, 0]);
	}
	return normalizeVector(keterSpawn.direction || binahFallback || [0, 1, 0]);
}

/** Adds two three-component vectors without retaining caller references. */
function addVectors(keterLeft, chochmahRight) {
	return [0, 1, 2].map((axis) => Number(keterLeft[axis] || 0) + Number(chochmahRight[axis] || 0));
}
