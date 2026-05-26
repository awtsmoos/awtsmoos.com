
// B"H
// js/workers/combat/utils.js

export function getMusagInstance(state, source) {
	const base = state.db.musagim[source.id];
	if (!base) {
		console.error(`Musag ID not found: ${source.id}`);
		return null;
	}
	const level = source.level;
	const stats = {
		hp: Math.floor(base.baseStats.hp * (1 + level / 20)),
		attack: Math.floor(base.baseStats.attack * (1 + level / 20)),
		defense: Math.floor(base.baseStats.defense * (1 + level / 20)),
		diligence: Math.floor(base.baseStats.diligence * (1 + level / 20)),
	};
	return {
		...base,
		level,
		id: source.id,
		maxHp: stats.hp,
		currentHp: source.currentHp !== undefined ? source.currentHp : stats.hp,
		maxKavanah: 20 + Math.floor(level / 2),
		currentKavanah: source.currentKavanah !== undefined ? source.currentKavanah : (20 + Math.floor(level / 2)),
		stats
	};
}

export function getBattleUIPayload(battleState, withMenu = false, buttons = [], state = null) {
	const payload = {
		log: battleState.log,
		awaitingConfirm: battleState.awaitingConfirm,
		player: {
			name: battleState.player.name,
			level: battleState.player.level,
			emoji: battleState.player.emoji,
			hpPercent: (battleState.player.currentHp / battleState.player.maxHp) * 100,
			kavanahPercent: (battleState.player.currentKavanah / battleState.player.maxKavanah) * 100
		},
		opponent: {
			name: battleState.opponent.name,
			level: battleState.opponent.level,
			emoji: battleState.opponent.emoji,
			hpPercent: (battleState.opponent.currentHp / battleState.opponent.maxHp) * 100
		}
	};
	if (withMenu) {
        // Inject Ultimate Button if Gate of Redemption is unlocked
        if (state && state.gateEffects && state.gateEffects.combat && state.gateEffects.combat.hasUltimate) {
            buttons.unshift({ action: 'ultimate', text: '🏆 GEULA 🏆', className: 'ultimate-battle-button' });
        }
		payload.menu = { buttons };
		payload.log = null;
	}
	return payload;
}
