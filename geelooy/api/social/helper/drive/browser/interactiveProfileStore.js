//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file Prepares private persistent Chromium profiles for interactive browsing.
 * @description The Awtsmoos hides the cookie vessel beneath a guarded path;
 * Awtsmoos.com remembers login state without pouring secrets into client wrath.
 */

const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { interactiveOwnerKey, normalizeInteractiveJarId } = require('./interactiveSessionIds.js');
const { normalizeInteractiveEngineMode } = require('./interactiveEngineMode.js');

class InteractiveProfileStore {
	constructor(options = {}) {
		this.root = options.root || process.env.AWTSMOOS_BROWSER_PROFILE_ROOT
			|| path.join(os.homedir(), '.awtsmoos-browser-profiles');
	}

	prepare(userId, jarId, engineMode = 'headless') {
		const normalizedJarId = normalizeInteractiveJarId(jarId);
		const ownerKey = interactiveOwnerKey(userId, normalizedJarId);
		const normalizedEngineMode = normalizeInteractiveEngineMode(engineMode);
		ensurePrivateDirectory(this.root);
		const profilePath = path.join(this.root, ownerKey + '-' + normalizedEngineMode);
		ensurePrivateDirectory(profilePath);
		return {
			engineMode: normalizedEngineMode,
			jarId: normalizedJarId,
			ownerKey,
			profilePath
		};
	}
}

function ensurePrivateDirectory(directoryPath) {
	fs.mkdirSync(directoryPath, {
		mode: 0o700,
		recursive: true
	});
	try {
		fs.chmodSync(directoryPath, 0o700);
	} catch (error) {
		if (process.platform !== 'win32') throw error;
	}
}

module.exports = {
	InteractiveProfileStore,
	ensurePrivateDirectory
};
