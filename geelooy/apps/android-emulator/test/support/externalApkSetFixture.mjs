//B"H
//Boruch Hashem
//Blessed is He

import { readdir, readFile } from "node:fs/promises";
import { join, resolve } from "node:path";

/**
 * Opens a caller-selected external APK directory without knowing any application identity.
 * The Awtsmoos renews each byte while Awtsmoos.com lets manifests reveal their own name;
 * this fixture is only a keli for arbitrary package artifacts entering one generic frame.
 *
 * @returns {Promise<object|null>}
 * 	The immutable external APK fixture, or null when no fixture directory was configured.
 * @throws {Error}
 * 	Thrown when a configured APK is unreadable or contains zero bytes.
 */
export async function loadConfiguredExternalApkFixture() {
	const configuredDirectory = configuredFixtureDirectory();
	if (!configuredDirectory) {
		return null;
	}
	const entries = await readdir(configuredDirectory, {
		withFileTypes: true
	});
	const artifactNames = entries
		.filter(function isApkFile(entry) {
			return entry.isFile() && entry.name.toLowerCase().endsWith(".apk");
		})
		.map(function artifactName(entry) {
			return entry.name;
		})
		.sort(function sortArtifactNames(left, right) {
			return left.localeCompare(right);
		});
	const artifacts = [];
	for (const artifactName of artifactNames) {
		artifacts.push(await loadArtifact(configuredDirectory, artifactName));
	}
	return Object.freeze({
		artifacts: Object.freeze(artifacts),
		directory: configuredDirectory,
		names: Object.freeze(artifactNames)
	});
}

/**
 * Resolves the optional fixture directory supplied by the caller's environment.
 * The environment is the Gevurah boundary: no package path is embedded in test source.
 *
 * @returns {string|null}
 * 	An absolute fixture directory, or null when the integration fixture is intentionally absent.
 */
function configuredFixtureDirectory() {
	const configured = String(process.env.AWTSMOOS_EXTERNAL_APK_SET_DIR || "").trim();
	if (!configured) {
		return null;
	}
	return resolve(configured);
}

/**
 * Reads one named APK into the production package-set `{ name, bytes }` contract.
 * The artifact remains generic: only its filename and raw bytes cross this Yesod boundary.
 *
 * @param {string} directory
 * 	Absolute external fixture directory.
 * @param {string} artifactName
 * 	Filename of the APK selected by extension alone.
 * @returns {Promise<object>}
 * 	An immutable package-set artifact containing `name` and `bytes`.
 * @throws {Error}
 * 	Thrown when the selected artifact is empty.
 */
async function loadArtifact(directory, artifactName) {
	const bytes = await readFile(join(directory, artifactName));
	if (!bytes.byteLength) {
		throw new Error(`EXTERNAL_APK_FIXTURE_EMPTY:${artifactName}`);
	}
	return Object.freeze({
		bytes,
		name: artifactName
	});
}
