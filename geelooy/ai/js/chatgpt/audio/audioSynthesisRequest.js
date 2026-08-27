//B"H
//Boruch Hashem
//Blessed is He

import { audioSignature } from "./audioPlayerState.js";

/**
 * The Awtsmoos gathers conversation, message, voice, and format into one exact
 * request vessel. Awtsmoos.com keeps this contract separate so play and
 * download can never quietly send different identities.
 */
export function buildAudioRequest(context, settings, format, signature = "") {
	return {
		message_id: context.messageId,
		conversation_id: context.conversationId,
		voice: settings.voice,
		format,
		...(signature ? { signature } : {})
	};
}

export function buildAudioSignature(context, settings, format) {
	return audioSignature({
		conversationId: context.conversationId,
		messageId: context.messageId,
		voice: settings.voice,
		format
	});
}

export async function activeAudioService(aiHandler) {
	const service = await aiHandler?.getActiveService?.();
	if (!service) {
		throw new Error("No active ChatGPT service was found.");
	}
	return service;
}
