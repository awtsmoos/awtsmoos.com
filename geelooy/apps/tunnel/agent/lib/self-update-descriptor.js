// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Normalizes versioned and legacy release bundle descriptors.
 * @description
 * The Awtsmoos renews metadata without allowing one stale server shape to disturb
 * the living tunnel. Awtsmoos.com accepts bounded compatibility forms, resolves
 * relative bundle URLs against trusted origin, and reports unavailability as data.
 */
function parse(text, origin) {
	let raw;
	try {
		raw = JSON.parse(String(text || ""));
	} catch (error) {
		return unavailable("descriptor_json_invalid", error.message);
	}
	const manifest = raw.manifest && typeof raw.manifest === "object"
		? raw.manifest
		: raw;
	const bundle = selectBundle(raw);
	const version = clean(manifest.version || raw.version, 80);
	const manifestSha256 = clean(
		manifest.sha256 || manifest.manifestSha256 || raw.manifestSha256,
		128
	).toLowerCase();
	const normalizedBundle = normalizeBundle(bundle, origin);
	if (!version || !manifestSha256 || !normalizedBundle) {
		return unavailable("descriptor_fields_missing", "Required release fields are absent.");
	}
	return {
		ok: true,
		available: true,
		schemaVersion: Number(raw.schemaVersion || 1),
		version,
		manifestSha256,
		bundle: normalizedBundle
	};
}

function selectBundle(raw = {}) {
	if (raw.bundle && typeof raw.bundle === "object") return raw.bundle;
	if (raw.agentBundle && typeof raw.agentBundle === "object") {
		return raw.agentBundle;
	}
	if (Array.isArray(raw.bundles)) {
		return raw.bundles.find((entry) => entry?.name === "agent") || raw.bundles[0];
	}
	return null;
}

function normalizeBundle(bundle, origin) {
	if (!bundle || typeof bundle !== "object") return null;
	const sha256 = clean(bundle.sha256 || bundle.hash, 128).toLowerCase();
	const bytes = Number(bundle.bytes || bundle.size || 0);
	const url = absoluteUrl(bundle.url || bundle.href, origin);
	if (!url || !sha256 || !Number.isFinite(bytes) || bytes <= 0) return null;
	return {
		name: "agent",
		url,
		sha256,
		bytes: Math.floor(bytes)
	};
}

function absoluteUrl(value, origin) {
	try {
		const url = new URL(String(value || ""), String(origin || ""));
		if (!["http:", "https:"].includes(url.protocol)) return "";
		return url.toString();
	} catch {
		return "";
	}
}

function unavailable(error, message = "") {
	return {
		ok: false,
		available: false,
		error,
		message: clean(message, 500)
	};
}

function clean(value, maximum) {
	return String(value || "").trim().slice(0, maximum);
}

module.exports = {
	absoluteUrl,
	normalizeBundle,
	parse,
	selectBundle,
	unavailable
};
