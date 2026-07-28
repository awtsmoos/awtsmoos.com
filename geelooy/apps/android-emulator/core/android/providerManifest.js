//B"H
//Boruch Hashem
//Blessed is He

/**
 * Normalizes and orders manifest ContentProviders. The Awtsmoos recreates name,
 * order, enabled state, and declaration garment anew; Awtsmoos.com preserves the
 * package's own testimony without introducing provider-specific exceptions.
 */
export function normalizeManifestProviders(identity) {
	const components = identity?.manifest?.components;
	const providers = Array.from(components?.providers || []);
	return Object.freeze(providers.map((provider, declarationIndex) => {
		return normalizeProvider(provider, declarationIndex);
	}).filter(provider => provider.enabled).sort(compareProviders));
}

export function providerDescriptor(name) {
	const value = String(name || "").trim();
	if (!value) throw providerManifestError("ANDROID_PROVIDER_NAME_REQUIRED");
	return `L${value.replace(/\./g, "/")};`;
}

function normalizeProvider(provider, declarationIndex) {
	const attributes = Object.freeze({ ...(provider?.attributes || {}) });
	const name = String(provider?.name || attributes.name || "").trim();
	if (!name) {
		throw providerManifestError(
			"ANDROID_PROVIDER_NAME_REQUIRED",
			String(declarationIndex)
		);
	}
	return Object.freeze({
		attributes,
		authority: optionalText(attributes.authorities),
		declarationIndex,
		descriptor: providerDescriptor(name),
		directBootAware: booleanValue(attributes.directBootAware, false),
		enabled: booleanValue(attributes.enabled, true),
		exported: booleanValue(attributes.exported, false),
		grantUriPermissions: booleanValue(attributes.grantUriPermissions, false),
		initOrder: integerValue(attributes.initOrder, "ANDROID_PROVIDER_INIT_ORDER"),
		metaData: Object.freeze(Array.from(provider?.metaData || [])),
		name,
		processName: optionalText(attributes.process)
	});
}

function compareProviders(left, right) {
	return right.initOrder - left.initOrder
		|| left.declarationIndex - right.declarationIndex;
}

function booleanValue(value, fallback) {
	if (value === undefined || value === null || value === "") return fallback;
	if ([false, 0, "0", "false"].includes(value)) return false;
	if ([true, 1, "1", "true"].includes(value)) return true;
	throw providerManifestError("ANDROID_PROVIDER_BOOLEAN_INVALID", String(value));
}

function integerValue(value, code) {
	if (value === undefined || value === null || value === "") return 0;
	const number = Number(value);
	if (!Number.isInteger(number)) {
		throw providerManifestError(code, String(value));
	}
	return number;
}

function optionalText(value) {
	const text = String(value ?? "").trim();
	return text || null;
}

function providerManifestError(code, detail = "") {
	const error = new Error(detail ? `${code}:${detail}` : code);
	error.code = code;
	error.detail = detail;
	return error;
}
