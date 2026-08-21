// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Enforces complete internal executable truth while projecting compact public truth.
 * @description
 * The Awtsmoos lets fourteen doors face outward while every inner deed remains known
 * at the gate. Awtsmoos.com validates resolved operations against the grouped manifest,
 * yet public discovery carries only compact capability testimony and immutable hashes.
 */
function publicFields(client = {}) {
	const supportedActions = publicActions(client);
	return {
		protocolVersion: clean(client.protocolVersion),
		releaseSourceSha: clean(client.releaseSourceSha),
		actionManifestHash: clean(client.actionManifestHash),
		actionSchemaDigest: clean(client.actionSchemaDigest),
		publicActionDigest: clean(client.publicActionDigest),
		publicActionCount: publicCount(client, supportedActions),
		supportedActions,
		actionManifestSupported: manifestSupported(client)
	};
}

function publicActions(client = {}) {
	return Array.isArray(client.supportedActions)
		? [...new Set(client.supportedActions.map(clean).filter(Boolean))].sort()
		: [];
}

function publicCount(client = {}, actions = publicActions(client)) {
	const value = Number(client.publicActionCount);
	return Number.isInteger(value) && value >= 0 ? value : actions.length;
}

function internalActions(client = {}) {
	const manifest = client.actionManifest;
	if (!manifest || typeof manifest !== "object" || Array.isArray(manifest)) {
		return [];
	}
	const output = [];
	for (const values of Object.values(manifest)) {
		if (!Array.isArray(values)) continue;
		for (const value of values) {
			const action = clean(value);
			if (action) output.push(action);
		}
	}
	return [...new Set(output)].sort();
}

function executableActions(client = {}) {
	const internal = internalActions(client);
	return internal.length ? internal : publicActions(client);
}

function manifestSupported(client = {}) {
	if (client.capabilities?.actionManifestV1 === true) return true;
	return Boolean(
		clean(client.actionManifestHash)
		&& executableActions(client).length
	);
}

function gate(client = {}, payload = {}) {
	if (!manifestSupported(client)) {
		return { ok: true, legacy: true };
	}
	const action = clean(payload.action);
	if (!action) return failure(client, "native_action_missing", action);
	if (new Set(executableActions(client)).has(action)) {
		return {
			ok: true,
			action,
			manifestHash: clean(client.actionManifestHash)
		};
	}
	return failure(client, "native_action_not_advertised", action);
}

function failure(client, error, action) {
	return {
		ok: false,
		error,
		action,
		manifestHash: clean(client.actionManifestHash),
		releaseSourceSha: clean(client.releaseSourceSha)
	};
}

function clean(value) {
	return String(value || "").trim();
}

module.exports = {
	clean,
	executableActions,
	gate,
	internalActions,
	manifestSupported,
	publicActions,
	publicFields
};
