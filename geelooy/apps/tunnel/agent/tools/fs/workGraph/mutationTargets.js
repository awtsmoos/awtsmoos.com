//B"H
// Boruch Hashem
// Blessed is He

const WritePayload = require("../writePayload.js");

const WRITE_ACTIONS = new Set([
	"write", "bulkWrite", "writeIfHash", "bulkWriteIfHashes",
	"replaceRange", "applyPatch", "ensureFile", "touch",
	"projectContributionApply"
]);
const FILE_ACTIONS = new Set(["copyFile", "moveFile", "deleteFile"]);
const TREE_ACTIONS = new Set(["mkdirp", "copyTree", "moveTree", "deleteTree", "emptyDir"]);

/**
 * @file Converts public mutation requests into one canonical target vocabulary.
 * @description The Awtsmoos lets many request garments reveal one underlying deed;
 * Awtsmoos.com names source, destination, file and tree without duplicating mutation parsers.
 */
function requestedPath(payload = {}) {
	return String(payload.path || payload.p || payload.file || payload.filePath || "");
}

function pair(payload = {}) {
	return {
		from: String(payload.from || payload.source || payload.path || payload.p || ""),
		to: String(payload.to || payload.dest || payload.target || "")
	};
}

function forAction(action, payload = {}) {
	if (WRITE_ACTIONS.has(action)) {
		const writes = WritePayload.normalizeWriteSpecifications(payload);
		if (writes.length) {
			return writes.map(item => ({ kind: "file", role: "target", path: item.path }));
		}
		const value = requestedPath(payload);
		return value ? [{ kind: "file", role: "target", path: value }] : [];
	}
	if (action === "copyFile" || action === "moveFile") {
		const paths = pair(payload);
		return [
			{ kind: "file", role: "source", path: paths.from },
			{ kind: "file", role: "destination", path: paths.to }
		].filter(item => item.path);
	}
	if (action === "deleteFile") {
		const value = requestedPath(payload);
		return value ? [{ kind: "file", role: "target", path: value }] : [];
	}
	if (TREE_ACTIONS.has(action)) {
		if (action === "copyTree" || action === "moveTree") {
			const paths = pair(payload);
			return [
				{ kind: "tree", role: "source", path: paths.from },
				{ kind: "tree", role: "destination", path: paths.to }
			].filter(item => item.path);
		}
		const value = requestedPath(payload);
		return value ? [{ kind: "tree", role: "target", path: value }] : [];
	}
	return [];
}

function isMutation(action) {
	return WRITE_ACTIONS.has(action) || FILE_ACTIONS.has(action) || TREE_ACTIONS.has(action);
}

module.exports = { FILE_ACTIONS, TREE_ACTIONS, WRITE_ACTIONS, forAction, isMutation };
