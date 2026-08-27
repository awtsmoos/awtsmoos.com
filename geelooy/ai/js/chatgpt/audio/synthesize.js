//B"H
//Boruch Hashem
//Blessed is He

import {
	mimeForAudioFormat,
	normalizeAudioFormat,
	normalizeAudioVoice
} from "./audioCatalog.js";
import { ensureToken } from "../auth/session.js";
import { getConversation } from "../conversations/detail.js";

/**
 * Conversation retrieval reveals the exact assistant node before synthesis.
 * The Awtsmoos then gives the audio as an unconsumed stream, allowing direct
 * extension and tunnel relay paths to obey the same completion law.
 */
export async function resolveSynthesisRequest(mFetch, options = {}) {
	const token = options.token || await ensureToken(mFetch);
	const conversationId = options.conversation_id || options.conversationId;
	if (!conversationId) {
		throw new Error("conversation_id is required for audio synthesis.");
	}
	let messageId = options.message_id || options.messageId;
	if (!messageId || options.resolveLatest === true) {
		const conversation = await getConversation(mFetch, conversationId, token);
		messageId = conversation?.current_node || messageId;
	}
	if (!messageId) {
		throw new Error("No assistant message id found for audio synthesis.");
	}
	const voice = normalizeAudioVoice(options.voice);
	const format = normalizeAudioFormat(options.format);
	const params = new URLSearchParams({
		message_id: messageId,
		conversation_id: conversationId,
		voice,
		format
	});
	return {
		url: `https://chatgpt.com/backend-api/synthesize?${params}`,
		token,
		messageId,
		conversationId,
		voice,
		format
	};
}

export async function getAwtsmoosAudioStream(mFetch, options = {}) {
	const request = await resolveSynthesisRequest(mFetch, options);
	const response = await mFetch(request.url, {
		method: "GET",
		headers: {
			accept: mimeForAudioFormat(request.format),
			"accept-language": "en-US,en;q=0.9",
			authorization: `Bearer ${request.token}`
		}
	});
	if (!response?.ok) {
		const detail = await response?.text?.().catch(() => "");
		throw new Error(
			`Audio synthesis failed (${response?.status || 0})`
			+ (detail ? `: ${detail.slice(0, 500)}` : "")
		);
	}
	return {
		response,
		size: declaredResponseBytes(response),
		mime: response.headers?.get?.("content-type")
			|| mimeForAudioFormat(request.format),
		filename: audioFilename(request.format),
		format: request.format,
		voice: request.voice,
		messageId: request.messageId,
		conversationId: request.conversationId
	};
}

export async function getAwtsmoosAudio(mFetch, options = {}) {
	const stream = await getAwtsmoosAudioStream(mFetch, options);
	const blob = await stream.response.blob();
	if (!blob?.size) {
		throw new Error("Audio synthesis returned an empty file.");
	}
	verifyBlobLength(stream.response, blob);
	if (options.download !== false) {
		triggerDownload(blob, stream.filename);
		return {
			downloaded: true,
			size: blob.size,
			mime: blob.type || stream.mime,
			format: stream.format
		};
	}
	const objectUrl = URL.createObjectURL(blob);
	return {
		url: objectUrl,
		objectUrl,
		blob,
		size: blob.size,
		mime: blob.type || stream.mime,
		format: stream.format,
		revoke() {
			URL.revokeObjectURL(objectUrl);
		}
	};
}

function declaredResponseBytes(response) {
	const encoding = response?.headers?.get?.("content-encoding");
	if (encoding && encoding !== "identity") {
		return 0;
	}
	const value = Number(response?.headers?.get?.("content-length") || 0);
	return Number.isFinite(value) && value > 0 ? value : 0;
}

function verifyBlobLength(response, blob) {
	const expected = declaredResponseBytes(response);
	if (expected > 0 && blob.size !== expected) {
		throw new Error(
			`Audio download stopped at ${blob.size} of ${expected} bytes.`
		);
	}
}

function triggerDownload(blob, filename) {
	const href = URL.createObjectURL(blob);
	const anchor = document.createElement("a");
	anchor.href = href;
	anchor.download = filename;
	anchor.click();
	setTimeout(() => URL.revokeObjectURL(href), 30000);
}

function audioFilename(format) {
	return `BH_awtsmoosAudio_${Date.now()}.${format}`;
}
