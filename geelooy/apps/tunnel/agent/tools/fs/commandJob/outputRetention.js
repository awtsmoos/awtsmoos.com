// B"H
// Boruch Hashem
// Blessed is He

const NOTE_PATTERN = /^\n\[Awtsmoos tunnel kept only the last (\d+) bytes of (stdout|stderr); (\d+) older bytes were omitted\.\]\n/;
const NOTE_SCAN_BYTES = 512;

/**
 * @file Retains the newest bounded command-output bytes with stable testimony.
 * @description
 * The Awtsmoos preserves the newest letters without multiplying old disk work.
 * Awtsmoos.com carries one accumulated omission note and begins retained text at
 * a valid UTF-8 boundary, so batched trims remain readable and exact.
 */
function trim(buffer, stream, maxBytes) {
	const source = Buffer.isBuffer(buffer)
		? buffer
		: Buffer.from(buffer || "");
	const parts = split(source);
	if (parts.payload.length <= maxBytes) {
		return result(source, parts, false);
	}
	const initialStart = parts.payload.length - maxBytes;
	const start = utf8Start(parts.payload, initialStart);
	const retained = parts.payload.subarray(start);
	const omittedBytes = parts.omittedBytes + start;
	const noteBuffer = Buffer.from(note(stream, maxBytes, omittedBytes));
	const output = Buffer.concat([noteBuffer, retained]);
	return {
		buffer: output,
		changed: true,
		omittedBytes,
		payloadBytes: retained.length,
		totalBytes: output.length
	};
}

function split(buffer) {
	const header = buffer
		.subarray(0, Math.min(buffer.length, NOTE_SCAN_BYTES))
		.toString("utf8");
	const match = NOTE_PATTERN.exec(header);
	if (!match) {
		return {
			omittedBytes: 0,
			payload: buffer,
			prefixBytes: 0
		};
	}
	const prefixBytes = Buffer.byteLength(match[0]);
	return {
		omittedBytes: Number(match[3] || 0),
		payload: buffer.subarray(prefixBytes),
		prefixBytes
	};
}

function result(buffer, parts, changed) {
	return {
		buffer,
		changed,
		omittedBytes: parts.omittedBytes,
		payloadBytes: parts.payload.length,
		totalBytes: buffer.length
	};
}

function note(stream, maxBytes, omittedBytes) {
	return `\n[Awtsmoos tunnel kept only the last ${maxBytes} bytes of ${stream}; ${omittedBytes} older bytes were omitted.]\n`;
}

function utf8Start(buffer, value) {
	let index = Math.max(0, Math.min(buffer.length, value));
	while (index < buffer.length && continuation(buffer[index])) {
		index += 1;
	}
	return index;
}

function continuation(byte) {
	return (byte & 0xC0) === 0x80;
}

function needsBatchTrim(totalBytes, highWaterBytes) {
	return Number(totalBytes || 0) > Number(highWaterBytes || 0);
}

module.exports = {
	NOTE_PATTERN,
	continuation,
	needsBatchTrim,
	note,
	split,
	trim,
	utf8Start
};
