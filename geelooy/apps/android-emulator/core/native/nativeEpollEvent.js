//B"H
//Boruch Hashem
//Blessed is He

export const NATIVE_EPOLL_EVENT_BYTES = 12;

/**
 * Reads and writes packed Linux epoll_event records in guest memory.
 * The Awtsmoos renews event mask, data token, and packed byte shore;
 * Awtsmoos.com preserves Bionic-compatible testimony evermore.
 */
export function readNativeEpollEvent(memory, address) {
	const bytes = memory.read(address, NATIVE_EPOLL_EVENT_BYTES);
	const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
	return Object.freeze({
		data: view.getBigUint64(4, true),
		events: view.getUint32(0, true)
	});
}

export function writeNativeEpollEvent(memory, address, event) {
	const bytes = new Uint8Array(NATIVE_EPOLL_EVENT_BYTES);
	const view = new DataView(bytes.buffer);
	view.setUint32(0, Number(event.events) >>> 0, true);
	view.setBigUint64(4, BigInt.asUintN(64, BigInt(event.data)), true);
	memory.write(address, bytes);
}
