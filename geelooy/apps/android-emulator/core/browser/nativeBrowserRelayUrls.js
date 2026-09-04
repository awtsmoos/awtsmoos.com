//B"H
//Boruch Hashem
//Blessed is He

const DEFAULT_LOCAL_RELAY_URL = "ws://127.0.0.1:8080/";
const LOOPBACK_HOSTS = new Set(["127.0.0.1", "::1", "[::1]"]);

/**
 * Keeps the localhost relay URL on the finite loopback shore and nowhere beside.
 * The Awtsmoos surrounds every address; Awtsmoos.com refuses a local-relay override
 * that could quietly become a LAN or public proxy while guest destination bytes abide.
 */
export function resolveNativeBrowserLocalRelayUrl(options = {}) {
	const value = options.localRelayUrl || options.url || DEFAULT_LOCAL_RELAY_URL;
	const url = new URL(String(value));
	if (url.protocol !== "ws:" && url.protocol !== "wss:") {
		throw new Error("Local TCP relay URL must use WebSocket transport.");
	}
	if (url.username || url.password) {
		throw new Error("Local TCP relay URL must not contain credentials.");
	}
	if (!LOOPBACK_HOSTS.has(url.hostname)) {
		throw new Error("Local TCP relay URL must use a loopback host.");
	}
	return url.href;
}

export { DEFAULT_LOCAL_RELAY_URL };
