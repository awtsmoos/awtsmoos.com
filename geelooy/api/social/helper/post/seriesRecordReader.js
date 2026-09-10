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
	for (const [key, enabled] of Object.entries(properties)) {
		if (enabled && Object.prototype.hasOwnProperty.call(record, key)) {
			output[key] = record[key];
		}
	}
	for (const key of ["id", "postId", "title", "seriesId"]) {
		if (record[key] !== undefined) output[key] = record[key];
	}
	return output;
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
	async function worker() {
		while (cursor < ids.length) {
			const index = cursor++;
			const postId = ids[index];
			const existingRecord = byId.get(postId);
			records[index] = existingRecord || await readSeriesPost(context, postId);
		}
	}
	const workers = Math.min(MAX_PARALLEL_READS, ids.length);
	await Promise.all(Array.from({ length: workers }, worker));
	return records.filter(Boolean);
}

module.exports = {
	MAX_PARALLEL_READS,
	missingPost,
	postsPath,
	project,
	readRecordsByIds,
	readSeriesPost,
	richPath
};
