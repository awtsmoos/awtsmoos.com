// B"H
// Boruch Hashem
// Blessed is He

import * as PlayerQuestSystem from '../../player_quest_system.js';
import * as Quests from '../../quests.js';
import { journeyToQuest } from '../quests/questJourney.js';
import { chooseScribeName, chooseStarter } from '../quests/questOnboarding.js';

function refreshQuestLog(state, callbacks) {
	callbacks.onUIUpdate({ questLog: Quests.getQuestLogPayload(state) });
}

function handleAuthoredQuest(state, action, params, callbacks, trigger) {
	if (action === 'accept_quest') Quests.accept(state, params.questId, trigger.sendToast);
	else if (action === 'track_quest') Quests.trackQuest(state, params.questId);
	else if (action === 'finalize_quest') Quests.finalize(state, params.questId, trigger.sendToast);
	else if (action === 'journey_to_quest') {
		journeyToQuest(state, params.questId, trigger.sendToast);
		callbacks.onUIUpdate({ screen: 'game' });
	} else if (action === 'choose_scribe_name') chooseScribeName(state, params.playerName, trigger.sendToast);
	else if (action === 'choose_starter') chooseStarter(state, params.starterId, trigger.sendToast);
	else return false;
	refreshQuestLog(state, callbacks);
	return true;
}

function handlePlayerQuest(state, action, params, callbacks, trigger) {
	if (action !== 'create_quest') return false;
	PlayerQuestSystem.createPlayerQuest(
		state, params.type, params.targetId, params.rewardId, Number(params.rewardAmount),
		(message, type) => trigger.sendToast(message, type)
	);
	callbacks.onUIUpdate({ screen: 'player-quest-screen', playerQuests: state.player.postedQuests || [], inventory: state.player.inventory });
	return true;
}

export function handleQuestAction(state, action, params, callbacks, trigger) {
	return handleAuthoredQuest(state, action, params, callbacks, trigger) || handlePlayerQuest(state, action, params, callbacks, trigger);
}
