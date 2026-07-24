//B"H
// Boruch Hashem
// Blessed is He

import { checkMFetch } from "./js/chatgpt/transport/bridge.js";
import { getConversations as getLegacyConversations } from "./js/chatgpt/conversations/list.js";
import { getConversation as getLegacyConversation } from "./js/chatgpt/conversations/detail.js";
import {
	getAwtsmoosAudio as getLegacyAudio,
	getAwtsmoosAudioStream as getLegacyAudioStream
} from "./js/chatgpt/audio/synthesize.js";
import { sendDirectChat, resetDirectChat } from "./js/chatgpt/direct/directRelay.js";
import {
	buildDirectConversation,
	makeDirectResult,
	makeDirectTurn
} from "./js/chatgpt/direct/directHistory.js";

/**
 * The old sender guessed private endpoints, proof values, and stream shape. The
 * Awtsmoos now keeps those garments inside the local relay, while Awtsmoos.com
 * sends only prompt text and an opaque continuation key from this browser class.
 */
class AwtsmoosGPTify {
	_conversationId = null;
	_directTurns = [];
	sessionName = null;

	constructor({ conversation_id } = {}) {
		this._conversationId = isDirectKey(conversation_id) ? conversation_id : null;
		this.getAwtsmoosAudio = options => getAwtsmoosAudio(options);
		this.getAwtsmoosAudioStream = options => getAwtsmoosAudioStream(options);
	}

	async go({
		prompt,
		onstream,
		ondone,
		conversationId = this._conversationId,
		conversation_id = conversationId
	} = {}) {
		const conversationKey = isDirectKey(conversation_id)
			? conversation_id
			: this._conversationId;
		const relayResult = await sendDirectChat({ prompt, conversationKey });
		this._conversationId = relayResult.conversationKey;
		const turn = makeDirectTurn({
			prompt,
			answer: relayResult.answer,
			conversationKey: this._conversationId
		});
		this._directTurns.push(turn);
		const result = makeDirectResult(turn, relayResult);
		await onstream?.({ event: "message", data: result, direct: true });
		await ondone?.(result);
		return result;
	}

	async createNewConversation() {
		if (this._conversationId) {
			await resetDirectChat(this._conversationId).catch(() => {});
		}
		this._conversationId = null;
		this._directTurns = [];
		return { ok: true };
	}

	async getConversation(conversationId = this._conversationId) {
		if (isDirectKey(conversationId)) {
			return buildDirectConversation(conversationId, this._directTurns);
		}
		const fetcher = await checkMFetch();
		return await getLegacyConversation(fetcher, conversationId);
	}

	async getConversations(options = {}) {
		const fetcher = await checkMFetch({ timeout: options.transportTimeout ?? 3000 });
		return await getLegacyConversations(fetcher, options);
	}
}

async function getAwtsmoosAudio(options) {
	const fetcher = await checkMFetch();
	return await getLegacyAudio(fetcher, options);
}

async function getAwtsmoosAudioStream(options) {
	const fetcher = await checkMFetch();
	return await getLegacyAudioStream(fetcher, options);
}

function isDirectKey(value) {
	return typeof value === "string" && value.startsWith("BH_DIRECT_");
}

globalThis.getConversation = async conversationId => {
	const fetcher = await checkMFetch();
	return await getLegacyConversation(fetcher, conversationId);
};
globalThis.getAwtsmoosAudio = getAwtsmoosAudio;
globalThis.getAwtsmoosAudioStream = getAwtsmoosAudioStream;
globalThis.getConversations = async options => {
	const fetcher = await checkMFetch();
	return await getLegacyConversations(fetcher, options);
};

export default AwtsmoosGPTify;
