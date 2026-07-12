/**
 * B"H
 * @module BattleRewards
 * @description Grants victory once to player, party, missions, collection, and bag.
 */
import { State } from '../../binah/State.js';
import { recordQuestEvent } from '../OhrQuest.js';
import { addGarment, garmentRewardForDebateMilestone, syncLightCapacity } from '../equipment/EquipmentRuntime.js';
import { learnRouteFromMove } from '../abilities/AbilityRuntime.js';
import { grantBattleSkills } from '../skills/SkillRuntime.js';
import { isMusag, recordMusag } from '../musag/MusagDex.js';
import { addItem, addJournalNote, addMoney, rewardLine } from '../bag/BagRuntime.js';
import { addMusagFromEncounter, grantPartyExp } from '../party/PartyRuntime.js';
import { recordMissionEvent } from '../../missions/MissionRuntime.js';
import { battleReward } from './BattleRank.js';
import { pushBattleEffect, pushRewardEffect } from '../../tiferet/render/BattleEffects.js';
import { BATTLE_PHASE, setBattlePhase } from './BattlePhases.js';

const grantPlayerLevels = message => {
	while (State.Stats.exp >= State.Stats.nextExp) {
		State.Stats.exp -= State.Stats.nextExp;
		State.Stats.level += 1;
		State.Stats.nextExp = Math.floor(State.Stats.nextExp * 1.35);
		State.Stats.maxLight += 10;
		State.Stats.light = State.Stats.maxLight;
		message += ` Level ${State.Stats.level}!`;
	}
	return message;
};

const grantMilestoneGarment = message => {
	const garment = garmentRewardForDebateMilestone(State.Stats.debatesWon);
	return garment && addGarment(garment) ? `${message} New garment: ${garment}.` : message;
};

const grantCollection = (defeated, message) => {
	if (!defeated.speciesId) return message;
	const collected = addMusagFromEncounter(defeated);
	if (!collected.ok) return message;
	return `${message} ${collected.member.name} joined the ${collected.destination} party.`;
};

const grantRewards = (defeated, move, message) => {
	grantBattleSkills(move, defeated, true);
	const reward = battleReward(defeated);
	State.Debate.pendingReward = reward;
	State.Stats.sparks += reward.sparks;
	State.Stats.exp += reward.exp;
	State.Stats.debatesWon += 1;
	addMoney(reward.zuzim);
	Object.entries(reward.items || {}).forEach(([id, amount]) => addItem(id, amount));
	recordQuestEvent('debateWon', 1);
	recordMissionEvent('BATTLE', defeated.id || defeated.speciesId || defeated.name);
	const partyLevels = grantPartyExp(reward.exp);
	if (partyLevels.length) message += ` Lead Musag reached level ${partyLevels.at(-1)}.`;
	if (isMusag(defeated)) {
		recordQuestEvent('wildWon', 1);
		const entry = recordMusag(defeated, true);
		if (entry?.sweetened >= 3) message += ` ${entry.name} evolved in the Dex.`;
	}
	message = grantCollection(defeated, message);
	const learned = learnRouteFromMove(move, true);
	if (learned) message += ` ${learned}.`;
	message = grantPlayerLevels(grantMilestoneGarment(message));
	State.Debate.rewardText = rewardLine(reward);
	addJournalNote(`${defeated.name}: ${State.Debate.rewardText}`);
	pushRewardEffect(State.Debate.rewardText);
	return `${message} Rewards: ${State.Debate.rewardText}.`;
};

export const beginVictory = (message = 'The distortion is sweetened.') => {
	if (State.Debate.outcome) return false;
	State.Debate.outcome = 'victory';
	const defeated = State.Debate.enemy;
	pushBattleEffect('heal', 'player', 'victory');
	const finalMessage = grantRewards(defeated, State.Debate.lastMove, message);
	syncLightCapacity();
	State.say(finalMessage, 720);
	setBattlePhase(BATTLE_PHASE.REWARD, 'Rewards collected');
	State.releaseIntents();
	return true;
};

export const closeBattle = (message, won = false) => {
	State.ActiveRealm = 'OVERWORLD';
	setBattlePhase(BATTLE_PHASE.CHOICE, '');
	State.say(message, won ? 620 : 420);
	State.releaseIntents();
};

export const beginDefeat = (message = 'Your light withdrew from the argument.') => {
	State.Debate.outcome = 'defeat';
	State.Stats.light = Math.max(1, Math.floor(State.Stats.maxLight * 0.35));
	closeBattle(`${message} You return with part of your light restored.`, false);
};
