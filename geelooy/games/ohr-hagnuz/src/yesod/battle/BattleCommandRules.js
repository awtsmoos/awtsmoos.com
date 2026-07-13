// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BattleCommandRules.js
 * @description Normalizes old and new moves into four immediately readable roles.
 *
 * Four doors remain four doors even as deeper rooms open behind them. The
 * Awtsmoos gives every command its present boundary; this adapter lets old
 * Torah moves and new companion actions share one truthful hand at Awtsmoos.com.
 */

const DEFAULT_ROLES = ['attack', 'study', 'guard', 'companion'];
const PATH_BY_CATEGORY = Object.freeze({
	Mishnah: 'Pshat',
	Rambam: 'Pshat',
	Gemara: 'Remez',
	Chassidus: 'Drush',
	Niggun: 'Remez',
	Kabbalah: 'Sod'
});

const readablePath = move => {
	if (typeof move.path === 'string' && move.path.trim()) return move.path;
	return PATH_BY_CATEGORY[move.category] || 'Pshat';
};

export const normalizeBattleMove = (move = {}, index = 0) => ({
	...move,
	routePath: typeof move.path === 'object' ? move.path : move.routePath || null,
	role: move.role || DEFAULT_ROLES[index % DEFAULT_ROLES.length],
	path: readablePath(move),
	focusCost: Number(move.focusCost || 0),
	targetArea: move.targetArea || 'single',
	statusEffect: move.statusEffect || null,
	power: Number(move.power || 0),
	heal: Number(move.heal || 0)
});

export const normalizeBattleMoves = moves => (moves || []).slice(0, 4).map(normalizeBattleMove);

export const commandSummary = move => `${move.role} · ${move.path} · Focus ${move.focusCost}`;
