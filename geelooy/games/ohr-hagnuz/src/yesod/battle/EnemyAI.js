/**
 * B"H
 * @module EnemyAI
 * @description Readable enemy intent for deterministic-feeling turn battles.
 *
 * The opposing voice is not a random subtraction. It announces a form, gathers
 * force, and answers according to its level and the turn already lived.
 */
const DEFAULT_ACTIONS = [
	{ name: 'Questioning Glare', modifier: 0 },
	{ name: 'Tangled Argument', modifier: 2 },
	{ name: 'Klipah Pressure', modifier: 4 }
];

const encounterAction = (enemy, turn) => {
	const moves = Array.isArray(enemy?.moves) ? enemy.moves : [];
	const selected = moves[turn % Math.max(1, moves.length)];
	if (!selected) return DEFAULT_ACTIONS[turn % DEFAULT_ACTIONS.length];
	return {
		name: selected.name || selected.label || 'Enemy Reply',
		modifier: Number(selected.power || selected.damage || 0)
	};
};

export const chooseEnemyAction = (enemy, turn = 0) => {
	const selected = encounterAction(enemy, turn);
	const level = Math.max(1, Number(enemy?.level || 1));
	const base = 5 + Math.floor(level * 1.5);
	return {
		name: selected.name,
		rawDamage: Math.max(1, base + selected.modifier + Math.floor(Math.random() * 5))
	};
};
