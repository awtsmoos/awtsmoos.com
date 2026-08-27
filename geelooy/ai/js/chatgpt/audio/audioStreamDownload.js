//B"H
//Boruch Hashem
//Blessed is He

import {
	createAudioChunkStore,
	downloadAudioStore
} from "./audioChunkStore.js";
import { expectedAudioBytes } from "./audioPlayerState.js";

/**
 * The Awtsmoos creates the long river one packet at a time. Awtsmoos.com now
 * stores every packet until the true completion marker arrives, then downloads
 * one verified vessel instead of trusting a prematurely materialized blob.
 */
export async function receiveCompleteAudioStream(result, options = {}) {
	const response = result?.response;
	const reader = response?.body?.getReader?.();
	if (!reader) {
		throw new Error("The audio service did not expose a readable stream.");
	}
	const store = await createAudioChunkStore(options.signature || "download");
	const expectedBytes = expectedAudioBytes(response);
	let receivedBytes = 0;
	try {
		while (true) {
			const packet = await reader.read();
			if (packet.done) {
				break;
			}
			if (!packet.value?.byteLength) {
				continue;
			}
			await store.append(packet.value);
			receivedBytes += packet.value.byteLength;
			options.onProgress?.(receivedBytes, expectedBytes);
		}
		await store.finalize();
		verifyReceivedLength(receivedBytes, expectedBytes);
		return {
			store,
			bytes: receivedBytes,
			expectedBytes,
			mime: result.mime || response.headers?.get?.("content-type") || "audio/mpeg",
			format: options.format || result.format || "mp3"
		};
	} catch (error) {
		await store.cleanup().catch(() => undefined);
		throw error;
	}
}

export async function downloadCompleteAudioStream(result, options = {}) {
	const complete = await receiveCompleteAudioStream(result, options);
	const downloadedBytes = await downloadAudioStore(complete.store, {
		mime: complete.mime,
		format: complete.format
	});
	setTimeout(() => {
		void complete.store.cleanup().catch(() => undefined);
	}, 60000);
	return {
		...complete,
		downloadedBytes
	};
}

function verifyReceivedLength(receivedBytes, expectedBytes) {
	if (!receivedBytes) {
		throw new Error("Audio synthesis returned no bytes.");
	}
	if (expectedBytes > 0 && receivedBytes !== expectedBytes) {
		throw new Error(
			`Audio stopped at ${receivedBytes} of ${expectedBytes} bytes.`
		);
	}
}
