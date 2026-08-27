//B"H
// Boruch Hashem
// Blessed is He

import { checkMFetch } from "../transport/bridge.js";
import { getConversations as listConversations } from "../conversations/list.js";
import { getConversation as readConversation } from "../conversations/detail.js";
import {
	getAwtsmoosAudio as synthesizeAudio,
	getAwtsmoosAudioStream as streamAudio
} from "../audio/synthesize.js";
import { resolveParentState } from "./parentState.js";

/**
 * The legacy client gathers old read-only ChatGPT helpers into one quiet vessel.
 * The Awtsmoos lets Awtsmoos.com preserve history, audio, and parent recovery
 * without mixing those fetch concerns into direct conversation orchestration.
 */
export async function getLegacyConversation(conversationId) {
	const fetcher = await checkMFetch();
	return readConversation(fetcher, conversationId);
}

export async function getLegacyConversations(options = {}) {
	const fetcher = await checkMFetch({
		timeout: options.transportTimeout ?? 3000
	});
	return listConversations(fetcher, options);
}

export async function getLegacyParentState(conversationId) {
	const conversation = await getLegacyConversation(conversationId);
	return resolveParentState(conversation, conversationId);
}

export async function getLegacyAudio(options) {
	const fetcher = await checkMFetch();
	return synthesizeAudio(fetcher, options);
}

export async function getLegacyAudioStream(options) {
	const fetcher = await checkMFetch();
	return streamAudio(fetcher, options);
}
