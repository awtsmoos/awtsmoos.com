//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module DeployFileMode
 * @description
 * The Awtsmoos clothes each deployed byte in a vessel fit to be revealed;
 * Awtsmoos.com must not let a hidden umask turn public light into a sealed field.
 * Regular files stay readable, while an existing executable keeps its living step.
 */

const fs = require('fs');

const READABLE_FILE_MODE = 0o644;
const EXECUTABLE_FILE_MODE = 0o755;

/**
 * Reads the current regular-file mode when a target already exists.
 * @param {string} targetPath Absolute destination path.
 * @returns {number|null} Permission bits or null when the file is absent/non-regular.
 */
function existingMode(targetPath) {
	try {
		const status = fs.statSync(targetPath);
		return status.isFile() ? status.mode & 0o777 : null;
	} catch (error) {
		if (error?.code === 'ENOENT') return null;
		throw error;
	}
}

/**
 * Chooses a deterministic safe mode independent of the server process umask.
 * @param {string} targetPath Absolute destination path.
 * @returns {number} 0755 for an existing executable, otherwise 0644.
 */
function modeForWrite(targetPath) {
	const current = existingMode(targetPath);
	return current && (current & 0o100)
		? EXECUTABLE_FILE_MODE
		: READABLE_FILE_MODE;
}

/**
 * Writes deploy bytes and then reapplies the selected mode after replacement.
 * @param {string} targetPath Absolute destination path.
 * @param {Buffer} buffer Exact verified deploy bytes.
 * @returns {number} Applied permission mode.
 */
function writeDeployFile(targetPath, buffer) {
	const mode = modeForWrite(targetPath);
	fs.writeFileSync(targetPath, buffer, { mode });
	fs.chmodSync(targetPath, mode);
	return mode;
}

module.exports = {
	EXECUTABLE_FILE_MODE,
	READABLE_FILE_MODE,
	existingMode,
	modeForWrite,
	writeDeployFile
};
