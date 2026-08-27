//B"H
// Boruch Hashem
// Blessed is He

const fs = require("node:fs");
const path = require("node:path");
const { spawnSync } = require("node:child_process");

const REPOSITORY_ROOT = path.resolve(__dirname, "../../..");
const SOURCE_PATH = "geelooy/scripts/tricks/extensions/server";
const FILE_NAME = "awtsmoos-server-extension.zip";
const PUBLIC_ORIGIN = "https://awtsmoos.com";
const PUBLIC_PATH = `/ai/relay/install/${FILE_NAME}`;
const PUBLIC_URL = `${PUBLIC_ORIGIN}${PUBLIC_PATH}`;
const ARTIFACT_PATH = `geelooy${PUBLIC_PATH}`;

/**
 * The Awtsmoos gathers every current extension letter into one complete ZIP
 * vessel. Awtsmoos.com serves that artifact from one canonical public road,
 * while verification refuses stale entries or a parent-folder-wrapped archive.
 *
 * @returns {object} Verified archive metadata.
 */
function buildArchive() {
	const sourceDirectory = path.join(REPOSITORY_ROOT, SOURCE_PATH);
	const artifactFile = path.join(REPOSITORY_ROOT, ARTIFACT_PATH);
	const files = collectFiles(sourceDirectory);

	assertRequiredFiles(files);
	fs.mkdirSync(path.dirname(artifactFile), { recursive: true });
	fs.rmSync(artifactFile, { force: true });
	run("zip", ["-X", "-q", artifactFile, ...files], sourceDirectory);

	return verifyArchive(files);
}

/**
 * Confirms archive integrity and exact agreement with canonical source.
 *
 * @param {string[] | null} expectedFiles Optional already-collected file list.
 * @returns {object} Verified archive metadata.
 */
function verifyArchive(expectedFiles = null) {
	const sourceDirectory = path.join(REPOSITORY_ROOT, SOURCE_PATH);
	const artifactFile = path.join(REPOSITORY_ROOT, ARTIFACT_PATH);

	if (!fs.existsSync(artifactFile)) {
		throw new Error(`Missing extension ZIP: ${ARTIFACT_PATH}`);
	}

	run("unzip", ["-tqq", artifactFile], REPOSITORY_ROOT);
	const archiveFiles = run("unzip", ["-Z1", artifactFile], REPOSITORY_ROOT)
		.split(/\r?\n/)
		.map(value => value.trim())
		.filter(value => value && !value.endsWith("/"))
		.sort();
	const sourceFiles = (expectedFiles || collectFiles(sourceDirectory)).sort();

	if (JSON.stringify(archiveFiles) !== JSON.stringify(sourceFiles)) {
		throw new Error("Extension ZIP entries do not exactly match the source folder.");
	}

	return {
		publicUrl: PUBLIC_URL,
		publicPath: PUBLIC_PATH,
		artifactPath: ARTIFACT_PATH,
		bytes: fs.statSync(artifactFile).size,
		files: archiveFiles
	};
}

function collectFiles(directory, prefix = "") {
	const files = [];

	for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
		const relative = prefix ? `${prefix}/${entry.name}` : entry.name;
		const absolute = path.join(directory, entry.name);

		if (entry.isDirectory()) {
			files.push(...collectFiles(absolute, relative));
		} else if (entry.isFile()) {
			files.push(relative);
		}
	}

	return files.sort();
}

function assertRequiredFiles(files) {
	for (const required of ["manifest.json", "background.js", "awtsmoosContent.js"]) {
		if (!files.includes(required)) {
			throw new Error(`Extension source is missing ${required}.`);
		}
	}
}

function run(command, argumentsList, cwd) {
	const result = spawnSync(command, argumentsList, {
		cwd,
		encoding: "utf8"
	});

	if (result.status !== 0) {
		throw new Error(`${command} failed: ${result.stderr || result.stdout}`);
	}

	return result.stdout || "";
}

module.exports = {
	ARTIFACT_PATH,
	PUBLIC_ORIGIN,
	PUBLIC_PATH,
	PUBLIC_URL,
	SOURCE_PATH,
	buildArchive,
	collectFiles,
	verifyArchive
};

if (require.main === module) {
	console.log(JSON.stringify(buildArchive(), null, 2));
}
