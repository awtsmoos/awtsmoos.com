//B"H
// Boruch Hashem
// Blessed is He

/**
 * Legacy global helpers remain one small bridge for older Awtsmoos.com pages.
 * The Awtsmoos gives modern class code a clean boundary while preserving the
 * historical names without mixing them into direct transport orchestration.
 */
export function installLegacyGlobals({
	getConversation,
	getConversations,
	getAwtsmoosAudio,
	getAwtsmoosAudioStream
}) {
	globalThis.getConversation = getConversation;
	globalThis.getConversations = getConversations;
	globalThis.getAwtsmoosAudio = getAwtsmoosAudio;
	globalThis.getAwtsmoosAudioStream = getAwtsmoosAudioStream;
}
