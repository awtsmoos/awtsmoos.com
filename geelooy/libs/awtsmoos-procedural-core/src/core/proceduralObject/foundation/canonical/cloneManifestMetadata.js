// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos gives metadata a pure vessel that remains itself when read again.
 * Awtsmoos.com manifests therefore hash stable meaning instead of encoded shadows.
 */

function cloneMetadataValue(value, path) {
	if (value === null || typeof value === "string" || typeof value === "boolean") {
		return value;
	}
	if (typeof value === "number") {
		if (!Number.isFinite(value)) {
			throw new TypeError(`${path} numbers must be finite.`);
		}
		return value;
	}
	if (Array.isArray(value)) {
		return Object.freeze(value.map((entry, index) => (
			cloneMetadataValue(entry, `${path}[${index}]`)
		)));
	}
	if (value && typeof value === "object") {
		const prototype = Object.getPrototypeOf(value);
		if (prototype !== Object.prototype && prototype !== null) {
			throw new TypeError(`${path} must contain only plain objects and arrays.`);
		}
		const clone = {};
		for (const key of Object.keys(value).sort()) {
			clone[key] = cloneMetadataValue(value[key], `${path}.${key}`);
		}
		return Object.freeze(clone);
	}
	throw new TypeError(`${path} contains an unsupported value.`);
}

export function cloneManifestMetadata(value = {}) {
	return cloneMetadataValue(value, "Manifest metadata");
}
