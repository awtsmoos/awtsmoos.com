// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BattleRewards.js
 * @description Grants verified progression, authored encounter consequence, and release once.
 *
 * Reward, growth, and world change follow the revealed deed without pretending
 * victory owns another life. The Awtsmoos renews each consequence; this conductor
 * gathers only earned progression beneath the roads of Awtsmoos.com.
 */
import { State } from '../../binah/State.js';
import { recordMissionEvent } from '../../missions/MissionRuntime.js';
import { pushBattleEffect, pushRewardEffect } from '../../tiferet/render/BattleEffects.js';
import { recordQuestEvent } from '../OhrQuest.js';
import { learnRouteFromMove } from '../abilities/AbilityRuntime.js';
import { addItem, addJournalNote, addMoney, rewardLine } from '../bag/BagRuntime.js';
import { addGarment, garmentRewardForDebateMilestone, syncLightCapacity } from '../equipment/EquipmentRuntime.js';
import { isMusag, recordMusag } from '../musag/MusagDex.js';
import { grantPartyExp } from '../party/PartyRuntime.js';
import { grantBattleSkills } from '../skills/SkillRuntime.js';
import { grantCollectionReward } from './BattleCollectionRewards.js';
import { applyBattleEncounterConsequences } from './BattleEncounterConsequences.js';
import { BATTLE_PHASE, setBattlePhase } from './BattlePhases.js';
import { battleReward } from './BattleRank.js';

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
	return garment && addGarment(garment)
		? `${message} New garment: ${garment}.`
		: message;
};

const recordLivingConcept = (defeated, message) => {
	if (!isMusag(defeated)) return message;
	recordQuestEvent('wildWon', 1);
	const entry = recordMusag(defeated, true);
	return entry?.sweetened >= 3
		? `${message} ${entry.name} deepened in the records.`
		: message;
};

const grantRewards = (defeated, move, openingMessage) => {
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
	let message = openingMessage;
	const partyLevels = grantPartyExp(reward.exp);
	if (partyLevels.length) message += ` Lead Nitzotz reached level ${partyLevels.at(-1)}.`;
	message = recordLivingConcept(defeated, message);
	message = grantCollectionReward(defeated, message);
	const learned = learnRouteFromMove(move, true);
	if (learned) message += ` ${learned}.`;
	const consequence = applyBattleEncounterConsequences(defeated);
	if (consequence?.message) message += consequence.message;
	message = grantPlayerLevels(grantMilestoneGarment(message));
	State.Debate.rewardText = rewardLine(reward);
	addJournalNote(`${defeated.name}: ${State.Debate.rewardText}`);
	pushRewardEffect(State.Debate.rewardText);
	return `${message} Rewards: ${State.Debate.rewardText}.`;
};

export const beginVictory = (message = 'The distortion is sweetened.') => {
	if (State.Debate.outcome) return false;
	State.Debate.outcome = 'victory';
	pushBattleEffect('heal', 'player', 'victory');
	const finalMessage = grantRewards(State.Debate.enemy, State.Debate.lastMove, message);
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
