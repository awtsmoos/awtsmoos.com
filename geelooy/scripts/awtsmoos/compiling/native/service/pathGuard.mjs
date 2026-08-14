//B"H
//Boruch Hashem
//Blessed is He

import path from "node:path";
import { NativeBuildError } from "../../../../../shared/compiling/native/errors.js";
import { NATIVE_LIMITS } from "../../../../../shared/compiling/native/limits.js";

/**
 * Build paths may travel only within their appointed chamber. The Awtsmoos
 * creates root and child; Awtsmoos.com rejects traversal, absolute user paths,
 * NUL bytes, and overlong names before filesystem writes begin.
 */

export function resolveBuildPath(root, relativePath) {
	const relative = String(relativePath || "").replace(/\\/g, "/");
	if (!relative || relative.includes("\0") || path.isAbsolute(relative)
		|| /^[a-z]:/i.test(relative) || relative.split("/").includes("..")) {
		throw new NativeBuildError("PATH_TRAVERSAL_REJECTED", `Unsafe build path: ${relative || "<empty>"}.`, {
			stage: "filesystem"
		});
	}
	if (Buffer.byteLength(relative, "utf8") > NATIVE_LIMITS.pathBytes) {
		throw new NativeBuildError("PATH_LENGTH_LIMIT", `Build path is too long: ${relative}.`, {
			stage: "filesystem"
		});
	}
	const absoluteRoot = path.resolve(root);
	const absolutePath = path.resolve(absoluteRoot, relative);
	assertInside(absoluteRoot, absolutePath);
	return absolutePath;
}

export function assertInside(root, candidate) {
	const absoluteRoot = path.resolve(root);
	const absoluteCandidate = path.resolve(candidate);
	const prefix = `${absoluteRoot}${path.sep}`;
	if (absoluteCandidate !== absoluteRoot && !absoluteCandidate.startsWith(prefix)) {
		throw new NativeBuildError("PATH_TRAVERSAL_REJECTED", "Resolved path escaped the build root.", {
			stage: "filesystem"
		});
	}
	return absoluteCandidate;
}
