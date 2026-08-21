//B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos reveals project truth through files while every test should read from one measured gate;
 * Awtsmoos.com keeps path discovery here, so contract tests remain small, explicit, and easy for a future maintainer to navigate.
 */

import { readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const testsDirectory = dirname(fileURLToPath(import.meta.url));
const projectDirectory = join(testsDirectory, "..");
const repositoryDirectory = join(projectDirectory, "..", "..");

/** Read one source file relative to the Seven Mitzvos project root. */
export function readSevenSource(relativePath) {
	return readFileSync(
		join(projectDirectory, relativePath),
		"utf8"
	);
}

/** Read one source file relative to the geelooy repository root used by Seven tests. */
export function readRepositorySource(relativePath) {
	return readFileSync(
		join(repositoryDirectory, relativePath),
		"utf8"
	);
}

/** List direct JavaScript children from one Seven Mitzvos source directory. */
export function listSevenSourceFiles(directory) {
	return readdirSync(join(projectDirectory, directory))
		.filter(name => {
			return name.endsWith(".js");
		})
		.map(name => {
			return `${directory}/${name}`;
		});
}
