//B"H
//Boruch Hashem
//Blessed is He

const assert = require('node:assert/strict');
const test = require('node:test');
const { createProgression, grantReward, levelForXp } = require('./Progression.js');

test('derives levels and grants a reward only once', () => {
	const progression = createProgression();
	const reward = { id: 'reward:test', mitzvahPoints: 18, xp: 180 };
	assert.equal(grantReward(progression, reward), true);
	assert.equal(grantReward(progression, reward), false);
	assert.equal(progression.xp, 180);
	assert.equal(progression.mitzvahPoints, 18);
	assert.equal(progression.level, levelForXp(180));
});
