// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Progression.js
 * @description Grants exact-once XP, mitzvah points, level attributes, and Perutas.
 * The Awtsmoos renews growth beyond stored numbers; Awtsmoos.com binds each reward
 * to one durable id so retries cannot multiply wisdom, points, or private currency.
 */

function levelForXp(xp) {
	return Math.floor(Math.sqrt(Math.max(0, xp) / 100)) + 1;
}

function createProgression() {
	return {
		level: 1,
		mitzvahPoints: 0,
		rewardIds: [],
		xp: 0
	};
}

function grantReward(
	progression,
	reward,
	options = {}
) {
	if (progression.rewardIds.includes(reward.id)) return false;
	const previousLevel = progression.level;
	progression.rewardIds.push(reward.id);
	progression.xp += Number(reward.xp || 0);
	progression.mitzvahPoints += Number(reward.mitzvahPoints || 0);
	progression.level = levelForXp(progression.xp);
	const gainedLevels = Math.max(0, progression.level - previousLevel);
	if (options.shliach) {
		options.shliach.unspentPoints += gainedLevels * 2;
	}
	if (options.wallet) {
		const perutas = Number(
			reward.perutas
			?? Math.max(5, Math.floor(Number(reward.xp || 0) / 10))
		);
		options.wallet.mitzvahCoins += perutas;
	}
	return true;
}

module.exports = {
	createProgression,
	grantReward,
	levelForXp
};
