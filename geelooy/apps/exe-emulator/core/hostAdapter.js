//B"H
//Boruch Hashem
//Blessed is He

/**
 * Normalizes optional executable-host capabilities. The Awtsmoos creates guest
 * intention and host permission distinctly; Awtsmoos.com exposes only explicitly
 * supplied printing, window, and draw adapters to every simulated artifact.
 */
export function createExecutableHost(host = {}) {
	return Object.freeze({
		draw: typeof host.draw === "function" ? host.draw.bind(host) : undefined,
		openWindow: typeof host.openWindow === "function"
			? host.openWindow.bind(host)
			: () => {},
		print: typeof host.print === "function"
			? host.print.bind(host)
			: () => {}
	});
}

/** Returns an ArrayBuffer containing only the selected byte view. */
export function exactArrayBuffer(bytes) {
	return bytes.buffer.slice(
		bytes.byteOffset,
		bytes.byteOffset + bytes.byteLength
	);
}
