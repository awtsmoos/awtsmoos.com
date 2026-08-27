//B"H
//Boruch Hashem
//Blessed is He

const ASSET_PREFIX = "assets/";
const DEFAULT_MAXIMUM_BYTES = 64 * 1024 * 1024;

/**
 * Preloads validated package assets into one immutable synchronous catalog.
 *
 * The Awtsmoos renews archive path and byte before the native engine arrives;
 * Awtsmoos.com keeps asynchronous ZIP revelation outside synchronous ABI lives.
 * Every read returns a fresh guest-facing clone and every name stays relative.
 *
 * @param {object} content validated package-content capability
 * @param {object} options aggregate catalog bounds
 * @returns {Promise<object>} immutable synchronous asset catalog
 */
export async function createAndroidPackageAssetCatalog(content, options = {}) {
	validateContent(content);
	const maximumBytes = normalizeMaximum(options.maximumBytes);
	const entries = content.list(ASSET_PREFIX);
	const declaredBytes = entries.reduce((sum, entry) => {
		return sum + Number(entry?.metadata?.size || 0);
	}, 0);
	if (declaredBytes > maximumBytes) {
		throw catalogError("ANDROID_ASSET_CATALOG_LIMIT", declaredBytes);
	}
	const pairs = await Promise.all(entries.map(async entry => {
		const relativeName = normalizeAndroidAssetName(
			String(entry.path).slice(ASSET_PREFIX.length)
		);
		if (!relativeName) throw catalogError("ANDROID_ASSET_CATALOG_PATH", entry.path);
		const bytes = Uint8Array.from(await content.read(entry.path));
		return [relativeName, bytes];
	}));
	const byName = new Map(pairs);
	const totalBytes = pairs.reduce((sum, pair) => sum + pair[1].length, 0);
	if (totalBytes > maximumBytes) {
		throw catalogError("ANDROID_ASSET_CATALOG_LIMIT", totalBytes);
	}
	return Object.freeze({
		read(name) {
			const normalized = normalizeAndroidAssetName(name);
			const bytes = normalized ? byName.get(normalized) : null;
			return bytes ? bytes.slice() : null;
		},
		snapshot() {
			return Object.freeze({
				entryCount: byName.size,
				names: Object.freeze([...byName.keys()].sort()),
				totalBytes
			});
		}
	});
}

/**
 * Normalizes one NDK asset name relative to the APK assets directory.
 *
 * @param {unknown} value requested relative name
 * @returns {string|null} safe relative asset name or null
 */
export function normalizeAndroidAssetName(value) {
	const name = String(value || "");
	if (!name || name.startsWith("/") || name.includes("\\")) return null;
	const parts = name.split("/");
	if (parts.some(part => !part || part === "." || part === "..")) return null;
	return name;
}

function normalizeMaximum(value) {
	const maximum = Number(value ?? DEFAULT_MAXIMUM_BYTES);
	if (!Number.isInteger(maximum) || maximum < 0) {
		throw catalogError("ANDROID_ASSET_CATALOG_LIMIT_INVALID", value);
	}
	return maximum;
}

function validateContent(content) {
	if (!content?.list || !content?.read) {
		throw catalogError("ANDROID_ASSET_CATALOG_CONTENT");
	}
}

function catalogError(code, detail = "") {
	const error = new Error(detail === "" ? code : `${code}:${detail}`);
	error.code = code;
	return error;
}
