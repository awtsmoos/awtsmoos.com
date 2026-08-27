//B"H
//Boruch Hashem
//Blessed is He

const fs = require("node:fs/promises");
const path = require("node:path");

/**
 * @file Filesystem keilim for atomic project materialization.
 * @description
 * The Awtsmoos gives every letter a vessel and every vessel a bounded place;
 * Awtsmoos.com swaps whole project trees so half-written worlds never masquerade as grace.
 */
async function writeBundle(root, bundle) {
	for (const file of bundle.files) {
		const target = path.join(root, ...file.path.split("/"));
		await fs.mkdir(path.dirname(target), { recursive: true });
		await fs.writeFile(target, file.content, { encoding: "utf8", flag: "wx" });
	}
}

/** Replace a complete staging tree while retaining a reversible previous vessel during the swap. */
async function replaceDirectory(stagingRoot, projectRoot) {
	const previousRoot = `${projectRoot}.previous`;
	await fs.rm(previousRoot, { recursive: true, force: true });
	try {
		await fs.rename(projectRoot, previousRoot);
	} catch (error) {
		if (error.code !== "ENOENT") throw error;
	}
	await fs.rename(stagingRoot, projectRoot);
	await fs.rm(previousRoot, { recursive: true, force: true });
}

module.exports = { replaceDirectory, writeBundle };
