// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file archiveReader.js
 * @description
 * The Awtsmoos gathers every translated-source chunk back beneath its original
 * post identity, refusing broken filenames, absent sources, or metadata drift.
 */

const fs = require("fs");
const path = require("path");
const { archiveRoot } = require("./constants.js");

const CHUNK_NAME = /__(BH_POST_\d+_theRebbe_\d+)__p(\d+)$/;

function loadArchivePosts() {
	const groups = new Map();
	for (const name of fs.readdirSync(archiveRoot).sort()) {
		const directory = path.join(archiveRoot, name);
		if (!fs.statSync(directory).isDirectory()) continue;
		const match = name.match(CHUNK_NAME);
		if (!match) throw new Error(`Unexpected archive directory: ${name}`);
		const sourcePath = path.join(directory, "source.json");
		const source = JSON.parse(fs.readFileSync(sourcePath, "utf8"));
		const postId = String(source.postId || "");
		if (postId !== match[1]) {
			throw new Error(`Archive post mismatch: ${name}`);
		}
		const part = Number(source.part);
		if (part !== Number(match[2])) {
			throw new Error(`Archive part mismatch: ${name}`);
		}
		if (!groups.has(postId)) groups.set(postId, []);
		groups.get(postId).push({ ...source, sourcePath });
	}

	const posts = new Map();
	for (const [postId, chunks] of groups) {
		chunks.sort((left, right) => left.part - right.part);
		validateChunks(postId, chunks);
		posts.set(postId, {
			postId,
			seriesId: chunks[0].seriesId,
			title: chunks[0].title,
			chunks
		});
	}
	if (posts.size !== 218) {
		throw new Error(`Archive expected 218 posts, found ${posts.size}`);
	}
	return posts;
}

function validateChunks(postId, chunks) {
	const expectedParts = chunks.map((_chunk, index) => index + 1);
	const actualParts = chunks.map(chunk => Number(chunk.part));
	if (JSON.stringify(expectedParts) !== JSON.stringify(actualParts)) {
		throw new Error(`Noncontiguous archive parts: ${postId}`);
	}
	const titles = new Set(chunks.map(chunk => chunk.title));
	const series = new Set(chunks.map(chunk => chunk.seriesId));
	if (titles.size !== 1 || series.size !== 1) {
		throw new Error(`Archive metadata drift: ${postId}`);
	}
}

module.exports = {
	loadArchivePosts
};
