/**
 * B"H
 * @module LegacyStateProxies
 * @description Mutable compatibility views over the canonical State.
 */
import { State } from '../../binah/State.js';

const statMap = { xp: 'exp', xpNeeded: 'nextExp', sparkPoints: 'sparks' };
const sefirahMap = { CHOCHMAH: 'chochmah', BINAH: 'binah', DAAT: 'daat' };

export const legacyHeroStats = new Proxy({}, {
	get: (_target, key) => State.Stats[statMap[key] || key],
	set: (_target, key, value) => {
		State.Stats[statMap[key] || key] = value;
		return true;
	},
	ownKeys: () => ['light', 'maxLight', 'level', 'xp', 'xpNeeded', 'sparkPoints'],
	getOwnPropertyDescriptor: () => ({ enumerable: true, configurable: true })
});

export const legacyEtzChaim = new Proxy({}, {
	get: (_target, key) => {
		if (sefirahMap[key]) return State.Sefiros[sefirahMap[key]];
		return State.WorldState.legacyEtzChaim[key] || 0;
	},
	set: (_target, key, value) => {
		if (sefirahMap[key]) State.Sefiros[sefirahMap[key]] = value;
		else State.WorldState.legacyEtzChaim[key] = value;
		return true;
	},
	ownKeys: () => ['CHOCHMAH', 'BINAH', 'DAAT', 'CHESED', 'GEVURAH', 'TIFERET', 'NETZACH', 'HOD', 'YESOD'],
	getOwnPropertyDescriptor: () => ({ enumerable: true, configurable: true })
});
