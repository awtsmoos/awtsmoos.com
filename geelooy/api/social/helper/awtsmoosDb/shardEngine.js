// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module SocialShardEngine
 * @description Resolves the one AwtsmoosDB engine without embedding path discovery
 * inside the bounded derived-mirror store.
 */

const fs = require('fs');
const path = require('path');

let Engine;

function rootCandidates(baseDirectory = __dirname) {
	const repository = path.resolve(baseDirectory, '../../../../..');
	const cwd = process.cwd();
	return [repository, cwd, path.resolve(cwd, '..')].filter(Boolean);
}

function engineCandidates(environment = process.env) {
	const candidates = [];
	if (environment.AWTSMOOS_DB_ENGINE) {
		candidates.push(environment.AWTSMOOS_DB_ENGINE);
	}
	for (const root of rootCandidates()) {
		candidates.push(
			path.join(root, 'ayzarim/dosdb/awtsmoosBinary/awtsmoosDB/index.js'),
			path.join(root, 'ayzarim/DosDB/awtsmoosBinary/awtsmoosDB/index.js'),
			path.join(root, 'ayzarim/dosdb/index.js'),
			path.join(root, 'ayzarim/DosDB/index.js')
		);
	}
	return [...new Set(candidates)];
}

function resolveEngine() {
	if (Engine) return Engine;
	const misses = [];
	for (const candidate of engineCandidates()) {
		try {
			if (!candidate || !fs.existsSync(candidate)) {
				misses.push(candidate);
				continue;
			}
			Engine = require(candidate);
			return Engine;
		} catch (error) {
			misses.push(`${candidate} :: ${error.message}`);
		}
	}
	throw new Error(
		`AwtsmoosDB engine not found. Tried: ${misses.filter(Boolean).join(' | ')}`
	);
}

module.exports = {
	engineCandidates,
	resolveEngine,
	rootCandidates
};