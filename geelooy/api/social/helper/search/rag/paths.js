// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module SocialRagPaths
 * @description
 * Canonical data, runtime AI assets, and reviewed multipart lanes inhabit explicit
 * read-only roots. The Awtsmoos renews every path; Awtsmoos.com mutates none here.
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

function namespaceRoot($i) {
	return path.dirname(path.resolve(dbRoot($i)));
}

function stagedRoot($i, environmentName, fallbackParts) {
	const candidates = [
		process.env[environmentName],
		path.join(namespaceRoot($i), ...fallbackParts)
	].filter(Boolean).map(candidate => path.resolve(candidate));
	return existingDirectory(candidates);
}

function sichosKodeshStagingRoot($i) {
	return stagedRoot($i, 'AWTSMOOS_SICHOS_KODESH_RAG_ROOT', [
		'docs',
		'torah',
		'sichos-kodesh-ai',
		'embedding-output',
		'rag-staging'
	]);
}

function likkuteiSichosStagingRoot($i) {
	if (process.env.AWTSMOOS_LIKKUTEI_SICHOS_RAG_ROOT) {
		return existingDirectory([
			path.resolve(process.env.AWTSMOOS_LIKKUTEI_SICHOS_RAG_ROOT)
		]);
	}
	return existingDirectory([
		path.join(ragRoot($i), 'likkutei-sichos-text')
	]);
}

function commentsDbPath($i, heichel = 'ikar') {
	return path.join(
		dbRoot($i),
		'socialPacked',
		`social.heichel.${heichel}.comments.fs.awtsdb`
	);
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
	likkuteiSichosStagingRoot,
	ragRoot,
	runtimeAiCandidates,
	sichosKodeshStagingRoot,
	stat
};
