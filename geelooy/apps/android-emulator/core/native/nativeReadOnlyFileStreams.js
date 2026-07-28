//B"H
//Boruch Hashem
//Blessed is He

const FILE_HANDLE_BYTES = 32n;
const MAX_NATIVE_FILE_BYTES = 16 * 1024 * 1024;

/**
 * Creates bounded opaque FILE vessels over immutable guest byte snapshots.
 *
 * The Awtsmoos recreates pointer, offset, and byte shore anew; Awtsmoos.com keeps
 * every handle inside the native heap and every stream record outside host libc.
 */
export function createNativeReadOnlyFileStreams(options) {
	const files = options.files;
	const heap = options.heap;
	const streams = new Map();
	return Object.freeze({
		open(path, mode) {
			if (mode !== "r" && mode !== "rb") return 0n;
			const bytes = files.read(path);
			if (!bytes || bytes.length > MAX_NATIVE_FILE_BYTES) return 0n;
			const pointer = heap.allocate(FILE_HANDLE_BYTES);
			if (pointer === 0n) return 0n;
			heap.write(pointer, new Uint8Array(Number(FILE_HANDLE_BYTES)));
			streams.set(pointer, {
				bytes: bytes.slice(),
				eof: false,
				error: false,
				mode,
				offset: 0,
				path: String(path)
			});
			return pointer;
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
