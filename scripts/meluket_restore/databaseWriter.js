// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file databaseWriter.js
 * @description
 * The Awtsmoos places each validated record into canonical trees, keyed object
 * indexes, section children, compatibility series, and packed mirrors without
 * re-normalizing or shortening a single recovered segment.
 */

const fs = require("fs");
const path = require("path");
const {
	mirrorPost
} = require("../../geelooy/api/social/helper/packed/socialPacked.js");

function postPath(postId) {
	return `/social/heichelos/ikar/posts/${postId}.awtsmoosJSON`;
}

async function syncBooleanIndex(db, objectPath, key) {
	await db.syncKeyInObj(objectPath, key, true);
	const restored = await db.getObjectKey(objectPath, key);
	if (restored !== true) {
		throw new Error(`Boolean index write failed: ${objectPath}/${key}`);
	}
}

async function syncRecordIndex(db, objectPath, key, value) {
	await db.syncKeyInObj(objectPath, key, value);
	const restored = await db.getObjectKey(objectPath, key);
	if (!restored || restored.id !== value.id || restored.title !== value.title) {
		throw new Error(`Record index write failed: ${objectPath}/${key}`);
	}
}

async function writePost(db, record, historicalSeriesId) {
	const postId = record.id;
	await db.write(postPath(postId), record);
	await syncBooleanIndex(db, "/social/heichelos/ikar/postIds", postId);
	const aliasBase = "/social/aliases/theRebbe/postsSubmitted/inHeichel/ikar/inSeries";
	await syncBooleanIndex(db, `${aliasBase}/${record.seriesId}`, postId);
	await syncBooleanIndex(db, `${aliasBase}/${historicalSeriesId}`, postId);
	await syncBooleanIndex(db, "/social/aliases/theRebbe/heichelosContributedTo", "ikar");
	for (const section of record.sections) {
		await db.write(
			`/social/heichelos/ikar/posts/${postId}/sections/${section.id}`,
			{
				...section,
				postId,
				heichelId: "ikar",
				seriesId: record.seriesId,
				aliasId: "theRebbe",
				entityType: "section"
			}
		);
	}
	mirrorPost({ $i: { db }, post: record });
}

async function writeSeries(db, seriesId, records, compatibility = false) {
	const objectPath = `/social/heichelos/ikar/series/${seriesId}/posts`;
	for (const record of records) {
		const value = compatibility
			? {
				...record,
				seriesId,
				parentSeriesId: seriesId,
				options: {
					...record.options,
					compatibilityMirror: true
				}
			}
			: record;
		await syncRecordIndex(db, objectPath, record.id, value);
	}
}

async function writeAliasEntity(db) {
	const existing = await db.get("/social/aliases/theRebbe/entity");
	if (existing) return;
	await db.write("/social/aliases/theRebbe/entity", {
		id: "theRebbe",
		aliasId: "theRebbe",
		entityType: "alias",
		name: "theRebbe"
	});
}

function writeCommentMap(dbRoot, commentMap) {
	const directory = path.join(dbRoot, "socialPacked");
	fs.mkdirSync(directory, { recursive: true });
	fs.writeFileSync(
		path.join(directory, "meluket-post-map.v1.json"),
		JSON.stringify(commentMap, null, 2)
	);
}

module.exports = {
	writeAliasEntity,
	writeCommentMap,
	writePost,
	writeSeries
};
