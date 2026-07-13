//B"H
// Boruch Hashem
// Blessed is He
/**
 * The Sefiros become build paths whose meetings reveal new harmony. The Awtsmoos
 * is beyond every path while Awtsmoos.com displays their finite cooperation.
 */
import { BLESSINGS } from '../config/economyConfig.js';
import { blessingSynergies } from './GameRules.js';

export class BlessingSystem {
	choices(state, major = false) {
		const ordinary = BLESSINGS.filter(item => !item.rare);
		const seed = state.worldIndex * 7 + state.levelIndex * 3 + totalLevels(state);
		const choices = [0, 1, 2].map(offset => ordinary[(seed + offset * 2) % ordinary.length]);
		if (major && keterEligible(state)) {
			choices[2] = BLESSINGS.find(item => item.id === 'keter');
		}
		return choices.map(item => ({
			...item,
			level: (state.blessingLevels[item.id] || 0) + 1,
			description: blessingDescription(item.id, (state.blessingLevels[item.id] || 0) + 1)
		}));
	}

	apply(state, blessingId) {
		state.blessingLevels[blessingId] = (state.blessingLevels[blessingId] || 0) + 1;
		const level = state.blessingLevels[blessingId];
		if (blessingId === 'chesed') {
			state.troops = Math.min(250, state.troops + 6 + level * 2);
			state.positiveGateBoost += 0.08;
		} else if (blessingId === 'gevurah') {
			state.damageMultiplier *= 1.18;
			state.criticalChance = Math.min(0.5, state.criticalChance + 0.05);
		} else if (blessingId === 'tiferet') {
			state.health = Math.min(state.maxHealth, state.health + 18);
			state.fireRateMultiplier *= 1.06;
		} else if (blessingId === 'netzach') {
			state.prutahValueMultiplier *= 1.08;
			state.magnetRadius += 0.25;
		} else if (blessingId === 'hod') {
			state.sideShots = Math.min(3, state.sideShots + Number(level % 2 === 0));
			state.piercing = Math.min(4, state.piercing + Number(level % 2 === 1));
		} else if (blessingId === 'yesod') {
			state.shield += 1;
			state.maxShield += 1;
		} else if (blessingId === 'malchut') {
			state.troops = Math.min(250, state.troops + 4);
			state.abilityCharge = Math.min(100, state.abilityCharge + 25);
		} else if (blessingId === 'keter') {
			state.relics.push('crown');
		}
		state.synergies = blessingSynergies(state.blessingLevels);
		this.applySynergyRewards(state);
		state.pushEvent('blessing', { id: blessingId, level, synergies: state.synergies });
	}

	applySynergyRewards(state) {
		if (state.synergies.includes('harmonized-soul')) {
			state.health = Math.min(state.maxHealth, state.health + 10);
		}
		if (state.synergies.includes('shielded-momentum')) {
			state.maxShield = Math.max(state.maxShield, 2);
		}
	}
}

function keterEligible(state) {
	return state.worldIndex >= 2 && totalLevels(state) >= 5 && !state.relics.includes('crown');
}

function totalLevels(state) {
	return Object.values(state.blessingLevels).reduce((sum, level) => sum + level, 0);
}

function blessingDescription(id, level) {
	const text = {
		chesed: 'More sparks and stronger positive gates.',
		gevurah: 'Higher damage and critical chance.',
		tiferet: 'Healing and balanced fire cadence.',
		netzach: 'Greater streak value and magnetism.',
		hod: 'Piercing and wider projectile patterns.',
		yesod: 'Shield capacity and recovery.',
		malchut: 'Formation growth and command charge.',
		keter: 'One resurrection during this run.'
	};
	return `Level ${level}: ${text[id]}`;
}
