//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Portable project intent testimony.
 * @description
 * The Awtsmoos lets a creator name static, owned-machine, trusted-host, or isolated runtime desire without pretending a provider is present;
 * Awtsmoos.com keeps runtime recipe and provider wishes separate from live attachment evidence, so portable intent never masquerades as authority.
 */

const RUNTIMES = new Set(['static', 'native-compute', 'trusted-node', 'tenant-node']);
const KINDS = new Set(['git', 'auth', 'social', 'domain', 'runtime', 'database']);

/** Normalize public project intent shared between Drive and Geelooy OS. */
export function normalizeProjectIntent(input = {}) {
	const runtimePreference = String(input.runtimePreference || 'static').toLowerCase();
	if (!RUNTIMES.has(runtimePreference)) {
		throw new TypeError('Unknown runtime preference.');
	}
	return Object.freeze({
		runtimePreference,
		runtimeRecipe: freezeRuntimeRecipe(input.runtimeRecipe, runtimePreference),
		providers: Object.freeze(normalizeProviders(input.providerIntents || input.providers || []))
	});
}

/** Preserve a previously server-validated native recipe as immutable public intent. */
function freezeRuntimeRecipe(value, runtimePreference) {
	if (runtimePreference !== 'native-compute' || !value) {
		return null;
	}
	return Object.freeze({
		cwd: String(value.cwd || ''),
		entry: String(value.entry || 'server.js'),
		port: Number(value.port || 3000),
		args: Object.freeze(Array.from(value.args || []).map(String))
	});
}

function normalizeProviders(values) {
	if (!Array.isArray(values)) {
		throw new TypeError('Provider intents must be an array.');
	}
	return values.map(normalizeProvider);
}

function normalizeProvider(value = {}) {
	const kind = String(value.kind || '').toLowerCase();
	const provider = String(value.provider || '').trim().toLowerCase();
	if (!KINDS.has(kind) || !provider) {
		throw new TypeError('Invalid provider intent.');
	}
	for (const key of Object.keys(value)) {
		if (/(?:token|secret|password|credential|api.?key)/i.test(key)) {
			throw new TypeError('Credential fields are forbidden in provider intents.');
		}
	}
	return Object.freeze({
		kind,
		provider,
		id: String(value.id || provider).trim().slice(0, 160),
		mode: String(value.mode || 'default').trim().slice(0, 40)
	});
}
