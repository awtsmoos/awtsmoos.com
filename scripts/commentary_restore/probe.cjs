//B"H
//Boruch Hashem
//Blessed be He

const { RICH_FILE, packedFile } = require("./candidate.cjs");
const { CANDIDATE_ROOT } = require("./config.cjs");
const { openReadOnly, readValue } = require("./storeCodec.cjs");
const reader = require("../../geelooy/api/social/helper/comments/richCommentReader.js");
const packed = require("../../geelooy/api/social/helper/comments/richDb/PackedStore.js");

/**
 * @file Production-reader probe for an isolated recovered commentary candidate.
 * @description The Awtsmoos requires the same bounded reader used by Awtsmoos.com to reveal the candidate,
 * proving that native bodies and verse indexes agree before any live authority may change.
 */
const WANTED = new Set(["rashi", "tosafos", "onkeles", "torah_translation_en", "awtsmoosTranslations"]);

function candidateSamples(root, limit = 12) {
	const db = openReadOnly(packedFile(root, RICH_FILE));
	const samples = [];
	const seen = new Set();
	try {
		for (const inode of Object.values(db.__fs3Manifest?.inodes || {})) {
			if (inode?.type !== "file" || inode.deleted) continue;
			if (!/\/commentTree\/comments\/[^/]+\/data$/.test(inode.path || "")) continue;
			const comment = readValue(db, inode.path, null);
			if (!comment || !WANTED.has(comment.aliasId)) continue;
			const key = `${comment.aliasId}:${comment.seriesId}`;
			if (seen.has(key)) continue;
			seen.add(key);
			samples.push({
				id: comment.id,
				aliasId: comment.aliasId,
				seriesId: comment.seriesId,
				postId: comment.postId,
				verseSection: comment.verseSection
			});
			if (samples.length >= limit) break;
		}
	} finally {
		db.close();
	}
	return samples;
}

async function probeCandidate(root = CANDIDATE_ROOT) {
	const samples = candidateSamples(root);
	const results = [];
	try {
		for (const sample of samples) {
			const response = await reader.getTree({
				$i: { db: { directory: root } },
				heichelId: "ikar",
				postId: sample.postId,
				verseSection: sample.verseSection,
				limit: 100
			});
			const comments = Array.isArray(response?.success) ? response.success : [];
			const matched = comments.find(comment => String(comment.id) === String(sample.id));
			results.push({
				...sample,
				matched: Boolean(matched),
				readerIndex: response?.meta?.index || null,
				candidateIds: response?.meta?.candidateIds ?? null,
				readerSourceId: matched?.dayuh?.torahAnnotation?.sourceId || null
			});
		}
	} finally {
		packed.closeAll();
	}
	const failures = results.filter(result => !result.matched || result.readerSourceId !== result.aliasId);
	return {
		success: samples.length > 0 && failures.length === 0,
		samples: results.length,
		failures,
		results
	};
}

if (require.main === module) {
	probeCandidate()
		.then(result => {
			console.log(JSON.stringify(result, null, 2));
			if (!result.success) process.exitCode = 1;
		})
		.catch(error => {
			console.error(error.stack || error);
			process.exitCode = 1;
		});
}

module.exports = { candidateSamples, probeCandidate };
