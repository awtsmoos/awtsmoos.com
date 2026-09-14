//B"H
//Boruch Hashem
//Blessed be He

const fs = require("fs");
const path = require("path");
const { commentsRoot, parseCommentPath } = require("./config.cjs");

/**
 * @file Streaming discovery for legacy Torah commentary files.
 * @description Traversal is series/post/alias ordered and never materializes the full file universe.
 */
function sortedDirectories(folder) {
	try {
		return fs.readdirSync(folder, { withFileTypes: true })
			.filter(entry => entry.isDirectory())
			.map(entry => entry.name)
			.sort();
	} catch {
		return [];
	}
}

function sortedFiles(folder) {
	try {
		return fs.readdirSync(folder, { withFileTypes: true })
			.filter(entry => entry.isFile() && /\.awtsmoosJSON$/i.test(entry.name))
			.map(entry => entry.name)
			.sort();
	} catch {
		return [];
	}
}

/** Yields only reviewed source-commentary files without whole-tree buffering. */
function* commentaryFiles(source) {
	const root = commentsRoot(source.root);
	for (const seriesId of sortedDirectories(root)) {
		const postRoot = path.join(root, seriesId, "atPost");
		for (const postId of sortedDirectories(postRoot)) {
			const folder = path.join(postRoot, postId);
			for (const name of sortedFiles(folder)) {
				const parsed = parseCommentPath(path.join(folder, name), source);
				if (parsed) yield parsed;
			}
		}
	}
}

/** Yields one bounded set of reviewed commentator files for a single canonical post. */
function* commentaryPostGroups(source) {
	const root = commentsRoot(source.root);
	for (const seriesId of sortedDirectories(root)) {
		const postRoot = path.join(root, seriesId, "atPost");
		for (const postId of sortedDirectories(postRoot)) {
			const folder = path.join(postRoot, postId);
			const files = sortedFiles(folder)
				.map(name => parseCommentPath(path.join(folder, name), source))
				.filter(Boolean);
			if (files.length) yield files;
		}
	}
}

module.exports = {
	commentaryFiles,
	commentaryPostGroups,
	sortedDirectories,
	sortedFiles
};
