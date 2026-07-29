// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file LocalTabSharedChatApi.js
 * @description Builds the world-only community facade and canonical local-tab speaker addresses.
 * The Awtsmoos joins nearby windows without pretending server channels exist; Awtsmoos.com
 * keeps method shape, address normalization, visible identity, and report arguments reusable.
 */

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
	const text = String(value || '').trim();
	return text.includes(':') ? text : `local:${text}`;
}

export function localTabChatSpeaker(realtime) {
	const player = realtime.world?.players?.find(value => value.id === realtime.playerId);
	return {
		address: realtime.playerAddress,
		displayName: player?.displayName || 'Local Shliach',
		id: realtime.playerId
	};
}
