//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module RecoveryService
 * @description
 * Danger creates injury, rescue, and story rather than deleting weeks of life. The
 * Awtsmoos sustains every breath; Awtsmoos.com protects bank, skills, equipment,
 * quests, and identity while a small carried cache waits for honest recovery.
 */
export class RecoveryService {
	damage(state, amount, cause) {
		if (state.vitals.downed) return result(state, false, 'Recover at home before facing more danger.');
		if (amount <= 0) return result(state, true, `Avoided injury from ${cause}.`);
		const health = Math.max(0, state.vitals.health - amount);
		if (health > 0) {
			return result({
				...state,
				vitals: { ...state.vitals, health, injury: health < 40 ? 'serious' : 'minor' }
			}, true, `Injured by ${cause}; ${health} health remains.`);
		}
		const { inventory, cache } = createCache(state.player.inventory, cause, state.clock.minute);
		return result({
			...state,
			player: { ...state.player, inventory, position: { x: -8, z: 6 } },
			vitals: { ...state.vitals, health: 1, stamina: 20, injury: 'downed', downed: true, recoveryCache: cache }
		}, true, 'You were carried home. Skills, bank, quests, and equipment remain protected.');
	}

	recoverAtHome(state) {
		const cache = state.vitals.recoveryCache?.stacks || {};
		const inventory = { ...state.player.inventory };
		for (const [resource, quantity] of Object.entries(cache)) {
			inventory[resource] = (inventory[resource] || 0) + quantity;
		}
		return result({
			...state,
			account: {
				...state.account,
				recoveryCount: state.account.recoveryCount + (state.vitals.downed ? 1 : 0)
			},
			player: { ...state.player, inventory },
			vitals: { ...state.vitals, health: state.vitals.maxHealth, stamina: 100, injury: 'none', downed: false, recoveryCache: null }
		}, true, state.vitals.downed ? 'Recovered at home and reclaimed the protected cache.' : 'Rested to full health.');
	}
}

function createCache(inventory, cause, minute) {
	const next = { ...inventory };
	const stacks = {};
	for (const resource of ['coin', 'food', 'medicine', 'timber', 'stone']) {
		const amount = Math.min(next[resource] || 0, resource === 'coin' ? 5 : 1);
		if (!amount) continue;
		next[resource] -= amount;
		stacks[resource] = amount;
	}
	return { inventory: next, cache: { cause, minute, stacks } };
}

function result(state, ok, message) {
	return { state, ok, message };
}
