//B"H
// Boruch Hashem
// Blessed is He
/**
 * @module RebbeApiArchive
 * @description
 * Server-side Archive.org access for the Rebbe sichos API: the same month/day
 * search shards and the same per-year item metadata the front end uses, with
 * in-process caching. Track expansion adds the file sizes and durations that
 * only the Archive.org metadata carries, so agents and bundle builders can
 * plan downloads honestly.
 */

const { MONTH_BUCKET, DAY_BUCKET, SHARD_DIRECT_BASES } = require("./catalog.js");

const AUDIO_RE = /\.(mp3|opus|ogg|wav|m4a|wma|flac)$/i;
const FETCH_TIMEOUT_MS = 20000;

const shardCache = new Map();
const metadataCache = new Map();

/** Strict URI encoding matching the front end's archive URL builder. */
function strictEncode(value) {
	return encodeURIComponent(String(value || ""))
		.replace(/[!'()*]/g, ch => "%" + ch.charCodeAt(0).toString(16).toUpperCase());
}

/** Encodes every segment of an archive-relative path. */
function encodePath(value) {
	return String(value || "").split("/").filter(Boolean).map(strictEncode).join("/");
}

/** Fetches JSON with a hard deadline; throws on non-2xx. */
async function fetchJSON(url, timeoutMs = FETCH_TIMEOUT_MS) {
	const controller = new AbortController();
	const timer = setTimeout(() => controller.abort(), timeoutMs);
	try {
		const res = await fetch(url, { signal: controller.signal, redirect: "follow" });
		if (!res.ok) throw new Error(`Archive transport ${res.status} for ${url}`);
		return await res.json();
	} finally {
		clearTimeout(timer);
	}
}

/** Fetches bytes with a hard deadline; throws on non-2xx. */
async function fetchBuffer(url, timeoutMs = 120000) {
	const controller = new AbortController();
	const timer = setTimeout(() => controller.abort(), timeoutMs);
	try {
		const res = await fetch(url, { signal: controller.signal, redirect: "follow" });
		if (!res.ok) throw new Error(`Archive transport ${res.status} for ${url}`);
		return Buffer.from(await res.arrayBuffer());
	} finally {
		clearTimeout(timer);
	}
}

/**
 * Loads one immutable search shard (month or day index), direct replica
 * first, public Archive.org route as fallback. Cached for the process life.
 * @param {string} bucket Shard item id.
 * @param {number|string} value Month id or day number.
 * @returns {Promise<object[]>} Events in the shard.
 */
async function fetchShard(bucket, value) {
	const key = `${bucket}/${value}.json`;
	if (shardCache.has(key)) return shardCache.get(key);
	const direct = SHARD_DIRECT_BASES[bucket] ? `${SHARD_DIRECT_BASES[bucket]}/${value}.json` : null;
	const standard = `https://archive.org/download/${bucket}/${value}.json`;
	let data = null;
	for (const url of [direct, standard].filter(Boolean)) {
		try { data = await fetchJSON(url, 12000); break; } catch (error) { data = null; }
	}
	const events = data && Array.isArray(data.events) ? data.events : [];
	shardCache.set(key, events);
	return events;
}

/**
 * Loads and caches one Archive.org item's metadata.
 * @param {string} itemId Archive.org item id (event bucket).
 * @returns {Promise<object|null>} Metadata or null when unavailable.
 */
async function fetchMetadata(itemId) {
	if (!itemId) return null;
	if (metadataCache.has(itemId)) return metadataCache.get(itemId);
	const request = fetchJSON(`https://archive.org/metadata/${strictEncode(itemId)}`, 30000)
		.catch(() => null);
	metadataCache.set(itemId, request);
	const meta = await request;
	if (!meta) metadataCache.delete(itemId);
	return meta;
}

/** Human title cleaning, same rules as the front end's cleanArchiveName. */
function cleanName(value) {
	return String(value || "")
		.replace(AUDIO_RE, "")
		.replace(/^BH[_\s-]*\d+[_\s-]*/i, "")
		.replace(/_/g, " ")
		.replace(/\s*-\s*/g, " ")
		.replace(/\s+/g, " ")
		.trim();
}

/**
 * Expands one search event into its downloadable audio tracks, using the
 * item metadata (authoritative, carries size/duration/md5), with the
 * folder index.json as fallback exactly like the front end.
 * @param {object} event Search event {bucket, folder, year}.
 * @returns {Promise<object[]>} Tracks with download URLs and sizes.
 */
async function tracksForEvent(event) {
	const itemId = event.bucket;
	const folder = event.folder;
	if (!itemId || !folder) return [];
	const meta = await fetchMetadata(itemId);
	let rows = [];
	if (meta && Array.isArray(meta.files)) {
		rows = meta.files
			.filter(f => String(f.name || "").startsWith(folder + "/") && AUDIO_RE.test(f.name || ""))
			.map(f => trackFromMetaFile(itemId, folder, f, meta));
	}
	if (!rows.length) {
		rows = await tracksFromFolderIndex(itemId, folder, meta);
	}
	return finalizeTracks(rows);
}

/** Builds one track record from an Archive.org metadata file entry. */
function trackFromMetaFile(itemId, folder, file, meta) {
	const fileName = String(file.name).split("/").pop();
	const directBase = meta && meta.server && meta.dir ? `https://${meta.server}${meta.dir}` : null;
	return {
		title: cleanName(fileName),
		fileName,
		path: `${itemId}/${file.name}`,
		format: String(fileName.split(".").pop() || "").toLowerCase(),
		sourceFormat: file.format || null,
		size: Number(file.size || 0),
		duration: parseFloat(file.length || 0) || 0,
		md5: file.md5 || null,
		downloadUrl: `https://archive.org/download/${strictEncode(itemId)}/${encodePath(file.name)}`,
		directUrl: directBase ? `${directBase}/${encodePath(file.name)}` : null
	};
}

/** Fallback track source: the folder's index.json, as the front end does. */
async function tracksFromFolderIndex(itemId, folder, meta) {
	const bases = [];
	if (meta && meta.server && meta.dir) bases.push(`https://${meta.server}${meta.dir}`);
	bases.push(`https://archive.org/download/${strictEncode(itemId)}`);
	for (const base of bases) {
		try {
			const index = await fetchJSON(`${base}/${encodePath(folder)}/index.json`, 12000);
			if (index && Array.isArray(index.contents)) {
				return index.contents
					.filter(f => f.type === "file" && AUDIO_RE.test(f.name || ""))
					.map(f => trackFromMetaFile(itemId, folder, {
						name: `${folder}/${f.name}`,
						size: f.size || 0,
						length: f.length || f.duration || 0
					}, meta));
			}
		} catch (error) { /* try next base */ }
	}
	return [];
}

/** Deduplicates by cleaned title and sorts by path, like the front end. */
function finalizeTracks(rows) {
	const seen = new Set();
	const out = [];
	for (const track of rows) {
		const key = track.title.toLowerCase();
		if (seen.has(key)) continue;
		seen.add(key);
		out.push(track);
	}
	return out.sort((a, b) => a.path.localeCompare(b.path));
}

module.exports = {
	AUDIO_RE,
	strictEncode,
	encodePath,
	fetchJSON,
	fetchBuffer,
	fetchShard,
	fetchMetadata,
	cleanName,
	tracksForEvent
};
