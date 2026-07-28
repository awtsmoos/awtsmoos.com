// B"H
// Boruch Hashem
// Blessed is He

const fs = require('fs');
const os = require('os');
const path = require('path');

function home(config = {}, input = {}) {
	if (input.metadataRoot || config.metadataRoot) {
		return path.resolve(input.metadataRoot || config.metadataRoot);
	}
	if (process.env.AWTSMOOS_TUNNEL_META_ROOT) {
		return path.resolve(process.env.AWTSMOOS_TUNNEL_META_ROOT);
	}
	const androidDocuments = '/storage/emulated/0/Documents';
	if (fs.existsSync(androidDocuments)) {
		return path.join(androidDocuments, '.awtsmoos', 'tunnel-meta');
	}
	const homeDocuments = path.join(os.homedir(), 'Documents');
	if (fs.existsSync(homeDocuments)) {
		return path.join(homeDocuments, '.awtsmoos', 'tunnel-meta');
	}
	return path.join(os.homedir(), '.awtsmoos', 'tunnel-meta');
}

function dbFile(config = {}, input = {}) {
	return path.join(home(config, input), 'awtsmoos-tunnel.awdb');
}

function fallbackFile(config = {}, input = {}) {
	return path.join(home(config, input), 'awtsmoos-tunnel.records.jsonl');
}

function roomsFile(config = {}, input = {}) {
	return path.join(home(config, input), 'awtsmoos-tunnel.rooms.json');
}

function roomsDirectory(config = {}, input = {}) {
	return path.join(home(config, input), 'awtsmoos-tunnel.rooms');
}

function isInside(child, parent) {
	const relative = path.relative(path.resolve(parent), path.resolve(child));
	return relative === '' || (
		Boolean(relative) &&
		!relative.startsWith('..') &&
		!path.isAbsolute(relative)
	);
}

function report(config = {}, input = {}) {
	const root = path.resolve(input.projectRoot || config.root || process.cwd());
	const metadataRoot = home(config, input);
	return {
		projectRoot: root,
		metadataRoot,
		dbFile: dbFile(config, input),
		fallbackFile: fallbackFile(config, input),
		roomsFile: roomsFile(config, input),
		roomsDirectory: roomsDirectory(config, input),
		outsideProject: !isInside(metadataRoot, root),
		globalMetadataRoot: true,
		format: process.env.AWTSMOOS_MISSION_METADATA_AWDB === '1'
			? 'awtsmoosdb-explicit'
			: 'append-jsonl-and-atomic-room-documents',
		jsonFiles: true
	};
}

/**
 * B"H
 * The store is a fixed chamber of the device, not a shadow thrown by the repo.
 * High-frequency records append independently while one compact room registry
 * remains atomically discoverable across every project.
 */
module.exports = {
	dbFile,
	fallbackFile,
	home,
	isInside,
	report,
	roomsDirectory,
	roomsFile
};
