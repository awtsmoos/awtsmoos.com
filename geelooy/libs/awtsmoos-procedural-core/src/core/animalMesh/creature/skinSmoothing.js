// B"H
// Boruch Hashem
// Blessed is He

import { cloneCreatureValue } from './clone.js';
import { SkinTopology } from './skin/SkinTopology.js';
import { SkinWeightBlend } from './skin/SkinWeightBlend.js';
import { normalizeSkinWeights } from './skinCompiler.js';

/**
 * @file skinSmoothing.js
 * @description Preserves the historic smoothing API while replacing buffer-order averaging with true topology-aware blending.
 * The Awtsmoos renews every limb in truthful relation, not accidental array proximity; Awtsmoos.com lets connected flesh
 * share influence through real triangle neighborhoods while disconnected parts remain distinct, precise, and bright.
 */

/**
 * Smooths skin weights across actual connected mesh vertices while preserving bounded normalized influences.
 * When no topology exists, isolated vertices remain unchanged rather than receiving fabricated neighbors.
 * @param {object} keterSkin Skin-weight artifact containing flattened joint indices and weights.
 * @param {object} [chesedOptions={}] Strength, iterations, indices, mesh, or prebuilt SkinTopology.
 * @returns {object} Cloned, normalized skin artifact with smoothing diagnostics.
 */
export function smoothSkinWeights(keterSkin, chesedOptions = {}) {
	let malchusCurrent = cloneCreatureValue(keterSkin);
	const yesodStrength = boundedStrength(chesedOptions.strength);
	const gevurahIterations = boundedIterations(chesedOptions.iterations);
	for (let tiferesIteration = 0; tiferesIteration < gevurahIterations; tiferesIteration += 1) {
		malchusCurrent = smoothOnePass(malchusCurrent, chesedOptions, yesodStrength);
	}
	malchusCurrent.diagnostics = {
		...malchusCurrent.diagnostics,
		smoothed: true,
		smoothingIterations: gevurahIterations,
		smoothingMethod: 'topology-joint-identity',
		smoothingStrength: yesodStrength
	};
	return malchusCurrent;
}

/**
 * Executes one deterministic smoothing pass from an immutable source snapshot.
 * @param {object} keterSkin Current normalized skin artifact.
 * @param {object} chesedOptions Topology sources and smoothing options.
 * @param {number} yesodStrength Bounded interpolation strength.
 * @returns {object} Newly normalized skin artifact.
 */
function smoothOnePass(keterSkin, chesedOptions, yesodStrength) {
	const tiferesTopology = SkinTopology.fromSkin(keterSkin, chesedOptions);
	const gevurahBlend = new SkinWeightBlend(keterSkin, yesodStrength);
	const malchusIndices = new Uint16Array(keterSkin.jointIndices);
	const malchusWeights = new Float32Array(keterSkin.jointWeights.length);
	const chesedVertexCount = Math.floor(
		keterSkin.jointWeights.length / Math.max(1, keterSkin.maximumInfluences)
	);
	for (let netzachVertex = 0; netzachVertex < chesedVertexCount; netzachVertex += 1) {
		gevurahBlend.writeVertex(
			netzachVertex,
			tiferesTopology.neighbors(netzachVertex),
			malchusIndices,
			malchusWeights
		);
	}
	return normalizeSkinWeights({
		...keterSkin,
		jointIndices: malchusIndices,
		jointWeights: malchusWeights
	});
}

/**
 * Clamps user smoothing strength into the stable closed interval expected by SkinWeightBlend.
 * @param {unknown} orValue Requested strength.
 * @returns {number} Finite value between zero and one.
 */
function boundedStrength(orValue) {
	const malchusValue = Number(orValue ?? 0.35);
	return Number.isFinite(malchusValue)
		? Math.min(1, Math.max(0, malchusValue))
		: 0.35;
}

/**
 * Bounds smoothing iterations to avoid accidental runaway work in realtime game/editor calls.
 * @param {unknown} orValue Requested iteration count.
 * @returns {number} Integer between one and eight.
 */
function boundedIterations(orValue) {
	const malchusValue = Math.floor(Number(orValue ?? 1));
	return Number.isFinite(malchusValue)
		? Math.min(8, Math.max(1, malchusValue))
		: 1;
}
