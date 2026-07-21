//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos creates every byte anew, while this reader receives only one
 * bounded relay vessel at a time. No conversation or long audio file is ever
 * requested as one enormous data URL.
 */

export function createRelayBody(streamId, readPacket, onUse = () => {}) {
	return {
		getReader() {
			onUse();
			return createRelayReader(streamId, readPacket);
		}
	};
}

export async function collectRelayBytes(body) {
	const reader = body?.getReader?.();
	if (!reader) {
		return new Uint8Array();
	}
	const chunks = [];
	let totalBytes = 0;
	while (true) {
		const packet = await reader.read();
		if (packet.done) {
			break;
		}
		if (!packet.value?.byteLength) {
			continue;
		}
		chunks.push(packet.value);
		totalBytes += packet.value.byteLength;
	}
	return concatenateBytes(chunks, totalBytes);
}

function createRelayReader(streamId, readPacket) {
	let cursor = 0;
	let complete = false;
	return {
		async read() {
			if (complete) {
				return { done: true, value: undefined };
			}
			const packet = await readReadyPacket(streamId, cursor, readPacket);
			if (packet?.done || !packet?.chunk) {
				complete = true;
				return { done: true, value: undefined };
			}
			cursor = packet.index !== undefined
				? Number(packet.index) + 1
				: cursor + 1;
			return { done: false, value: decodeDataUrl(packet.chunk) };
		},
		async cancel() {
			complete = true;
		}
	};
}

async function readReadyPacket(streamId, cursor, readPacket) {
	while (true) {
		const packet = await readPacket(streamId, cursor);
		if (!packet?.pending) {
			return packet;
		}
		await new Promise(resolve => {
			setTimeout(resolve, Math.min(Number(packet.retryAfter) || 750, 5000));
		});
	}
}

function decodeDataUrl(dataUrl) {
	const text = String(dataUrl || "");
	const separator = text.indexOf(",");
	if (separator < 0) {
		throw new Error("Relay returned an invalid binary packet.");
	}
	const binary = atob(text.slice(separator + 1));
	const bytes = new Uint8Array(binary.length);
	for (let index = 0; index < binary.length; index += 1) {
		bytes[index] = binary.charCodeAt(index);
	}
	return bytes;
}

function concatenateBytes(chunks, totalBytes) {
	const joined = new Uint8Array(totalBytes);
	let offset = 0;
	for (const chunk of chunks) {
		joined.set(chunk, offset);
		offset += chunk.byteLength;
	}
	return joined;
}
