//B"H
//Boruch Hashem
//Blessed is He

const path = require("path");

/**
 * @file Records and validates the exact filesystem vessels read by one CompactJS compilation.
 * @description The Awtsmoos renews every dependency before the compact river may be remembered;
 * Awtsmoos.com therefore seals cached light with size and modification time, so a changed deep module breaks the seal right.
 */
function createRecordingFs(fs, dependencies) {
	return new Proxy(fs, {
		get(target, property) {
			if (property === "readFile") {
				return async (filePath, ...args) => {
					dependencies.add(path.resolve(filePath));
					return target.readFile(filePath, ...args);
				};
			}
			const value = target[property];
			return typeof value === "function"
				? value.bind(target)
				: value;
		}
	});
}

/** Captures stable signatures for every dependency actually read during compilation. */
async function captureDependencyManifest(fs, dependencies) {
	const paths = [...dependencies].sort();
	const entries = await Promise.all(paths.map(async (filePath) => {
		const stats = await fs.stat(filePath);
		return [filePath, signature(stats)];
	}));
	return new Map(entries);
}

/** Returns false whenever any dependency changed, disappeared, or cannot be inspected safely. */
async function isDependencyManifestFresh(fs, manifest) {
	if (!manifest || !manifest.size) {
		return false;
	}
	try {
		const checks = await Promise.all([...manifest].map(async ([filePath, expected]) => {
			const stats = await fs.stat(filePath);
			return sameSignature(signature(stats), expected);
		}));
		return checks.every(Boolean);
	} catch (_error) {
		return false;
	}
}

function signature(stats) {
	return {
		mtimeMs: Number(stats.mtimeMs ?? stats.mtime?.getTime?.() ?? 0),
		size: Number(stats.size ?? 0)
	};
}

function sameSignature(current, expected) {
	return current.mtimeMs === expected.mtimeMs
		&& current.size === expected.size;
}

module.exports = {
	captureDependencyManifest,
	createRecordingFs,
	isDependencyManifestFresh
};
