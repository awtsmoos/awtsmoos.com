// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module SocialRagPaths
 * @description
 * Canonical social data and rebuildable AI assets inhabit separate vessels.
 * Explicit roots always win. Otherwise the Awtsmoos looks only for an existing
 * sibling runtime root and never creates, mutates, or guesses a database file.
 */

const fs = require('fs');
const path = require('path');

function dbRoot($i) {
	return $i?.db?.directory
		|| process.env.AWTS_DB_ROOT
		|| process.cwd();
}

function runtimeAiCandidates($i) {
	const databaseRoot = path.resolve(dbRoot($i));
	const databaseName = path.basename(databaseRoot);
	const namespaceRoot = path.dirname(databaseRoot);
	const documentsRoot = path.dirname(namespaceRoot);
	return [
		path.join(namespaceRoot, `${databaseName}-runtime`, 'ai'),
		path.join(documentsRoot, `${databaseName}-runtime`, 'ai')
	];
}

function existingDirectory(candidates) {
	return candidates.find(candidate => {
		try {
			return fs.statSync(candidate).isDirectory();
		} catch {
			return false;
		}
	}) || null;
}

function aiRoot($i) {
	if (process.env.AWTSMOOS_AI_ROOT) {
		return path.resolve(process.env.AWTSMOOS_AI_ROOT);
	}
	return existingDirectory(runtimeAiCandidates($i))
		|| path.join(dbRoot($i), 'ai');
}

function ragRoot($i) {
	return process.env.AWTSMOOS_RAG_ROOT
		? path.resolve(process.env.AWTSMOOS_RAG_ROOT)
		: path.join(aiRoot($i), 'comment-rag');
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
	existingDirectory,
	existingJson,
	ragRoot,
	runtimeAiCandidates,
	stat
};
