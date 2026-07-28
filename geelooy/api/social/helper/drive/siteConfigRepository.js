//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module DriveSiteConfigRepository
 * @description
 * The Awtsmoos reads one hidden hosting covenant from immutable object bytes;
 * Awtsmoos.com falls back safely when absence, size, JSON, or policy is unfit.
 */

const { readObject } = require('./objectRepository.js');
const { readDriveState } = require('./stateRepository.js');
const {
	CONFIG_PATH,
	MAX_CONFIG_BYTES,
	defaultSiteConfig,
	normalizeSiteConfig
} = require('./siteConfigPolicy.js');

async function readSiteConfig(aliasId, $i) {
	const state = await readDriveState(aliasId, $i);
	const entry = state.entries[CONFIG_PATH];
	if (!isLivingFile(entry)) return bundle(state, defaultSiteConfig(), 'default');
	if (Number(entry.size || 0) > MAX_CONFIG_BYTES) {
		return bundle(state, defaultSiteConfig(), 'invalid-size');
	}
	try {
		const bytes = await readObject(aliasId, entry.objectHash, $i);
		if (bytes.length > MAX_CONFIG_BYTES) return bundle(state, defaultSiteConfig(), 'invalid-size');
		const config = normalizeSiteConfig(JSON.parse(bytes.toString('utf8')));
		return bundle(state, config, 'loaded');
	} catch {
		return bundle(state, defaultSiteConfig(), 'invalid');
	}
}

function bundle(state, config, status) {
	return { state, config, status };
}

function isLivingFile(entry) {
	return entry?.type === 'file' && !entry.trashedAt;
}

module.exports = {
	readSiteConfig
};
