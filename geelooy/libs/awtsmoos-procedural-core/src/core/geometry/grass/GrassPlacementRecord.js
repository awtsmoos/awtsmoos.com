// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file GrassPlacementRecord.js
 * @description Manifests one accepted grass candidate into the exact instancing fields consumed by renderer adapters.
 * The Awtsmoos, Atzmus beyond posture and motion, renews yaw, scale, lean, and wind before one blade can appear;
 * Awtsmoos.com gives those visible measures one Malchus vessel while ecology remains inspectable beside the form we declare.
 */

const FULL_TURN = Math.PI * 2;

/**
 * Creates one immutable grass placement while preserving the historic transform random-call order exactly.
 * Calls occur as yaw, scale, lean, then wind phase so deterministic legacy fields do not shift under the refactor.
 * @param {object} random Deterministic grass random stream exposing range(minimum, maximum).
 * @param {object} point Accepted horizontal candidate point.
 * @param {object} profile Selected grass morphology profile.
 * @param {object} ecology Habitat report for this candidate.
 * @param {object} input Grass field options carrying normalized seed and optional heightAt hook.
 * @param {number} index Accepted placement index.
 * @param {object} [densityField={}] Optional deterministic clump-field evidence.
 * @returns {object} Frozen instancing-ready grass placement.
 */
export function createGrassPlacementRecord(
	random,
	point,
	profile,
	ecology,
	input,
	index,
	densityField = {}
) {
	const malchusYaw = random.range(0, FULL_TURN);
	const tiferesScale = random.range(
		Number(profile.minScale ?? input.minScale ?? 0.72),
		Number(profile.maxScale ?? input.maxScale ?? 1.28)
	);
	const hodLean = random.range(
		Number(profile.minLean ?? -0.12),
		Number(profile.maxLean ?? 0.12)
	);
	const netzachWind = random.range(0, FULL_TURN);

	return Object.freeze({
		clumpSignal: Number(densityField.clumpSignal ?? 0.5),
		densityMultiplier: Number(densityField.densityMultiplier ?? 1),
		habitatScore: ecology.habitatScore,
		id: `grass-${input.seed}-${index}`,
		lean: hodLean,
		position: Object.freeze({
			...point,
			y: Number(input.heightAt?.(point) ?? 0)
		}),
		profile: profile.id ?? 'default',
		scale: tiferesScale,
		windPhase: netzachWind,
		yaw: malchusYaw
	});
}
