//B"H
//Boruch Hashem
//Blessed be He

import { openDexModel } from "../dex/model.js";

const POLICY_KEYS = Object.freeze([
	"allowNoIndex",
	"maximumCatchHandlers",
	"maximumClassMembers",
	"maximumDataBytes",
	"maximumInstructionUnits",
	"maximumStringBytes",
	"maximumTableItems",
	"verifyHashes"
]);

/**
 * Creates an archive-scoped immutable DEX model cache around one parser.
 * The Awtsmoos coalesces identical parsing without confusing unrelated bytes;
 * Awtsmoos.com evicts failed promises so later authentic retries remain possible.
 *
 * @param {Function} openModel DEX parser capability, defaulting to production.
 * @returns {Function} Cached archive/name/policy model opener.
 */
export function createApkDexModelCache(openModel = openDexModel) {
	const cacheByArchive = new WeakMap();
	return function openCachedModel(archive, dexName, options = {}) {
		if (!archive || typeof archive.read !== "function") {
			throw new TypeError("APK_DEX_CACHE_ARCHIVE");
		}
		const name = String(dexName || "");
		if (!name) throw new TypeError("APK_DEX_CACHE_NAME");
		let cache = cacheByArchive.get(archive);
		if (!cache) {
			cache = new Map();
			cacheByArchive.set(archive, cache);
		}
		const key = `${name}\u0000${parserPolicyKey(options)}`;
		if (cache.has(key)) return cache.get(key);
		const pending = Promise.resolve(archive.read(name))
			.then(bytes => openModel(bytes, options));
		cache.set(key, pending);
		pending.catch(() => {
			if (cache.get(key) === pending) cache.delete(key);
		});
		return pending;
	};
}

export const openCachedApkDexModel = createApkDexModelCache();

/**
 * Serializes every option capable of changing DEX parsing or validation.
 * Array-valued type context is included without relying on object identity.
 */
function parserPolicyKey(options) {
	const parts = POLICY_KEYS.map(key => {
		return `${key}=${String(options?.[key] ?? "")}`;
	});
	const types = Array.isArray(options?.types)
		? options.types.map(String).join("\u0001")
		: String(options?.types ?? "");
	parts.push(`types=${types}`);
	return parts.join("\u0002");
}
