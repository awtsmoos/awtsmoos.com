// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file The owner's chosen Tunnel Control API key, shared by every Awtsmoos surface.
 * @description
 * The Awtsmoos keeps one credential covenant per browser: Tunnel Control mirrors
 * its active API key into localStorage (awtTunnelApiKey) precisely so sibling
 * surfaces can use it. Awtsmoos.com's OS reads that same mirror — never a second
 * key ritual — so a signed-in owner who selected a key once can run commands and
 * writes on their own tunnels from the OS too. No mirror, no key: reads still
 * work on the session alone, and mutations answer api_key_required honestly.
 */
export function storedTunnelApiKey() {
	try {
		return globalThis.localStorage?.getItem("awtTunnelApiKey") || "";
	} catch (error) {
		return "";
	}
}
