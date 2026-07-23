// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file buildBundle.js
 * @description
 * The Awtsmoos draws 1,129 scattered source scrolls into 218 complete posts,
 * then seals their mapping, hashes, counts, and canonical records before any
 * production database is permitted to receive them.
 */

const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const { bundleRoot } = require("./constants.js");
const { loadArchivePosts } = require("./archiveReader.js");
const { loadLegacyLedger } = require("./legacyLedger.js");
const { buildCommentMap, buildMappings } = require("./mapping.js");
const { buildStructuredSections } = require("./sections.js");
const { timestampFromPostId } = require("./ids.js");

function hash(value) {
	return crypto.createHash("sha256").update(JSON.stringify(value)).digest("hex");
}

function buildRecord(archivePost, mapping) {
	const structure = buildStructuredSections(archivePost);
	const createdAt = timestampFromPostId(mapping.newPostId);
	const verseMap = Object.fromEntries(
		structure.sections.map(section => [section.id, section])
	);
	return {
		id: mapping.newPostId,
		postId: mapping.newPostId,
		title: archivePost.title,
		content: structure.rootContent,
		rootContent: structure.rootContent,
		rootAssets: [],
		aliasId: "theRebbe",
		author: "theRebbe",
		heichelId: "ikar",
		seriesId: mapping.friendlySeriesId,
		parentSeriesId: mapping.friendlySeriesId,
		contentType: "post",
		entityType: "post",
		entityMode: "structured",
		parentQuestionId: "",
		commentsEnabled: true,
		sections: structure.sections,
		verseMap,
		options: {
			restoredFrom: "meluket-translation-job",
			legacyPostId: mapping.oldPostId,
			legacySeriesId: mapping.oldSeriesId
		},
		createdAt,
		updatedAt: createdAt,
		recovery: {
			month: mapping.month,
			rank: mapping.rank,
			textItemCount: structure.textItemCount,
			textCharacterCount: structure.textCharacterCount
		}
	};
}

function main() {
	const archivePosts = loadArchivePosts();
	const ledger = loadLegacyLedger();
	const mappings = buildMappings(ledger, archivePosts);
	const records = mappings.map(mapping => {
		return buildRecord(archivePosts.get(mapping.newPostId), mapping);
	});
	const itemCount = records.reduce((sum, record) => {
		return sum + record.recovery.textItemCount;
	}, 0);
	const characterCount = records.reduce((sum, record) => {
		return sum + record.recovery.textCharacterCount;
	}, 0);
	if (itemCount !== 88043 || characterCount !== 2491444) {
		throw new Error(`Text covenant failed: ${itemCount}/${characterCount}`);
	}

	fs.rmSync(bundleRoot, { recursive: true, force: true });
	fs.mkdirSync(bundleRoot, { recursive: true });
	const commentMap = buildCommentMap(mappings);
	const manifest = {
		version: 1,
		generatedAt: new Date().toISOString(),
		postCount: records.length,
		mappingCount: mappings.length,
		commentMapCount: commentMap.count,
		textItemCount: itemCount,
		textCharacterCount: characterCount,
		recordHash: hash(records),
		mappingHash: hash(mappings)
	};
	fs.writeFileSync(path.join(bundleRoot, "records.json"), JSON.stringify(records));
	fs.writeFileSync(path.join(bundleRoot, "mappings.json"), JSON.stringify(mappings, null, 2));
	fs.writeFileSync(path.join(bundleRoot, "meluket-post-map.v1.json"), JSON.stringify(commentMap, null, 2));
	fs.writeFileSync(path.join(bundleRoot, "manifest.json"), JSON.stringify(manifest, null, 2));
	console.log(JSON.stringify(manifest, null, 2));
}

main();
