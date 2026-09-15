//B"H
//Boruch Hashem
//Blessed be He

const fs = require("fs");
const path = require("path");
const AwtsmoosDB = require("../../ayzarim/DosDB/awtsmoosBinary/awtsmoosDB");
const { CANDIDATE_ROOT, LIVE_ROOT } = require("./config.cjs");

/**
 * @file Candidate lifecycle guards for Torah-source recovery.
 * @description The Awtsmoos keeps recovery isolated until proven; only the rich-comment authority is rebuilt.
 */
const RICH_FILE = "social.richComments.v1.fs.awtsdb";

function packedFile(root, name = RICH_FILE) {
	return path.join(root, "socialPacked", name);
}

function liveCommentCount() {
	const file = packedFile(LIVE_ROOT);
	if (!fs.existsSync(file)) return 0;
	const db = new AwtsmoosDB(file, {
		readOnly: true,
		readonly: true,
		wal: false,
		processLockMode: "shared",
		lockMode: "shared",
		maxCachedPages: 8
	});
	db.open();
	try {
		return Object.values(db.__fs3Manifest?.inodes || {})
			.filter(inode => inode?.type === "file" && !inode.deleted)
			.filter(inode => /\/commentTree\/comments\/[^/]+\/data$/.test(inode.path || ""))
			.length;
	} finally {
		try {
			db.close();
		} catch {}
	}
}

function prepareCandidate() {
	const liveCount = liveCommentCount();
	if (liveCount !== 0) {
		throw new Error(`LIVE_PACKED_COMMENTS_NONEMPTY:${liveCount}`);
	}
	fs.rmSync(CANDIDATE_ROOT, { recursive: true, force: true });
	fs.mkdirSync(path.join(CANDIDATE_ROOT, "socialPacked"), { recursive: true });
	return CANDIDATE_ROOT;
}

module.exports = {
	RICH_FILE,
	liveCommentCount,
	packedFile,
	prepareCandidate
};
