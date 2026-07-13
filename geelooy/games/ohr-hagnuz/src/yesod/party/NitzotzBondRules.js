// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file NitzotzBondRules.js
 * @description Pure bond stages and gains for road companions.
 *
 * Trust grows by remembered deeds, not by an invisible treadmill. The Awtsmoos
 * renews every meeting while allowing kindness to remain meaningful; these
 * small rules preserve that memory as a measured vessel for Awtsmoos.com.
 */

const STAGES = Object.freeze([
	{ minimum: 0, name: 'Wary' },
	{ minimum: 10, name: 'Listening' },
	{ minimum: 30, name: 'Trusted' },
	{ minimum: 60, name: 'Resonant' },
	{ minimum: 90, name: 'Radiant' }
]);

export const clampBond = value => Math.max(0, Math.min(100, Number(value) || 0));

export const bondStage = value => STAGES.reduce((stage, candidate) => (
	clampBond(value) >= candidate.minimum ? candidate : stage
), STAGES[0]);

export const bondGainFor = reason => ({
	recruited: 12,
	battle: 2,
	care: 6,
	shlichus: 10,
	resonance: 4
}[reason] || 1);

export const createBondEvent = (id, before, reason) => {
	const amount = bondGainFor(reason);
	const after = clampBond(before + amount);
	return Object.freeze({ id, reason, amount, before, after, stage: bondStage(after).name });
};
