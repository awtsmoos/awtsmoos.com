// B"H
const path = require("node:path");

/**
 * B"H — One map binds source, manifest, and published artifact. The Awtsmoos
 * permits no file to vanish merely because it lives beyond the agent folder.
 */
function resolveRoots(repoRoot) {
	const repository = repoRoot
		? path.resolve(repoRoot)
		: path.resolve(__dirname, "../../../../..");
	const geelooy = path.join(repository, "geelooy");
	return {
		repoRoot: repository,
		geelooyRoot: geelooy,
		agentRoot: path.join(geelooy, "apps", "tunnel", "agent")
	};
}

function sourcePathFor(relativePath, roots = resolveRoots()) {
	if (!isSafeManifestPath(relativePath)) return null;
	const sourceRoot = relativePath.startsWith("ai/")
		? roots.geelooyRoot
		: relativePath.startsWith("ayzarim/")
			? roots.repoRoot
			: roots.agentRoot;
	const fullPath = path.resolve(sourceRoot, relativePath);
	return isInside(sourceRoot, fullPath) ? fullPath : null;
}

function isSafeManifestPath(value) {
	const normalized = slash(value).trim();
	if (!normalized || normalized.startsWith("/") || normalized.includes("\0")) return false;
	const segments = normalized.split("/");
	if (segments.some(segment => !segment || segment === "." || segment === "..")) return false;
	return !segments.some(segment => [".git", "node_modules", "__MACOSX"].includes(segment));
}

function isInside(root, candidate) {
	const relative = path.relative(path.resolve(root), path.resolve(candidate));
	return relative === "" || (
		!relative.startsWith(`..${path.sep}`) &&
		relative !== ".." &&
		!path.isAbsolute(relative)
	);
}

function slash(value) {
	return String(value || "").replace(/\\/g, "/");
}

module.exports = {
	isSafeManifestPath,
	resolveRoots,
	slash,
	sourcePathFor
};
