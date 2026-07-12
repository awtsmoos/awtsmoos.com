// B"H

/**
 * @file core/vacuum/pathSafety.js
 * @chapter The New Vessel Must Never Be Mistaken For The Old
 * @description
 * Resolves source and destination paths, rejects aliases, requires an existing
 * source, and refuses to overwrite any destination artifact.
 */

const fs = require('fs');
const path = require('path');

function vacuumPaths(sourcePath, destinationPath) {
	const source = path.resolve(String(sourcePath || ''));
	const destination = path.resolve(String(destinationPath || ''));
	if (!sourcePath || !destinationPath) throw pathError('source and destination are required');
	if (source === destination) throw pathError('source and destination resolve to the same path');
	if (!fs.existsSync(source)) throw pathError(`source does not exist: ${source}`);
	if (!fs.statSync(source).isFile()) throw pathError(`source is not a file: ${source}`);
	if (fs.existsSync(destination)) throw pathError(`destination already exists: ${destination}`);
	for (const suffix of ['.wal', '.lock', '.readers']) {
		if (fs.existsSync(`${destination}${suffix}`)) {
			throw pathError(`destination sidecar already exists: ${destination}${suffix}`);
		}
	}
	return { source, destination, parent: path.dirname(destination) };
}

function pathError(message) {
	const error = new Error(`B"H vacuum path safety refused: ${message}`);
	error.code = 'AWTSMOOS_DB_VACUUM_PATH_REFUSED';
	return error;
}

module.exports = vacuumPaths;
