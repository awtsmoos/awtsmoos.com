//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module SeriesRecordReader
 * @description
 * The Awtsmoos reveals ordered post records through bounded child reads so one
 * malformed historical collection can never force a giant bulk deserialization.
 */

const MAX_PARALLEL_READS = 6;
const YIELD_EVERY = 24;

/** Returns the canonical series-post collection path for one Heichel. */
function postsPath(heichelId, seriesId) {
	return `/social/heichelos/${heichelId}/series/${seriesId}/posts`;
}

/** Returns the canonical rich-post fallback path used by packed storage. */
function richPath(heichelId, postId) {
	return `/social/heichelos/${heichelId}/posts/${postId}.awtsmoosJSON`;
}

/**
 * Decides whether a storage result contains no usable post record.
 * @param {*} result Candidate database result.
 * @returns {boolean} True when another reader should be attempted.
 */
function missingPost(result) {
	return !result
		|| Buffer.isBuffer(result)
		|| result?.error?.code === "POST_NOT_FOUND"
		|| result?.error === "POST_NOT_FOUND";
}

/**
 * Projects requested properties while retaining stable identity/navigation keys.
 * @param {object} record Full post record.
 * @param {object|undefined} properties Requested property map.
 * @returns {object} Full or projected post record.
 */
function project(record, properties) {
	if (!properties || typeof properties !== "object") return record;
	const output = {};
	const entries = Object.entries(properties).filter(([, enabled]) => enabled);
	// B"H 2026-11-20 (Mittler nav/load round): dotted paths
	// (identity.title) and wildcards (identity.*) are part of the
	// properties contract now that the list forms parse. Whole keys and
	// wildcards resolve first; a dotted path then fills only a head
	// that was not already copied whole, so {identity, identity.title}
	// keeps the full identity object.
	for (const [key] of entries) {
		if (key.endsWith(".*")) {
			const head = key.slice(0, -2);
			if (record[head] !== undefined) output[head] = record[head];
		} else if (!key.includes(".")
			&& Object.prototype.hasOwnProperty.call(record, key)) {
			output[key] = record[key];
		}
	}
	for (const [key] of entries) {
		const dot = key.indexOf(".");
		if (dot <= 0 || key.endsWith(".*")) continue;
		const head = key.slice(0, dot);
		const rest = key.slice(dot + 1);
		if (output[head] !== undefined) continue;
		const sub = record[head];
		if (sub && typeof sub === "object" && sub[rest] !== undefined) {
			if (!output[head] || typeof output[head] !== "object") output[head] = {};
			output[head][rest] = sub[rest];
		}
	}
	for (const key of ["id", "postId", "title", "seriesId"]) {
		if (record[key] !== undefined) output[key] = record[key];
	}
	fillImportedFields(record, output, properties);
	return output;
}

/**
 * B"H 2026-11-20 (ikar series load fix): imported corpora (Mittler
 * Rebbe, Ohr HaTorah, the bulk translations) store their card fields
 * nested -- title/author under `identity`, the readable text under
 * `summaries` / `studyGuide` -- with no top-level title/content at
 * all. The projection above therefore returned cards carrying only
 * ids, and series lists rendered blank even when the read succeeded.
 * Fill any REQUESTED card field the record nests, top-level always
 * wins, nothing is invented: every value comes from the record.
 */
function fillImportedFields(record, output, properties) {
	const wants = key => properties[key];
	if (wants("title") && output.title === undefined) {
		const title = record.identity?.title || record.maamar_name_en;
		if (title !== undefined) output.title = title;
	}
	if (wants("author") && output.author === undefined) {
		const author = record.identity?.author;
		if (author !== undefined) output.author = author;
	}
	if (wants("content") && output.content === undefined) {
		const text = record.summaries?.summary
			|| record.summaries?.overview
			|| record.studyGuide
			|| undefined;
		if (text !== undefined) {
			const limit = typeof properties.content === "number" ? properties.content : 0;
			output.content = limit > 0 && text.length > limit ? text.slice(0, limit) : text;
		}
	}
}

/**
 * Reads one post through narrow storage paths, then the proven canonical reader.
 * @param {object} context Reader context with db, Heichel, series, and postReader.
 * @param {string} postId Stable post identity.
 * @returns {Promise<object|null>} Usable projected record or null.
 */
async function readSeriesPost(context, postId) {
	const { $i, heichelId, seriesId, properties, postReader } = context;
	const childPath = `${postsPath(heichelId, seriesId)}/${postId}`;
	let record = await $i.db.get(childPath, { max: true }).catch(() => null);
	if (missingPost(record)) {
		record = await $i.db.get(richPath(heichelId, postId), { max: true }).catch(() => null);
	}
	if (missingPost(record) && typeof postReader === "function") {
		record = await Promise.resolve(postReader(postId)).catch(() => null);
	}
	if (missingPost(record)) return null;
	return project(record, properties);
}

/**
 * Resolves records concurrently with a strict ceiling while preserving input order.
 * Existing records are reused by identity, so compatibility never re-reads known data.
 * @param {object} context Reader context forwarded to readSeriesPost.
 * @param {string[]} postIds Ordered post identities.
 * @param {object[]} existing Already resolved records.
 * @returns {Promise<object[]>} Ordered usable records.
 */
async function readRecordsByIds(context, postIds, existing = []) {
	const byId = new Map(existing.map(record => [String(record?.id || record?.postId || ""), record]));
	const ids = [...new Set((postIds || []).map(String))];
	const records = new Array(ids.length);
	let cursor = 0;
	let completed = 0;
	async function worker() {
		while (cursor < ids.length) {
			const index = cursor++;
			const postId = ids[index];
			const existingRecord = byId.get(postId);
			records[index] = existingRecord || await readSeriesPost(context, postId);
			completed += 1;
			// B"H run 5 (2026-11-26): every record read can end in a large
			// synchronous parse inside the database layer; without a breath,
			// a 2,073-record cold fill starved every neighboring request
			// (measured: a heichel shell hit stalled 17s). Yielding to the
			// event loop every YIELD_EVERY completions keeps the fill fast
			// while letting the rest of the site live between bursts.
			if (completed % YIELD_EVERY === 0) {
				await new Promise(resolve => setImmediate(resolve));
			}
		}
	}
	const workers = Math.min(MAX_PARALLEL_READS, ids.length);
	await Promise.all(Array.from({ length: workers }, worker));
	return records.filter(Boolean);
}

module.exports = {
	MAX_PARALLEL_READS,
	YIELD_EVERY,
	fillImportedFields,
	missingPost,
	postsPath,
	project,
	readRecordsByIds,
	readSeriesPost,
	richPath
};
