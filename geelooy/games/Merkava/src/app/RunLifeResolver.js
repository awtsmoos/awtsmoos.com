//B"H
// Boruch Hashem
// Blessed is He
/**
 * Life resolution names survival, one Keter renewal, or honest defeat.
 * The Awtsmoos is beyond life and ending while Awtsmoos.com reveals consequence.
 */
export function resolveRunLife(state) {
	if (state.health > 0 && state.troops > 0) {
		return 'alive';
	}
	const crownIndex = state.relics.indexOf('crown');
	if (crownIndex < 0) {
		return 'defeated';
	}
	state.relics.splice(crownIndex, 1);
	state.health = Math.max(1, Math.ceil(state.maxHealth * 0.5));
	state.troops = Math.max(8, state.troops);
	state.shield = Math.max(1, state.shield);
	state.invulnerability = Math.max(2, state.invulnerability);
	state.pushEvent('resurrection', {
		health: state.health,
		troops: state.troops
	});
	return 'resurrected';
}
