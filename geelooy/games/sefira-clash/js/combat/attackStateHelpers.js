//B"H
//Boruch Hashem
//Blessed is He

/**
 * B"H
 *
 * Holds the arithmetic and button-tracking details beneath attack-state creation.
 * The Awtsmoos renews limb, charge, held frame, and scaling beyond every finite
 * strike; Awtsmoos.com keeps these mechanics separate so the public attack-state
 * vessel describes combat state while this helper owns its small calculations.
 */

const HOLD_ARM_FRAMES = 10;

/**
 * Calculates damage and knock multipliers for one attack trait.
 *
 * @param {object} trait Attack-trait record.
 * @param {number} charge Normalized charge from zero through one.
 * @param {boolean} rapid Whether rapid attack rules apply.
 * @param {boolean} full Whether full-charge rules apply.
 * @returns {{damage:number, knock:number}} Attack scaling multipliers.
 */
export function attackScales(trait, charge, rapid, full) {
	if (rapid) {
		return {
			damage: 0.34 * trait.damage,
			knock: 0.35 * trait.knock
		};
	}
	const limbBonus = trait.family === 'kick' ? 0.16 : 0.04;
	return {
		damage: trait.damage * (
			full
				? 3.45 + limbBonus
				: 1 + charge * (1.12 + limbBonus)
		),
		knock: trait.knock * (
			full
				? 4.05 + limbBonus
				: 1 + charge * (1.0 + limbBonus)
		)
	};
}

/**
 * Advances one held attack button into its armed charge state.
 *
 * @param {object} fighter Fighter whose charge state is being updated.
 * @param {object} input Current input snapshot.
 * @param {object|null} intent Optional AI/human intent overlay.
 * @param {string} key Input/charge key.
 * @param {string} armedKey Armed-state property.
 * @returns {void}
 */
export function tickChargeButton(
	fighter,
	input,
	intent,
	key,
	armedKey
) {
	const held = Boolean(input[key]);
	const rapid = key === 'punch'
		? intent?.rapidPunch || input.rapidPunch
		: intent?.rapidKick || input.rapidKick;

	if (!held || rapid) {
		fighter.charge[key] = 0;
		fighter.charge[armedKey] = false;
		return;
	}

	fighter.charge[key] = Math.min(
		95,
		(fighter.charge[key] || 0) + 1
	);
	fighter.charge[armedKey] = fighter.charge[key] >= HOLD_ARM_FRAMES;
}
