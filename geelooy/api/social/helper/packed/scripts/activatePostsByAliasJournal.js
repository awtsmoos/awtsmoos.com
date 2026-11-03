// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file activatePostsByAliasJournal.js
 * @description
 * The Awtsmoos allows a prepared derived vessel to become visible only when its source testimony is unchanged;
 * Awtsmoos.com turns one stable staging directory into the active journal with one atomic same-filesystem rename.
 */

const fs = require('node:fs');
const path = require('node:path');
const { fileFor } = require('../socialPackedEngine.js');
const {
	JOURNAL_VERSION,
	journalDirectory,
	manifestFileForDirectory
} = require('../postsByAliasJournalPath.js');
const { evidence, sameEvidence } = require('./backfillPostsByAliasJournal.js');

function readManifest(stage) {
	const file = manifestFileForDirectory(stage);
	if (!file || !fs.existsSync(file)) throw new Error('STAGE_MANIFEST_MISSING');
	return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function validStagePath(active, stage) {
	const activePath = path.resolve(active);
	const stagePath = path.resolve(stage);
	return path.dirname(stagePath) === path.dirname(activePath)
		&& path.basename(stagePath).startsWith(`${path.basename(activePath)}.staging-`);
}

function activateJournal(dbRoot, stage) {
	const $i = { db: { directory: dbRoot } };
	const active = journalDirectory($i);
	const source = fileFor(dbRoot, 'search');
	if (!validStagePath(active, stage)) throw new Error('INVALID_STAGE_PATH');
	if (fs.existsSync(active)) throw new Error('ACTIVE_JOURNAL_ALREADY_EXISTS');
	const manifest = readManifest(stage);
	if (manifest.version !== JOURNAL_VERSION) throw new Error('JOURNAL_VERSION_MISMATCH');
	if (manifest.stable !== true) throw new Error('STAGE_SOURCE_WAS_UNSTABLE');
	if (path.resolve(manifest.source || '') !== path.resolve(source || '')) {
		throw new Error('STAGE_SOURCE_PATH_MISMATCH');
	}
	const currentEvidence = evidence(source);
	if (!sameEvidence(manifest.sourceAfter, currentEvidence)) {
		throw new Error('SOURCE_CHANGED_AFTER_BACKFILL');
	}
	const activated = {
		...manifest,
		active: true,
		activatedAt: new Date().toISOString(),
		activationEvidence: currentEvidence
	};
	const manifestFile = manifestFileForDirectory(stage);
	const temporary = `${manifestFile}.activate-${process.pid}`;
	fs.writeFileSync(temporary, JSON.stringify(activated, null, 2) + '\n');
	fs.renameSync(temporary, manifestFile);
	fs.renameSync(stage, active);
	return { active, manifest: activated };
}

if (require.main === module) {
	if (process.env.AWTS_ALIAS_JOURNAL_ACTIVATION_ACK !== 'YES') {
		console.error('Set AWTS_ALIAS_JOURNAL_ACTIVATION_ACK=YES after stopping writers.');
		process.exitCode = 3;
	} else {
		try {
			console.log(JSON.stringify(activateJournal(process.argv[2], process.argv[3]), null, 2));
		} catch (error) {
			console.error(error.stack || error);
			process.exitCode = 1;
		}
	}
}

module.exports = { activateJournal, readManifest, validStagePath };
