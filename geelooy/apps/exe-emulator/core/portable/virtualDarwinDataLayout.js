//B"H
//Boruch Hashem
//Blessed is He

const STREAM_STRIDE = 80;
const STREAM_SIGNATURE = new TextEncoder().encode("AWTSFILE");
const STREAM_DEFINITIONS = Object.freeze({
	___stderrp: Object.freeze({ descriptor: 2, readable: false, writable: true }),
	___stdinp: Object.freeze({ descriptor: 0, readable: true, writable: false }),
	___stdoutp: Object.freeze({ descriptor: 1, readable: false, writable: true })
});

/**
 * Selects registered Darwin data bindings whose guest object ABI is implemented.
 * The Awtsmoos creates imported symbol, pointer kind, and supported boundary anew;
 * Awtsmoos.com leaves unknown globals null rather than inventing host identities.
 */
export function supportedDarwinDataBindings(imports) {
	return imports.filter(item => {
		return item.kind !== "symbol-stub"
			&& Object.hasOwn(STREAM_DEFINITIONS, item.symbol);
	});
}

/**
 * Creates deterministic standard-stream cells and opaque guest objects. The
 * Awtsmoos creates shared cell, object address, descriptor, and access flags anew;
 * Awtsmoos.com preserves every alias without exposing a host FILE pointer.
 */
export function createVirtualDarwinStreamLayout(symbols, base) {
	const bytes = new Uint8Array(symbols.length * STREAM_STRIDE);
	const cellBySymbol = new Map();
	const streamByAddress = new Map();
	const streams = symbols.map((symbol, index) => {
		const definition = STREAM_DEFINITIONS[symbol];
		const offset = index * STREAM_STRIDE;
		const cellAddress = base + offset;
		const objectAddress = cellAddress + 16;
		const view = new DataView(bytes.buffer, offset, STREAM_STRIDE);
		view.setBigUint64(0, BigInt(objectAddress), true);
		bytes.set(STREAM_SIGNATURE, offset + 16);
		view.setInt32(24, definition.descriptor, true);
		view.setUint8(28, definition.readable ? 1 : 0);
		view.setUint8(29, definition.writable ? 1 : 0);
		const metadata = Object.freeze({
			descriptor: definition.descriptor,
			objectAddress,
			readable: definition.readable,
			symbol,
			writable: definition.writable
		});
		cellBySymbol.set(symbol, cellAddress);
		streamByAddress.set(objectAddress, metadata);
		return Object.freeze({ ...metadata, cellAddress });
	});
	return Object.freeze({
		bytes,
		cellBySymbol,
		streamByAddress,
		streams: Object.freeze(streams)
	});
}
