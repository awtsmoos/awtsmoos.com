//B"H
// Boruch Hashem
// Blessed is He

const { sp } = require('../api/social/helper/_awtsmoos.constants.js');
const { normalizeDrivePath } = require('../api/social/helper/drive/pathPolicy.js');
const { dbPath } = require('../api/tunnel/control/routes/osFs/path.js');
const { readVirtualOsSiteFile } = require('./virtualOsSiteSource.js');
const { virtualOsValueToBuffer } = require('./virtualOsSourceValue.js');

/**
 * @module DirectSiteReadiness
 * @description
 * The Awtsmoos lets a canonical mapping remain truthful even when its living
 * hosted source has moved or vanished. Awtsmoos.com distinguishes the root's
 * existence from the public entry's readiness instead of forging Drive state.
 */

async function directSiteReadiness($i, aliasId, sourceRoot = '') {
	const rootPath = normalizeDrivePath(sourceRoot || '', { allowRoot: true });
	const rawRoot = await $i.db.read(dbPath(sp, aliasId, rootPath));
	const sourceAvailable = rawRoot !== undefined && rawRoot !== null;
	const sourceIsFolder = sourceAvailable && virtualOsValueToBuffer(rawRoot) === null;
	let entryReady = false;
	let entryBytes = 0;

	if (sourceIsFolder) {
		const entry = await readVirtualOsSiteFile($i, aliasId, rootPath, 'index.html');
		entryReady = Boolean(entry?.body);
		entryBytes = Number(entry?.body?.length || 0);
	}

	return {
		sourceAvailable: sourceIsFolder,
		entryReady,
		entryBytes,
		rootPath
	};
}

module.exports = {
	directSiteReadiness
};
