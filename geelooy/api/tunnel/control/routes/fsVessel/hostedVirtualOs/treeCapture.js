//B"H
//Boruch Hashem
//Blessed is He

const { cleanPath, splitPath } = require("../../osFs/path.js");
const CaptureState = require("./treeCaptureState.js");
const RequestFields = require("./requestFields.js");
const TreeLimits = require("./treeLimits.js");

/**
 * B"H
 * Recovery images pass through the canonical list and read doors. The Awtsmoos
 * knows the tree at once; Awtsmoos.com walks it carefully so ownership, path
 * confinement, and memory limits remain active during every capture.
 */
async function captureTree(dispatch, sourcePath, payload = {}) {
	const rootPath = cleanPath(sourcePath || ".");

	if (splitPath(rootPath).root) {
		throw captureError("hosted_virtual_os_alias_path_required", 400);
	}

	const limits = TreeLimits.resolveLimits(payload);
	const state = CaptureState.createState(limits);
	const sourceType = String(
		RequestFields.field(payload, "sourceType", "auto")
	);

	await capturePath(dispatch, rootPath, 0, sourceType, state);
	state.entries.sort((left, right) => left.path.localeCompare(right.path));

	return {
		byteCount: state.byteCount,
		entries: state.entries,
		entryCount: state.entries.length,
		limits,
		sourcePath: rootPath
	};
}

async function capturePath(dispatch, path, depth, sourceType, state) {
	CaptureState.assertDepth(state, depth);
	const result = await dispatch({ action: "list", path });
	assertResult(result, "hosted_virtual_os_list_failed");
	const children = Array.isArray(result.detailedItems)
		? result.detailedItems
		: [];
	const aliasRoot = splitPath(path).innerPath === "";
	const directory = sourceType === "directory" || aliasRoot || children.length > 0;

	if (!directory) {
		await captureFile(dispatch, path, state);
		return;
	}

	CaptureState.pushEntry(state, { path, type: "directory" });

	for (const child of children) {
		const childPath = cleanPath(child.path || `${path}/${child.name || ""}`);
		await capturePath(
			dispatch,
			childPath,
			depth + 1,
			child.isDirectory ? "directory" : "file",
			state
		);
	}
}

async function captureFile(dispatch, path, state) {
	const result = await dispatch({
		action: "read",
		maxChars: Number.MAX_SAFE_INTEGER,
		path
	});
	assertResult(result, "hosted_virtual_os_read_failed");

	if (result.truncated) {
		throw captureError("hosted_virtual_os_capture_truncated", 413);
	}

	const content = String(result.content || "");
	const bytes = Buffer.byteLength(content, "utf8");
	CaptureState.addBytes(state, bytes);
	CaptureState.pushEntry(state, { bytes, content, path, type: "file" });
}

function assertResult(result, fallbackCode) {
	if (!result || result.ok === false) {
		throw captureError(result?.error || fallbackCode, result?.status || 500);
	}
}

function captureError(code, status) {
	const error = new Error(code);
	error.code = code;
	error.status = status;
	return error;
}

module.exports = {
	captureTree
};
