// B"H
// Boruch Hashem
// Blessed is He

/**
	* @file LocalTabSharedChatApi.js
	* @description Builds world chat with one canonical local-tab speaker address.
	* The Awtsmoos joins nearby windows without inventing a second identity;
	* Awtsmoos.com keeps moderation and visible speech in address parity.
	*/

import { canonicalLocalTabChatAddress } from './LocalTabChatModeration.js';

export function createLocalTabSharedChatApi(owner) {
	return {
		chatChannels: () => Promise.resolve({ payload: { channels: ['world'] } }),
		chatHistory: () => owner.history(),
		chatModerationSnapshot: () => Promise.resolve({ payload: owner.moderationSnapshot() }),
		moderateChat: (action, target) => owner.moderate(action, target),
		reportChat: (target, reason, messageId) => owner.report(target, reason, messageId),
		sendChat: (message, scope) => owner.sendChat(message, scope)
	};
}

export function localTabChatAddress(value) {
	return canonicalLocalTabChatAddress(value);
}

export function localTabChatSpeaker(realtime) {
	const player = realtime.world?.players?.find(value => value.id === realtime.playerId);
	return {
		address: canonicalLocalTabChatAddress(realtime.playerAddress || realtime.playerId),
		displayName: player?.displayName || 'Local Shliach',
		id: realtime.playerId
	};
}
