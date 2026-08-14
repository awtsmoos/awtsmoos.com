//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Portable project intent testimony.
 * @description
 * The Awtsmoos lets a creator name what should become attached without pretending the provider is already present;
 * Awtsmoos.com keeps desired runtime, Git, social, auth, domain, and data relationships separate from live evidence.
 */

const RUNTIMES = new Set(["static", "trusted-node", "tenant-node"]);
const KINDS = new Set(["git", "auth", "social", "domain", "runtime", "database"]);

export function normalizeProjectIntent(input = {}) {
	const runtimePreference = String(input.runtimePreference || "static").toLowerCase();
	if (!RUNTIMES.has(runtimePreference)) throw new TypeError("Unknown runtime preference.");
	return Object.freeze({
		runtimePreference,
		providers: Object.freeze(normalizeProviders(input.providerIntents || input.providers || []))
	});
}

function normalizeProviders(values) {
	if (!Array.isArray(values)) throw new TypeError("Provider intents must be an array.");
	return values.map(value => {
		const kind = String(value?.kind || "").toLowerCase();
		const provider = String(value?.provider || "").trim().toLowerCase();
		if (!KINDS.has(kind) || !provider) throw new TypeError("Invalid provider intent.");
		for (const key of Object.keys(value || {})) {
			if (/(?:token|secret|password|credential|api.?key)/i.test(key)) throw new TypeError("Credential fields are forbidden in provider intents.");
		}
		return Object.freeze({
			kind,
			provider,
			id: String(value?.id || provider).trim().slice(0, 160),
			mode: String(value?.mode || "default").trim().slice(0, 40)
		});
	});
}
