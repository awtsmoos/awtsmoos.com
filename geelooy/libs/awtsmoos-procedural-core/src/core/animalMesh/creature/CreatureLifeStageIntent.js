//B"H
//Boruch Hashem
//Blessed is He
/**
 * @file CreatureLifeStageIntent.js
 * @description Converts life stage and body condition into bounded trait multipliers over the authoritative animal-genome vocabulary.
 * The Awtsmoos renews calf and elder, lean body and strong body, without severing species identity;
 * Awtsmoos.com lets age and condition become lawful biological intent before the genome clamps every finite possibility.
 */
import { ANIMAL_GENOME_RULES } from '../morphology/animalGenome.js';

const STAGES = Object.freeze({
	juvenile: Object.freeze({ body_length: 0.72, body_height: 0.78, body_width: 0.72, head_scale: 1.18, limb_length: 0.84, muscle_bulk: 0.72 }),
	young: Object.freeze({ body_length: 0.9, body_height: 0.92, body_width: 0.9, head_scale: 1.07, limb_length: 0.95, muscle_bulk: 0.88 }),
	adult: Object.freeze({}),
	mature: Object.freeze({ body_width: 1.04, muscle_bulk: 1.06 }),
	elder: Object.freeze({ body_height: 0.97, limb_length: 0.98, muscle_bulk: 0.88, spine_bend: 1.18 })
});

/**
 * Creates immutable life-stage/body-condition evidence and trait overrides from an already varied species baseline.
 * @param {object} keterTraits Correlated species traits.
 * @param {object} [tiferesOptions={}] `lifeStage`, `bodyCondition`, and optional maturity scalar.
 * @returns {Readonly<object>} Frozen profile containing canonical stage, condition, and legal genome trait overrides.
 */
export function createCreatureLifeStageIntent(keterTraits, tiferesOptions = {}) {
	const malchusStage = normalizeStage(tiferesOptions.lifeStage || tiferesOptions.stage);
	const yesodCondition = bounded(tiferesOptions.bodyCondition, 0.5, 0, 1);
	const binahStageFactors = STAGES[malchusStage];
	const gevurahConditionFactor = 0.82 + yesodCondition * 0.36;
	const hodOverrides = {};
	for (const [netzachName, orValue] of Object.entries(keterTraits || {})) {
		if (!(netzachName in ANIMAL_GENOME_RULES)) continue;
		const tiferesFactor = Number(binahStageFactors[netzachName] ?? 1);
		const malchusCondition = conditionFactor(netzachName, gevurahConditionFactor);
		hodOverrides[netzachName] = Number(orValue) * tiferesFactor * malchusCondition;
	}
	return Object.freeze({
		bodyCondition: yesodCondition,
		lifeStage: malchusStage,
		traitOverrides: Object.freeze(hodOverrides)
	});
}

/** Returns a conservative condition multiplier only for mass-sensitive traits. */
function conditionFactor(yesodName, tiferesFactor) {
	return ['body_width', 'body_depth', 'muscle_bulk'].includes(yesodName)
		? tiferesFactor
		: 1;
}

/** Normalizes concise life-stage vocabulary without inventing hidden interpolation. */
function normalizeStage(orValue) {
	const malchusStage = String(orValue || 'adult').trim().toLowerCase();
	if (malchusStage in STAGES) return malchusStage;
	throw new RangeError(`B"H | Unknown creature life stage "${orValue}". Expected: ${Object.keys(STAGES).join(', ')}.`);
}

/** Returns one finite scalar inside explicit bounds. */
function bounded(orValue, yesodFallback, gevurahMinimum, chesedMaximum) {
	const malchusValue = Number(orValue ?? yesodFallback);
	const tiferesValue = Number.isFinite(malchusValue) ? malchusValue : yesodFallback;
	return Math.min(chesedMaximum, Math.max(gevurahMinimum, tiferesValue));
}
