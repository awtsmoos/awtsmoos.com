// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file seriesReadCompatibility.js
 * @description
 * The Awtsmoos crosses a broken parent collection without denying the living
 * children beneath it. Mapped Meluket series enumerate every sealed identity,
 * then read full posts from their legacy child vessel or canonical rich mirror.
 */

const {
	idsForSeries,
	isMappedSeries
} = require("./meluketSeriesMap.js");

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
		if (enabled && Object.prototype.hasOwnProperty.call(record, key)) {
			output[key] = record[key];
		}
	}
	for (const key of ["id", "postId", "title", "seriesId"]) {
		if (record[key] !== undefined) output[key] = record[key];
	}
	return output;
}

async function readMappedPost({
	$i,
	heichelId,
	seriesId,
	postId,
	properties
}) {
	const childPath = `${postsPath(heichelId, seriesId)}/${postId}`;
	let record = await $i.db.get(childPath, {
		max: true
	}).catch(() => null);
	if (missingPost(record)) {
		record = await $i.db.get(richPath(heichelId, postId), {
			max: true
		}).catch(() => null);
	}
	if (missingPost(record)) return null;
	return project(record, properties);
}

async function readMappedPosts({
	$i,
	heichelId,
	seriesId,
	withDetails,
	properties
}) {
	const postIds = idsForSeries($i, seriesId);
	if (!postIds.length) return null;
	if (!withDetails) return postIds;
	const records = [];
	for (const postId of postIds) {
		const record = await readMappedPost({
			$i,
			heichelId,
			seriesId,
			postId,
			properties
		});
		if (record) records.push(record);
	}
	return records;
}

async function readPostsCompatible({
	$i,
	heichelId,
	seriesId,
	withDetails,
	properties,
	standardReader
}) {
	if (isMappedSeries($i, seriesId)) {
		return readMappedPosts({
			$i,
			heichelId,
			seriesId,
			withDetails,
			properties
		});
	}
	return standardReader();
}

async function readPostCompatible({
	$i,
	heichelId,
	seriesId,
	postId,
	properties,
	standardReader
}) {
	if (!isMappedSeries($i, seriesId)) return standardReader();
	const record = await readMappedPost({
		$i,
		heichelId,
		seriesId,
		postId,
		properties
	});
	return record || standardReader();
}

module.exports = {
	readMappedPost,
	readMappedPosts,
	readPostCompatible,
	readPostsCompatible
};
