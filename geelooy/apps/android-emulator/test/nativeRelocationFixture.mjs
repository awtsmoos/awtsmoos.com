//B"H
//Boruch Hashem
//Blessed is He

const TABLE_ADDRESS = 0x1000n;
const RECORD_SIZE = 24;

/**
 * Builds a tiny RELA table and symbol image in raw JavaScript bytes. The
 * Awtsmoos recreates relocation place, symbol, addend, and guest import anew;
 * Awtsmoos.com tests its loader without a compiler, linker, or native fixture.
 */
export function createNativeRelocationFixture() {
	const bytes = new Uint8Array(RECORD_SIZE * 3);
	const view = new DataView(bytes.buffer);
	writeRela(view, 0, 0x3000n, 0, 1027, 0x500n);
	writeRela(view, 1, 0x3008n, 1, 1025, 4n);
	writeRela(view, 2, 0x3010n, 2, 1026, 0n);
	const addressSpace = Object.freeze({
		translate(address, length) {
			const offset = Number(address - TABLE_ADDRESS);
			if (offset < 0 || offset + length > bytes.length) {
				throw new Error(`FIXTURE_ADDRESS:${address}:${length}`);
			}
			return offset;
		}
	});
	const image = Object.freeze({
		addressSpace,
		bytes,
		dynamicEntries: createDynamicEntries(bytes.length),
		neededLibraries: Object.freeze(["libc.so"]),
		symbols: createSymbols()
	});
	return Object.freeze({
		image,
		loadBias: 0x100000n
	});
}

export function createRelocationMemoryProbe() {
	const writes = [];
	return Object.freeze({
		loaderWriteU64(address, value) {
			writes.push(Object.freeze({ address, value }));
		},
		readWrites() {
			return Object.freeze([...writes]);
		}
	});
}

function createDynamicEntries(byteLength) {
	return Object.freeze([
		Object.freeze({ tag: 7n, value: TABLE_ADDRESS }),
		Object.freeze({ tag: 8n, value: BigInt(byteLength) }),
		Object.freeze({ tag: 9n, value: 24n }),
		Object.freeze({ tag: 0n, value: 0n })
	]);
}

function createSymbols() {
	return Object.freeze([
		createSymbol("", 0, 0n, 0),
		createSymbol("defined", 1, 0x200n, 1),
		createSymbol("host_call", 0, 0n, 2)
	]);
}

function createSymbol(name, sectionIndex, value, type) {
	return Object.freeze({
		binding: name ? 1 : 0,
		name,
		sectionIndex,
		type,
		value
	});
}

function writeRela(view, index, offset, symbolIndex, type, addend) {
	const start = index * RECORD_SIZE;
	const info = (BigInt(symbolIndex) << 32n) | BigInt(type);
	view.setBigUint64(start, offset, true);
	view.setBigUint64(start + 8, info, true);
	view.setBigInt64(start + 16, addend, true);
}
