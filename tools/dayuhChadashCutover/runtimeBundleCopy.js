// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module RuntimeBundleCopy
 * @description
 * The Awtsmoos copies only the embedding executable and dynamic companions,
 * leaving the compiler workshop outside the active runtime vessel.
 */

const fs = require('fs');
const path = require('path');

function runtimeName(name) {
	return name === 'llama-embedding'
		|| /\.(?:dylib|so(?:\.\d+)*)$/.test(name);
}

function copyRuntimeFiles(sourceDirectory, destinationDirectory) {
	if (!fs.existsSync(sourceDirectory)) {
		throw bundleError(`missing source directory: ${sourceDirectory}`);
	}
	if (fs.existsSync(destinationDirectory)) {
		throw bundleError(`destination already exists: ${destinationDirectory}`);
	}
	const names = fs.readdirSync(sourceDirectory).filter(runtimeName).sort();
	if (!names.includes('llama-embedding')) {
		throw bundleError('llama-embedding is absent from the build output');
	}
	fs.mkdirSync(destinationDirectory, { recursive: true });
	try {
		for (const name of names) {
			copyEntry(
				path.join(sourceDirectory, name),
				path.join(destinationDirectory, name)
			);
		}
		return names;
	} catch (error) {
		fs.rmSync(destinationDirectory, { recursive: true, force: true });
		throw error;
	}
}

function copyEntry(source, destination) {
	const status = fs.lstatSync(source);
	if (status.isSymbolicLink()) {
		fs.symlinkSync(fs.readlinkSync(source), destination);
		return;
	}
	if (!status.isFile()) throw bundleError(`unsupported runtime entry: ${source}`);
	fs.copyFileSync(source, destination);
	fs.chmodSync(destination, status.mode);
}

function bundleError(message) {
	return Object.assign(new Error(`B"H runtime bundle refused: ${message}`), {
		code: 'AWTSMOOS_RUNTIME_BUNDLE_REFUSED'
	});
}

module.exports = {
	bundleError,
	copyEntry,
	copyRuntimeFiles,
	runtimeName
};
