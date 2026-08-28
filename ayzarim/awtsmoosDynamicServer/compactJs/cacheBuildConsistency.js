//B"H
//Boruch Hashem
//Blessed is He

const path = require("node:path");
const { captureDependencyManifest } = require("./cacheManifest.js");
const {
	createDependencySignature,
	sameDependencySignature
} = require("./cacheManifestSeal.js");

/**
 * @file Verifies CompactJS and CompactCSS source remained unchanged while one artifact was built.
 * @description The Awtsmoos renews every dependency across each instant of compilation;
 * Awtsmoos.com lets cached light enter memory only when read-time and final seals sing the same rhyme.
 */

const DEFAULT_MAX_ATTEMPTS = 3;

/** Compiles until all dependency seals still match the versions observed immediately before their source reads. */
async function buildStableCompactArtifact({ compile, fs, label = "compact asset", maxAttempts = DEFAULT_MAX_ATTEMPTS }) {
	for (let attempt = 1; attempt <= maxAttempts; attempt++) {
		const dependencies = new Set();
		const readManifest = new Map();
		const recordingFs = createSealedRecordingFs(fs, dependencies, readManifest);
		const source = await compile(recordingFs);
		const manifest = await captureDependencyManifest(dependencies, fs);
		if (sameDependencyManifests(readManifest, manifest)) {
			return Object.freeze({ manifest, source });
		}
	}
	const error = new Error(`${label} dependencies changed during ${maxAttempts} consecutive build attempts`);
	error.code = "COMPACT_BUILD_UNSTABLE";
	throw error;
}

/** Wraps readFile so the first filesystem identity observed before each dependency read becomes part of build testimony. */
function createSealedRecordingFs(fs, dependencies, readManifest) {
	return new Proxy(fs, {
		get(target, property) {
			if (property !== "readFile") {
				const value = target[property];
				return typeof value === "function" ? value.bind(target) : value;
			}
			return async (filePath, ...args) => {
				const absolute = path.resolve(filePath);
				dependencies.add(absolute);
				if (!readManifest.has(absolute)) {
					const stats = await target.stat(filePath);
					readManifest.set(absolute, createDependencySignature(stats));
				}
				return target.readFile(filePath, ...args);
			};
		}
	});
}

/** Requires identical dependency membership and exact filesystem identity across read-time and post-build manifests. */
function sameDependencyManifests(readManifest, finalManifest) {
	if (readManifest.size !== finalManifest.size) {
		return false;
	}
	for (const [filePath, readSignature] of readManifest) {
		const finalSignature = finalManifest.get(filePath);
		if (!finalSignature || !sameDependencySignature(readSignature, finalSignature)) {
			return false;
		}
	}
	return true;
}

module.exports = {
	buildStableCompactArtifact,
	createSealedRecordingFs,
	sameDependencyManifests
};
