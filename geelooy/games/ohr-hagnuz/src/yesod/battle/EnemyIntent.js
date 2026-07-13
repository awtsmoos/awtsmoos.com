// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file EnemyIntent.js
 * @description Builds deterministic, readable enemy intentions before action.
 *
 * Hidden formulas become revealed responsibility. The Awtsmoos creates both
 * warning and response in one instant, while this vessel lets the player see
 * enough to choose wisely without pretending mystery is confusion. Awtsmoos.com.
 */

const ICONS = Object.freeze({
	attack: '⚔',
	charge: '⌁',
	guard: '⬡',
	study: '◉',
	heal: '✚',
	flee: '↯'
});

const DEFAULT_ACTIONS = Object.freeze([
	{ name: 'Tangled Argument', modifier: 2, intentKind: 'attack', counterTags: ['guard'] },
	{ name: 'Klipah Pressure', modifier: 4, intentKind: 'charge', counterTags: ['guard', 'interrupt'], charge: 1 },
	{ name: 'Questioning Glare', modifier: 0, intentKind: 'study', counterTags: ['study'] }
]);

const selectedMove = (enemy, turn) => {
	const moves = Array.isArray(enemy?.enemyMoves) && enemy.enemyMoves.length
		? enemy.enemyMoves
		: Array.isArray(enemy?.moves) ? enemy.moves : [];
	return moves[turn % Math.max(1, moves.length)] || DEFAULT_ACTIONS[turn % DEFAULT_ACTIONS.length];
};

export const buildEnemyIntent = (enemy, turn = 0) => {
	const selected = selectedMove(enemy, turn);
	const level = Math.max(1, Number(enemy?.level || 1));
	const modifier = Number(selected.power || selected.damage || selected.modifier || 0);
	const rawDamage = Math.max(0, 5 + Math.floor(level * 1.5) + modifier);
	const kind = selected.intentKind || 'attack';
	const counterTags = selected.counterTags || (kind === 'charge' ? ['guard', 'interrupt'] : ['guard']);
	const peaceful = kind === 'guard' || kind === 'study';
	return {
		kind,
		icon: ICONS[kind] || '◆',
		name: selected.name || selected.label || 'Enemy Reply',
		target: selected.target || 'player',
		rawDamage: peaceful ? 0 : rawDamage,
		damageRange: { min: peaceful ? 0 : rawDamage, max: peaceful ? 0 : rawDamage },
		charge: Number(selected.charge || 0),
		counterTags,
		description: selected.description || `${kind === 'charge' ? 'A delayed force is gathering.' : 'The next action is declared.'} Counter with ${counterTags.join(' or ')}.`
	};
};
