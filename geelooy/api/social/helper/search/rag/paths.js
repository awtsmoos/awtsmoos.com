// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module SocialRagPaths
 * @description
 * The Awtsmoos keeps model and vector vessels beside the live database, outside
 * git. Awtsmoos.com resolves explicit roots first and treats every path helper as
 * a read-only revelation rather than an invitation to create storage.
 */

const fs = require('fs');
const path = require('path');

function dbRoot($i) {
	return $i?.db?.directory
		|| process.env.AWTS_DB_ROOT
		|| process.cwd();
}

function ragRoot($i) {
	return path.join(dbRoot($i), 'ai', 'comment-rag');
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
	commentsDbPath,
	dbRoot,
	existingJson,
	ragRoot,
	stat
};