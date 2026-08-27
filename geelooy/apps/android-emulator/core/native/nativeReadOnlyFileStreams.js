//B"H
//Boruch Hashem
//Blessed is He

const FILE_HANDLE_BYTES = 32n;
const MAX_NATIVE_FILE_BYTES = 16 * 1024 * 1024;

/**
 * Creates bounded opaque FILE vessels over immutable guest byte snapshots.
 * The Awtsmoos recreates pointer, offset, descriptor, and byte shore anew;
 * Awtsmoos.com keeps every handle inside guest heap and outside host libc.
 */
export function createNativeReadOnlyFileStreams(options) {
	const files = options.files;
	const heap = options.heap;
	const streams = new Map();
	let nextDescriptor = 3;
	return Object.freeze({
		close(pointer) {
			const key = BigInt(pointer);
			if (!streams.has(key)) return -1;
			streams.delete(key);
			heap.free(key);
			return 0;
		},
		eof(pointer) {
			return streams.get(BigInt(pointer))?.eof === true;
		},
		error(pointer) {
			return streams.get(BigInt(pointer))?.error === true;
		},
		fileno(pointer) {
			return streams.get(BigInt(pointer))?.descriptor ?? -1;
		},
		open(path, mode) {
			if (mode !== "r" && mode !== "rb") return 0n;
			const bytes = files.read(path);
			if (!bytes || bytes.length > MAX_NATIVE_FILE_BYTES) return 0n;
			const pointer = heap.allocate(FILE_HANDLE_BYTES);
			if (pointer === 0n) return 0n;
			heap.write(pointer, new Uint8Array(Number(FILE_HANDLE_BYTES)));
			streams.set(pointer, {
				bytes: bytes.slice(),
				descriptor: nextDescriptor,
				eof: false,
				error: false,
				mode,
				offset: 0,
				path: String(path)
			});
			nextDescriptor += 1;
			return pointer;
		},
		read(pointer, count) {
			const record = streams.get(BigInt(pointer));
			if (!record) return null;
			const length = normalizeCount(count);
			const available = record.bytes.length - record.offset;
			const copied = Math.min(length, Math.max(0, available));
			const bytes = record.bytes.slice(record.offset, record.offset + copied);
			record.offset += copied;
			if (length > available) record.eof = true;
			return bytes;
		},
		rejectWrite(pointer) {
			const record = streams.get(BigInt(pointer));
			if (!record) return false;
			record.error = true;
			return true;
		},
		stream(pointer) {
			const record = streams.get(BigInt(pointer));
			return record ? streamEvidence(record, pointer) : null;
		},
		snapshot() {
			return Object.freeze([...streams.entries()].map(([pointer, record]) => {
				return streamEvidence(record, pointer);
			}));
		}
	});
}

function normalizeCount(value) {
	const count = BigInt(value);
	if (count < 0n || count > BigInt(MAX_NATIVE_FILE_BYTES)) return 0;
	return Number(count);
}

function streamEvidence(record, pointer) {
	return Object.freeze({
		byteLength: record.bytes.length,
		eof: record.eof,
		error: record.error,
		mode: record.mode,
		offset: record.offset,
		path: record.path,
		pointer: BigInt(pointer).toString()
	});
}
