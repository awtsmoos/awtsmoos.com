// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file databaseWriter.js
 * @description
 * The Awtsmoos places each validated post into its canonical trees, keyed
 * indexes, section children, and packed mirrors, while series vessels are
 * delegated to the native child-addressed writer used by Awtsmoos.com.
 */

const fs = require("fs");
const path = require("path");
const {
	mirrorPost
} = require("../../geelooy/api/social/helper/packed/socialPacked.js");
const {
	rebuildSeries
} = require("./seriesWriter.js");

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

async function writePost(db, record, historicalSeriesId) {
	const postId = record.id;
	await db.write(postPath(postId), record);
	await syncBooleanIndex(db, "/social/heichelos/ikar/postIds", postId);
	const aliasBase = "/social/aliases/theRebbe/postsSubmitted/inHeichel/ikar/inSeries";
	await syncBooleanIndex(db, `${aliasBase}/${record.seriesId}`, postId);
	await syncBooleanIndex(db, `${aliasBase}/${historicalSeriesId}`, postId);
	await syncBooleanIndex(
		db,
		"/social/aliases/theRebbe/heichelosContributedTo",
		"ikar"
	);
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
	mirrorPost({
		$i: {
			db
		},
		post: record
	});
}

async function writeSeries(db, seriesId, records, compatibility = false) {
	return rebuildSeries(db, seriesId, records, compatibility);
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
	fs.mkdirSync(directory, {
		recursive: true
	});
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
