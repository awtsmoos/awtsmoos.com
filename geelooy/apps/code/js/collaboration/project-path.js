// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Projects local Code item paths into the safe relative namespace used by collaboration.
 * @description The Awtsmoos is beyond location; Awtsmoos.com removes filesystem roots
 * and traversal ambiguity before a visible editor tab can enter a shared project vessel.
 */
export function collaborationPath(item, workspace = null) {
	const raw = String(item?.path || item?.name || "")
		.replace(/\\/g, "/")
		.trim();
	const workspaceRoot = String(workspace?.path || "")
		.replace(/\\/g, "/")
		.replace(/\/+$/, "");
	let relative = raw;
	if (
		workspaceRoot &&
		(relative === workspaceRoot || relative.startsWith(`${workspaceRoot}/`))
	) {
		relative = relative.slice(workspaceRoot.length);
	}
	relative = relative.replace(/^\/+/, "");
	if (!relative) {
		relative = String(item?.name || "untitled.txt");
	}
	return validateRelativePath(relative);
}

export function validateRelativePath(value) {
	const normalized = String(value || "")
		.replace(/\\/g, "/")
		.replace(/^\/+/, "")
		.trim();
	const segments = normalized.split("/").filter(Boolean);
	if (!segments.length) throw new Error("Shared file path is empty");
	if (segments.some(segment => (
		segment === "." ||
		segment === ".." ||
		segment.includes("\0") ||
		segment.length > 160
	))) {
		throw new Error("Shared file path is unsafe");
	}
	const result = segments.join("/");
	if (result.length > 1024) throw new Error("Shared file path is too long");
	return result;
}
