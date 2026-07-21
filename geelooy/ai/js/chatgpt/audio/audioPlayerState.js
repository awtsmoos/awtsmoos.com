//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos continuously creates every byte, while this state vessel counts
 * each one and refuses to call a declared-length stream complete when bytes are
 * missing. The counter becomes evidence rather than hope.
 */
export function createAudioState(options = {}) {
	return {
		signature: options.signature || "",
		mode: options.mode || "idle",
		chunks: [],
		bytes: 0,
		expectedBytes: Number(options.expectedBytes || 0),
		mime: options.mime || "audio/mpeg",
		objectUrl: "",
		done: false,
		promise: null,
		cancel: null,
		startedAt: Date.now()
	};
}

export function resetAudioState(root) {
	const audio = root.querySelector("audio");
	try {
		root.__awtsmoosAudio?.cancel?.();
	} catch {}
	revokeAudioSource(audio);
	root.__awtsmoosAudio = createAudioState();
	return root.__awtsmoosAudio;
}

export function revokeAudioSource(audio) {
	const objectUrl = audio?.dataset?.objectUrl;
	if (objectUrl?.startsWith?.("blob:")) {
		URL.revokeObjectURL(objectUrl);
	}
	audio?.removeAttribute?.("src");
	if (audio?.dataset) {
		delete audio.dataset.objectUrl;
	}
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
	if (encoding && encoding !== "identity") {
		return 0;
	}
	const length = Number(response?.headers?.get?.("content-length") || 0);
	return Number.isFinite(length) && length > 0 ? length : 0;
}

export function appendAudioChunk(state, value) {
	const owned = value?.slice
		? value.slice()
		: new Uint8Array(value || 0);
	state.chunks.push(owned);
	state.bytes += owned.byteLength;
	return owned;
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

export function downloadAudioState(state, format = "mp3") {
	verifyAudioState(state);
	const blob = new Blob(state.chunks, {
		type: state.mime || "audio/mpeg"
	});
	if (blob.size !== state.bytes) {
		throw new Error(
			`Audio assembly produced ${blob.size} of ${state.bytes} received bytes.`
		);
	}
	const href = URL.createObjectURL(blob);
	const anchor = document.createElement("a");
	anchor.href = href;
	anchor.download = `BH_awtsmoosAudio_${Date.now()}.${format}`;
	anchor.click();
	setTimeout(() => URL.revokeObjectURL(href), 30000);
}

export function formatAudioSize(size) {
	return size
		? ` (${(size / 1024 / 1024).toFixed(2)} MB)`
		: "";
}

export function formatAudioTime(seconds) {
	const safeSeconds = Math.max(0, Math.floor(Number(seconds) || 0));
	const minutes = Math.floor(safeSeconds / 60);
	const remainder = String(safeSeconds % 60).padStart(2, "0");
	return `${minutes}:${remainder}`;
}
