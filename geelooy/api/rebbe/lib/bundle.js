//B"H
// Boruch Hashem
// Blessed is He
/**
 * @module RebbeApiBundle
 * @description
 * Bundles are stateless, self-describing vessels: the bundle id is a
 * base64url encoding of the normalized search request, so any bundle link
 * an agent hands to a user works forever with no server-side storage.
 * The manifest re-runs the search and expands every event into its tracks;
 * the server ZIP route assembles the same manifest into one stored ZIP
 * (MP3 does not compress, matching the front end's own zip-store writer).
 */

const { normalizeQuery, searchEvents, serializeEvent, eventKey } = require("./search.js");
const { tracksForEvent, fetchBuffer, strictEncode } = require("./archive.js");

/** Hard caps: bundles stay honest instead of silently truncating. */
const MAX_BUNDLE_EVENTS = 120;
const MAX_ZIP_TRACKS = 300;
const MAX_ZIP_BYTES = 400 * 1024 * 1024;

/**
 * Creates a bundle id from raw search params.
 * @param {object} raw Raw search params (same vocabulary as /search).
 * @param {string} [title] Optional human title for the bundle.
 * @returns {{id:string, request:object}} Bundle id and normalized request.
 */
function createBundleId(raw = {}, title) {
	const request = normalizeQuery(raw);
	const payload = {
		v: 1,
		q: {
			years: request.years,
			months: request.months,
			days: request.days,
			keyword: request.keyword
		},
		title: title ? String(title).slice(0, 120) : ""
	};
	const id = Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
	return { id, request };
}

/**
 * Decodes and validates a bundle id.
 * @param {string} id Bundle id from the URL.
 * @returns {{request:object, title:string}} Normalized request and title.
 * @throws {Error} With .status 400 on any malformed id.
 */
function decodeBundleId(id) {
	try {
		const payload = JSON.parse(Buffer.from(String(id || ""), "base64url").toString("utf8"));
		if (!payload || payload.v !== 1 || typeof payload.q !== "object") throw new Error("shape");
		const q = payload.q;
		const request = {
			years: Array.isArray(q.years) ? q.years.map(String) : [],
			months: Array.isArray(q.months) ? q.months.map(Number).filter(Number.isFinite) : [],
			days: Array.isArray(q.days) ? q.days.map(Number).filter(Number.isFinite) : [],
			keyword: String(q.keyword || ""),
			limit: 50,
			offset: 0,
			includeTracks: false
		};
		return { request, title: String(payload.title || "") };
	} catch (error) {
		const err = new Error("Invalid bundle id.");
		err.status = 400;
		err.code = "INVALID_BUNDLE_ID";
		throw err;
	}
}

/** Default human title for a bundle from its request. */
function defaultTitle(request) {
	const parts = [];
	if (request.keyword) parts.push(`"${request.keyword}"`);
	if (request.months.length) parts.push(`month ${request.months.join(",")}`);
	if (request.days.length) parts.push(`day ${request.days.join(",")}`);
	if (request.years.length) parts.push(`year ${request.years.join(",")}`);
	return parts.length ? `Sichos — ${parts.join(" · ")}` : "Sichos — full archive selection";
}

/**
 * Builds the full bundle manifest: search, cap honestly, expand tracks.
 * @param {string} id Bundle id.
 * @param {string} base Public API base path.
 * @returns {Promise<object>} Manifest with events, files and totals.
 */
async function buildManifest(id, base) {
	const { request, title } = decodeBundleId(id);
	const all = await searchEvents(request);
	const capped = all.slice(0, MAX_BUNDLE_EVENTS);
	const events = [];
	const files = [];
	let totalBytes = 0;
	let totalDuration = 0;
	for (const event of capped) {
		const tracks = await tracksForEvent(event);
		const record = serializeEvent(event, base);
		record.trackCount = tracks.length;
		record.totalBytes = tracks.reduce((s, t) => s + (t.size || 0), 0);
		record.tracks = tracks;
		events.push(record);
		for (const track of tracks) {
			totalBytes += track.size || 0;
			totalDuration += track.duration || 0;
			files.push({
				eventId: eventKey(event),
				eventTitle: event.title || "",
				dateLabel: record.dateLabel,
				name: track.fileName,
				entryName: `${safeFolder(event.folder)}/${track.fileName}`,
				size: track.size || 0,
				duration: track.duration || 0,
				format: track.format,
				sourceFormat: track.sourceFormat || null,
				downloadUrl: track.downloadUrl,
				directUrl: track.directUrl
			});
		}
	}
	return {
		bundleId: id,
		title: title || defaultTitle(request),
		request,
		eventCount: events.length,
		totalEvents: all.length,
		truncated: all.length > capped.length,
		maxBundleEvents: MAX_BUNDLE_EVENTS,
		trackCount: files.length,
		totalBytes,
		totalDurationSeconds: Math.round(totalDuration),
		events,
		files,
		links: bundleLinks(id, base)
	};
}

/** All public links for one bundle id. */
function bundleLinks(id, base) {
	const q = `id=${encodeURIComponent(id)}`;
	return {
		pageUrl: `${base}/bundle/page?${q}`,
		zipUrl: `${base}/bundle/zip?${q}`,
		mergeUrl: `${base}/bundle/page?${q}&action=merge`,
		mergeDownloadUrl: `${base}/bundle/merge?${q}`,
		manifestUrl: `${base}/bundle/data?${q}`
	};
}

/**
 * Assembles the bundle as one merged MP3 on the server: every file is
 * fetched, then frames are joined losslessly by the tolerant joiner
 * (lib/mp3join.js), which resyncs past isolated corrupt headers that the
 * front end's strict joiner rejects outright.
 * @param {object} manifest Manifest from buildManifest.
 * @returns {Promise<{buffer: Buffer, profile: string, frameCount: number, skippedBytes: number}>}
 * @throws {Error} 413 over caps; 422 when a segment is not MP3 or profiles differ.
 */
async function buildMergedBuffer(manifest) {
	if (manifest.trackCount > MAX_ZIP_TRACKS || manifest.totalBytes > MAX_ZIP_BYTES) {
		const err = new Error(
			`Bundle is ${manifest.trackCount} files / ${manifest.totalBytes} bytes; ` +
			`server merge is capped at ${MAX_ZIP_TRACKS} files / ${MAX_ZIP_BYTES} bytes. ` +
			`Use the bundle page: ${manifest.links.pageUrl}`
		);
		err.status = 413;
		err.code = "BUNDLE_TOO_LARGE_FOR_SERVER_MERGE";
		throw err;
	}
	const { joinMp3Buffers } = require("./mp3join.js");
	const segments = [];
	for (const file of manifest.files) {
		let data = null;
		let lastError = null;
		for (const url of [file.directUrl, file.downloadUrl].filter(Boolean)) {
			try { data = await fetchBuffer(url); break; } catch (error) { lastError = error; }
		}
		if (!data) throw lastError || new Error(`Could not fetch ${file.entryName}`);
		segments.push(data);
	}
	return joinMp3Buffers(segments);
}

/** Filesystem-safe folder name for ZIP entries. */
function safeFolder(name) {
	return String(name || "event").replace(/[\\/:*?"<>|]+/g, "-").replace(/\s+/g, " ").trim().slice(0, 140) || "event";
}

/**
 * Assembles the bundle ZIP on the server (stored, no compression).
 * @param {object} manifest Manifest from buildManifest.
 * @returns {Promise<Buffer>} ZIP bytes.
 * @throws {Error} With .status 413 when the bundle exceeds server ZIP caps.
 */
async function buildZipBuffer(manifest) {
	if (manifest.trackCount > MAX_ZIP_TRACKS || manifest.totalBytes > MAX_ZIP_BYTES) {
		const err = new Error(
			`Bundle is ${manifest.trackCount} files / ${manifest.totalBytes} bytes; ` +
			`server ZIP is capped at ${MAX_ZIP_TRACKS} files / ${MAX_ZIP_BYTES} bytes. ` +
			`Use the bundle page, which zips in the browser: ${manifest.links.pageUrl}`
		);
		err.status = 413;
		err.code = "BUNDLE_TOO_LARGE_FOR_SERVER_ZIP";
		throw err;
	}
	const entries = [];
	entries.push({
		name: "manifest.json",
		data: Buffer.from(JSON.stringify({
			title: manifest.title,
			generatedAt: new Date().toISOString(),
			eventCount: manifest.eventCount,
			trackCount: manifest.trackCount,
			files: manifest.files.map(f => ({ name: f.entryName, event: f.eventTitle, size: f.size, source: f.downloadUrl }))
		}, null, 2), "utf8")
	});
	for (const file of manifest.files) {
		let data = null;
		let lastError = null;
		for (const url of [file.directUrl, file.downloadUrl].filter(Boolean)) {
			try { data = await fetchBuffer(url); break; } catch (error) { lastError = error; }
		}
		if (!data) throw lastError || new Error(`Could not fetch ${file.entryName}`);
		entries.push({ name: file.entryName, data });
	}
	return makeStoredZip(entries);
}

/** Minimal stored-ZIP writer (Node port of the front end's zip-store). */
function makeStoredZip(entries) {
	const localParts = [];
	const centralParts = [];
	let offset = 0;
	for (const entry of entries) {
		const name = Buffer.from(entry.name, "utf8");
		const crc = crc32(entry.data);
		const local = Buffer.alloc(30);
		local.writeUInt32LE(0x04034b50, 0);
		local.writeUInt16LE(20, 4);
		local.writeUInt16LE(0x0800, 6); // UTF-8 filename flag
		local.writeUInt32LE(crc, 14);
		local.writeUInt32LE(entry.data.length, 18);
		local.writeUInt32LE(entry.data.length, 22);
		local.writeUInt16LE(name.length, 26);
		localParts.push(local, name, entry.data);
		const central = Buffer.alloc(46);
		central.writeUInt32LE(0x02014b50, 0);
		central.writeUInt16LE(20, 4);
		central.writeUInt16LE(20, 6);
		central.writeUInt16LE(0x0800, 8); // UTF-8 filename flag
		central.writeUInt32LE(crc, 16);
		central.writeUInt32LE(entry.data.length, 20);
		central.writeUInt32LE(entry.data.length, 24);
		central.writeUInt16LE(name.length, 28);
		central.writeUInt32LE(offset, 42);
		centralParts.push(central, name);
		offset += local.length + name.length + entry.data.length;
	}
	const centralSize = centralParts.reduce((s, b) => s + b.length, 0);
	const end = Buffer.alloc(22);
	end.writeUInt32LE(0x06054b50, 0);
	end.writeUInt16LE(entries.length, 8);
	end.writeUInt16LE(entries.length, 10);
	end.writeUInt32LE(centralSize, 12);
	end.writeUInt32LE(offset, 16);
	return Buffer.concat([...localParts, ...centralParts, end]);
}

const crcTable = Array.from({ length: 256 }, (_, n) => {
	let c = n;
	for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
	return c >>> 0;
});

/** CRC-32 of a buffer, same table algorithm as the front end. */
function crc32(buffer) {
	let crc = 0xffffffff;
	for (const byte of buffer) crc = crcTable[(crc ^ byte) & 0xff] ^ (crc >>> 8);
	return (crc ^ 0xffffffff) >>> 0;
}

module.exports = {
	MAX_BUNDLE_EVENTS,
	MAX_ZIP_TRACKS,
	MAX_ZIP_BYTES,
	createBundleId,
	decodeBundleId,
	buildManifest,
	bundleLinks,
	buildZipBuffer,
	buildMergedBuffer,
	makeStoredZip
};
