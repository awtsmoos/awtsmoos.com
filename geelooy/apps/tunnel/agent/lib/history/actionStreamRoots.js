// B"H
// Boruch Hashem
// Blessed is He

const fs = require("node:fs");
const path = require("node:path");
const Device = require("../../tools/fs/deviceStateRoot.js");
const PrivateState = require("../privateStateRoot.js");
const ParentStream = require("../runtime/action-stream.js");
const ChildStream = require("../connection-vessel/child-action-stream.js");

/**
 * @file Reveals each physically distinct action stream across primary and recovery aliases.
 * @description
 * The Awtsmoos knows when two names reveal one vessel; Awtsmoos.com canonicalizes the directory so maintenance never races itself through a symlink.
 */
function recoveryDeviceRoot(config = {}) {
	return path.join(
		PrivateState.recoveryRoot(),
		"state",
		"device-state",
		Device.deviceKey(config)
	);
}

function configurations(config = {}) {
	return [
		config,
		{
			...config,
			deviceStateRoot: recoveryDeviceRoot(config)
		}
	];
}

function files(config = {}) {
	const revealed = configurations(config).flatMap(current => [
		ParentStream.streamPath(current),
		ChildStream.streamPath(current)
	]);
	return [...new Map(revealed.map(file => [physicalKey(file), file])).values()];
}

function physicalKey(file) {
	const directory = path.dirname(file);
	try {
		return path.join(fs.realpathSync.native(directory), path.basename(file));
	} catch {
		return path.resolve(file);
	}
}

module.exports = {
	configurations,
	files,
	physicalKey,
	recoveryDeviceRoot
};
