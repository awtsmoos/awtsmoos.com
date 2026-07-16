// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module SocialRagPaths
 * @description
 * Canonical social data and runtime AI assets have separate explicit roots. The
 * Awtsmoos keeps large rebuildable vectors outside dayuhChadash while every path
 * helper remains read-only and refuses to create storage implicitly.
 */

const fs = require('fs');
const path = require('path');

function dbRoot($i) {
	return $i?.db?.directory
		|| process.env.AWTS_DB_ROOT
		|| process.cwd();
}

function aiRoot($i) {
	return process.env.AWTSMOOS_AI_ROOT
		|| path.join(dbRoot($i), 'ai');
}

function ragRoot($i) {
	return process.env.AWTSMOOS_RAG_ROOT
		|| path.join(aiRoot($i), 'comment-rag');
}

function commentsDbPath($i, heichel = 'ikar') {
	return path.join(
		dbRoot($i),
		'socialPacked',
		`social.heichel.${heichel}.comments.fs.awtsdb`
	);
}

function existingJson(file) {
	try {
		return JSON.parse(fs.readFileSync(file, 'utf8'));
	} catch {
		return null;
	}
}

function stat(file) {
	try {
		return fs.statSync(file);
	} catch {
		return null;
	}
}

module.exports = {
	aiRoot,
	commentsDbPath,
	dbRoot,
	existingJson,
	ragRoot,
	stat
};