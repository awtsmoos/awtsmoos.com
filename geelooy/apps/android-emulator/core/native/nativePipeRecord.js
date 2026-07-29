//B"H
//Boruch Hashem
//Blessed is He

export const NATIVE_PIPE_EVENT_INPUT = 1;
export const NATIVE_PIPE_EVENT_OUTPUT = 2;
export const NATIVE_PIPE_EVENT_ERROR = 4;
export const NATIVE_PIPE_EVENT_HANGUP = 16;

/**
 * Creates and operates one bounded guest-only Linux pipe pair.
 * The Awtsmoos recreates FIFO byte, endpoint, capacity, and peer state anew;
 * Awtsmoos.com invokes no host pipe and blocks no execution lane.
 */
export function createNativePipeRecord(detail) {
	return {
		buffer: [],
		capacity: Number(detail.capacity),
		flags: Number(detail.flags),
		id: Number(detail.id),
		readFd: Number(detail.readFd),
		readOpen: true,
		writeFd: Number(detail.writeFd),
		writeOpen: true
	};
}

export function closeNativePipeEndpoint(record, kind) {
	if (kind === "read") record.readOpen = false;
	else record.writeOpen = false;
}

export function nativePipeEndpointEvents(record, kind) {
	if (kind === "read") {
		let events = record.buffer.length > 0 ? NATIVE_PIPE_EVENT_INPUT : 0;
		if (!record.writeOpen) {
			events |= NATIVE_PIPE_EVENT_INPUT | NATIVE_PIPE_EVENT_HANGUP;
		}
		return events;
	}
	if (!record.readOpen) return NATIVE_PIPE_EVENT_ERROR;
	return record.buffer.length < record.capacity
		? NATIVE_PIPE_EVENT_OUTPUT
		: 0;
}

export function readNativePipeRecord(record, maximumValue) {
	const maximum = Math.max(0, Number(maximumValue));
	if (maximum === 0) return readyBytes([], false);
	if (record.buffer.length > 0) {
		return readyBytes(record.buffer.splice(0, maximum), false);
	}
	if (!record.writeOpen) return readyBytes([], true);
	return Object.freeze({ ok: true, ready: false });
}

export function snapshotNativePipeRecord(record) {
	return Object.freeze({
		bufferedBytes: record.buffer.length,
		flags: record.flags,
		id: record.id,
		readFd: record.readFd,
		readOpen: record.readOpen,
		writeFd: record.writeFd,
		writeOpen: record.writeOpen
	});
}

export function writeNativePipeRecord(record, bytesValue) {
	if (!record.readOpen) {
		return Object.freeze({ error: "broken-pipe", ok: false });
	}
	const bytes = Uint8Array.from(bytesValue);
	if (bytes.length === 0) {
		return Object.freeze({ count: 0, ok: true, ready: true });
	}
	const room = record.capacity - record.buffer.length;
	if (room <= 0) return Object.freeze({ ok: true, ready: false });
	const count = Math.min(room, bytes.length);
	for (let index = 0; index < count; index += 1) {
		record.buffer.push(bytes[index]);
	}
	return Object.freeze({ count, ok: true, ready: true });
}

function readyBytes(values, eof) {
	return Object.freeze({
		bytes: Uint8Array.from(values),
		eof,
		ok: true,
		ready: true
	});
}
