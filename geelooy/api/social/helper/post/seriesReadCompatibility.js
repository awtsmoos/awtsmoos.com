// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file seriesReadCompatibility.js
 * @description
 * The Awtsmoos crosses mapped and packed collections without hiding children.
 * Mapped Meluket series use their sealed manifest; ordinary series accept the
 * routed key vessel only when it proves a strict superset of legacy identities.
 */

const { idsForSeries, isMappedSeries } = require("./meluketSeriesMap.js");
const { completeSeriesKeys } = require("./seriesKeyCompleteness.js");

function postsPath(heichelId, seriesId) {
	return `/social/heichelos/${heichelId}/series/${seriesId}/posts`;
}

function richPath(heichelId, postId) {
	return `/social/heichelos/${heichelId}/posts/${postId}.awtsmoosJSON`;
}

function missingPost(result) {
	return !result
		|| Buffer.isBuffer(result)
		|| result?.error?.code === "POST_NOT_FOUND"
		|| result?.error === "POST_NOT_FOUND";
}

function project(record, properties) {
	if (!properties || typeof properties !== "object") return record;
	const output = {};
	for (const [key, enabled] of Object.entries(properties)) {
		if (enabled && Object.prototype.hasOwnProperty.call(record, key)) output[key] = record[key];
	}
	for (const key of ["id", "postId", "title", "seriesId"]) {
		if (record[key] !== undefined) output[key] = record[key];
	}
	return output;
}

async function readMappedPost({ $i, heichelId, seriesId, postId, properties }) {
	const childPath = `${postsPath(heichelId, seriesId)}/${postId}`;
	let record = await $i.db.get(childPath, { max: true }).catch(() => null);
	if (missingPost(record)) {
		record = await $i.db.get(richPath(heichelId, postId), { max: true }).catch(() => null);
	}
	if (missingPost(record)) return null;
	return project(record, properties);
}

async function readRecordsByIds(context, postIds, existing = []) {
	const byId = new Map(existing.map(record => [String(record?.id || record?.postId || ""), record]));
	const records = [];
	for (const postId of postIds) {
		let record = byId.get(postId);
		if (!record) record = await readMappedPost({ ...context, postId });
		if (record) records.push(record);
	}
	return records;
}

async function readMappedPosts(context) {
	const postIds = idsForSeries(context.$i, context.seriesId);
	if (!postIds.length) return null;
	if (!context.withDetails) return postIds;
	return readRecordsByIds(context, postIds);
}

async function readUnmappedPosts(context) {
	const standard = await context.standardReader();
	if (!Array.isArray(standard)) return standard;
	const legacyIds = context.withDetails
		? standard.map(record => record?.id || record?.postId).filter(Boolean)
		: standard;
	const complete = await completeSeriesKeys({ ...context, legacyIds });
	if (!complete.upgraded) return standard;
	if (!context.withDetails) return complete.ids;
	return readRecordsByIds(context, complete.ids, standard);
}

async function readPostsCompatible(context) {
	if (isMappedSeries(context.$i, context.seriesId)) return readMappedPosts(context);
	return readUnmappedPosts(context);
}

async function readPostCompatible(context) {
	if (!isMappedSeries(context.$i, context.seriesId)) return context.standardReader();
	const record = await readMappedPost(context);
	return record || context.standardReader();
}

module.exports = {
	readMappedPost,
	readMappedPosts,
	readPostCompatible,
	readPostsCompatible,
	readRecordsByIds,
	readUnmappedPosts
};
