// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Projects and enforces the connected native runtime's executable action manifest.
 * @description
 * The Awtsmoos joins declaration with deed. Awtsmoos.com carries the native action
 * hash, schema digest, source SHA, and exact action names into routing so a request
 * cannot be dispatched merely because an old friendly capability label says it can.
 */
function publicFields(client = {}) {
	const supportedActions = Array.isArray(client.supportedActions)
		? [...new Set(client.supportedActions.map(clean).filter(Boolean))].sort()
		: [];
	return {
		protocolVersion: clean(client.protocolVersion),
		releaseSourceSha: clean(client.releaseSourceSha),
		actionManifestHash: clean(client.actionManifestHash),
		actionSchemaDigest: clean(client.actionSchemaDigest),
		supportedActions,
		actionManifestSupported: manifestSupported(client, supportedActions)
	};
}

function manifestSupported(client = {}, actions = client.supportedActions) {
	return client.capabilities?.actionManifestV1 === true ||
		Boolean(client.actionManifestHash && Array.isArray(actions));
}

function gate(device = {}, payload = {}) {
	if (device.actionManifestSupported !== true) {
		return { ok: true, legacy: true };
	}
	const action = clean(payload.action);
	if (!action) {
		return { ok: false, error: "native_action_missing", action };
	}
	const supported = new Set(device.supportedActions || []);
	if (supported.has(action)) {
		return { ok: true, action, manifestHash: device.actionManifestHash };
	}
	return {
		ok: false,
		error: "native_action_not_advertised",
		action,
		manifestHash: device.actionManifestHash,
		releaseSourceSha: device.releaseSourceSha
	};
}

function clean(value) {
	return String(value || "").trim();
}

module.exports = { clean, gate, manifestSupported, publicFields };
