/**
 * B"H
 * @module MissionRewards
 * @description Grants mission rewards to player, party, bag, and journal exactly once.
 */
import { State } from '../binah/State.js';
import { addItem, addJournalNote, addMoney, rewardLine } from '../yesod/bag/BagRuntime.js';
import { grantPartyExp } from '../yesod/party/PartyRuntime.js';

const grantPlayerLevels = () => {
	const levels = [];
	while (State.Stats.exp >= State.Stats.nextExp) {
		State.Stats.exp -= State.Stats.nextExp;
		State.Stats.level += 1;
		State.Stats.nextExp = Math.floor(State.Stats.nextExp * 1.35);
		State.Stats.maxLight += 10;
		State.Stats.light = State.Stats.maxLight;
		levels.push(State.Stats.level);
	}
	return levels;
};

export const grantMissionRewards = mission => {
	const reward = mission.rewards || {};
	State.Stats.exp += reward.exp || 0;
	State.Stats.sparks += reward.sparks || 0;
	addMoney(reward.zuzim || 0);
	Object.entries(reward.items || {}).forEach(([id, amount]) => addItem(id, amount));
	const playerLevels = grantPlayerLevels();
	const partyLevels = grantPartyExp(reward.exp || 0);
	const line = rewardLine(reward) || 'story progress';
	addJournalNote(`${mission.title} complete: ${line}`);
	return { reward, line, playerLevels, partyLevels };
};
