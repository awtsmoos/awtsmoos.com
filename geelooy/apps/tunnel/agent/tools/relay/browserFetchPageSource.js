//B"H
//Boruch Hashem
//Blessed is He

/**
 * The logged-in page owns the authenticated river. These self-contained source
 * functions live inside Chrome and reveal no more than 128 KiB per CDP value.
 */
async function browserFetchStartSource(url, options, streamId) {
	const registryKey = "__awtsmoosBrowserRelayStreams";
	const registry = globalThis[registryKey]
		|| (globalThis[registryKey] = new Map());
	const request = { ...(options || {}) };
	if (request.body?.type === "base64") {
		const binary = atob(String(request.body.data || ""));
		const bytes = new Uint8Array(binary.length);
		for (let index = 0; index < binary.length; index += 1) {
			bytes[index] = binary.charCodeAt(index);
		}
		request.body = bytes;
	}
	try {
		const response = await fetch(url, request);
		registry.set(streamId, {
			reader: response.body?.getReader?.() || null,
			pending: new Uint8Array(),
			done: !response.body
		});
		return {
			ok: response.ok,
			status: response.status,
			statusText: response.statusText,
			url: response.url,
			redirected: response.redirected,
			headers: Array.from(response.headers.entries()),
			streamId
		};
	} catch (error) {
		registry.delete(streamId);
		return {
			ok: false,
			status: 0,
			url,
			headers: [],
			streamId,
			error: error?.message || String(error)
		};
	}
}

async function browserFetchReadSource(streamId) {
	const registry = globalThis.__awtsmoosBrowserRelayStreams;
	const state = registry?.get?.(streamId);
	if (!state) {
		return { done: true, missing: true };
	}
	try {
		let bytes = state.pending;
		if (!bytes?.byteLength && !state.done) {
			const packet = await state.reader.read();
			state.done = packet.done;
			bytes = packet.value || new Uint8Array();
		}
		if (!bytes?.byteLength && state.done) {
			registry.delete(streamId);
			return { done: true };
		}
		const limit = 128 * 1024;
		const output = bytes.subarray(0, limit);
		state.pending = bytes.subarray(output.byteLength);
		let binary = "";
		for (let offset = 0; offset < output.length; offset += 0x8000) {
			binary += String.fromCharCode(...output.subarray(offset, offset + 0x8000));
		}
		return {
			done: false,
			byteLength: output.byteLength,
			chunk: `data:application/octet-stream;base64,${btoa(binary)}`
		};
	} catch (error) {
		registry.delete(streamId);
		return { done: true, error: error?.message || String(error) };
	}
}

async function browserFetchCancelSource(streamId) {
	const registry = globalThis.__awtsmoosBrowserRelayStreams;
	const state = registry?.get?.(streamId);
	registry?.delete?.(streamId);
	try {
		await state?.reader?.cancel?.("relay consumer released");
	} catch {}
	return { ok: true, cancelled: Boolean(state) };
}

module.exports = {
	browserFetchCancelSource,
	browserFetchReadSource,
	browserFetchStartSource
};
