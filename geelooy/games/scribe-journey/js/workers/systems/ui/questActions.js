// B"H

import * as PlayerQuestSystem from '../../player_quest_system.js';

export function handleQuestAction(state, action, params, callbacks, trigger) {
	if (action !== 'create_quest') return false;
	PlayerQuestSystem.createPlayerQuest(
		state,
		params.type,
		params.targetId,
		params.rewardId,
		Number(params.rewardAmount),
		(message, type) => trigger.sendToast(message, type)
	);
	callbacks.onUIUpdate({
		screen: 'player-quest-screen',
		playerQuests: state.player.postedQuests || [],
		inventory: state.player.inventory
	});
	return true;
}
