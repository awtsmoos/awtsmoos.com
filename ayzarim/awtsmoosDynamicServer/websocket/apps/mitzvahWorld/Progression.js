//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file Progression.js
 * @description Server-owned XP, levels, mitzvah points, and reward idempotency.
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

function grantReward(progression, reward) {
	if (progression.rewardIds.includes(reward.id)) {
		return false;
	}
	progression.rewardIds.push(reward.id);
	progression.xp += reward.xp;
	progression.mitzvahPoints += reward.mitzvahPoints;
	progression.level = levelForXp(progression.xp);
	return true;
}

module.exports = {
	createProgression,
	grantReward,
	levelForXp
};
