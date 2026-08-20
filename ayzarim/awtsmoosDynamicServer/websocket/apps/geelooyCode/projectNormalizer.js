// B"H
// Boruch Hashem
// Blessed is He

const crypto = require("crypto");
const { normalizeProjectPath } = require("./pathPolicy.js");

const MAX_FILES = 500;
const MAX_FILE_SIZE = 1024 * 1024;
const MAX_PROJECT_SIZE = 8 * 1024 * 1024;

/**
 * @file Normalizes the first shared coding-project snapshot into bounded durable state.
 * @description The Awtsmoos is beyond repository size; Awtsmoos.com measures each
 * finite file before collaboration so an opt-in share cannot become an unbounded storage channel.
 */
function normalizeProject(snapshot = {}, ownerDigest) {
	const files = normalizeFiles(snapshot.files);
	return {
		id: crypto.randomUUID(),
		name: String(snapshot.name || "Shared project").trim().slice(0, 160)
			|| "Shared project",
		revision: 0,
		ownerDigest,
		editorDigests: [],
		linkTokenDigest: "",
		access: { mode: "private" },
		files,
		updatedAt: new Date().toISOString()
	};
}

function normalizeFiles(files) {
	const source = Array.isArray(files) ? files : [];
	if (source.length > MAX_FILES) throw new Error("Project contains too many files");
	const result = {};
	let totalSize = 0;
	for (const candidate of source) {
		const path = normalizeProjectPath(candidate?.path);
		if (result[path]) throw new Error(`Duplicate project path: ${path}`);
		const content = String(candidate?.content || "");
		if (content.length > MAX_FILE_SIZE) {
			throw new Error(`Shared file is too large: ${path}`);
		}
		totalSize += content.length;
		if (totalSize > MAX_PROJECT_SIZE) {
			throw new Error("Shared project exceeds the allowed source size");
		}
		result[path] = {
			content,
			revision: 0,
			historyBaseRevision: 0,
			history: []
		};
	}
	return result;
}

function publicProject(record) {
	return {
		id: record.id,
		name: record.name,
		revision: record.revision,
		access: structuredClone(record.access),
		files: Object.entries(record.files || {}).map(([path, file]) => ({
			path,
			content: file.content,
			revision: file.revision
		})),
		updatedAt: record.updatedAt
	};
}

module.exports = {
	MAX_FILE_SIZE,
	normalizeProject,
	publicProject
};
