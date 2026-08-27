//B"H
//Boruch Hashem
//Blessed is He

import {
	createAudioChunkStore,
	downloadAudioStore
} from "./audioChunkStore.js";

/**
 * The Awtsmoos continuously creates every byte, while this state counts each
 * one without demanding that hours of completed sound remain in JavaScript RAM.
 * Persistent storage opens only when the first streamed byte arrives.
 */
export function createAudioState(options = {}) {
	return {
		signature: options.signature || "audio",
		mode: options.mode || "idle",
		bytes: 0,
		expectedBytes: Number(options.expectedBytes || 0),
		mime: options.mime || "audio/mpeg",
		objectUrl: "",
		done: false,
		promise: null,
		cancel: null,
		startedAt: Date.now(),
		storePromise: null
	};
}

export function resetAudioState(root) {
	const audio = root.querySelector("audio");
	const previous = root.__awtsmoosAudio;
	try {
		previous?.cancel?.();
	} catch {}
	void cleanupAudioState(previous);
	revokeAudioSource(audio);
	root.__awtsmoosAudio = createAudioState();
	return root.__awtsmoosAudio;
}

export async function cleanupAudioState(state) {
	if (!state?.storePromise) return;
	try {
		const store = await state.storePromise;
		await store.cleanup();
	} catch {}
}

export function revokeAudioSource(audio) {
	const objectUrl = audio?.dataset?.objectUrl;
	if (objectUrl?.startsWith?.("blob:")) {
		URL.revokeObjectURL(objectUrl);
	}
	audio?.removeAttribute?.("src");
	if (audio?.dataset) delete audio.dataset.objectUrl;
	try {
		audio?.load?.();
	} catch {}
}

export function audioSignature(options = {}) {
	return [
		options.conversationId || "",
		options.messageId || "",
		options.voice || "",
		options.format || ""
	].join("::");
}

export function expectedAudioBytes(response) {
	const encoding = response?.headers?.get?.("content-encoding");
	if (encoding && encoding !== "identity") return 0;
	const length = Number(response?.headers?.get?.("content-length") || 0);
	return Number.isFinite(length) && length > 0 ? length : 0;
}

export async function appendAudioChunk(state, value) {
	const store = await ensureAudioStore(state);
	const owned = await store.append(value);
	state.bytes += owned.byteLength;
	return owned;
}

export async function finalizeAudioState(state) {
	const store = await ensureAudioStore(state);
	await store.finalize();
	state.done = true;
	return verifyAudioState(state);
}

export function verifyAudioState(state) {
	if (!state?.done) {
		throw new Error("Audio stream has not reached its completion marker.");
	}
	if (state.expectedBytes > 0 && state.bytes !== state.expectedBytes) {
		throw new Error(
			`Audio stopped at ${state.bytes} of ${state.expectedBytes} bytes.`
		);
	}
	return state;
}

export async function downloadAudioState(state, format = "mp3") {
	verifyAudioState(state);
	const store = await ensureAudioStore(state);
	return await downloadAudioStore(store, {
		mime: state.mime || "audio/mpeg",
		format
	});
}

function ensureAudioStore(state) {
	state.storePromise ||= createAudioChunkStore(state.signature);
	return state.storePromise;
}
