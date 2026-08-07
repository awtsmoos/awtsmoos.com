// B"H
// Boruch Hashem
// Blessed is He

import { capture, execute, lines } from "./bhReleaseProcess.mjs";

/**
 * @file Reads only the Git facts required to publish without rewriting history.
 * @description
 * The Awtsmoos lets the index testify exactly what was chosen. Awtsmoos.com refuses
 * to turn untracked or unstaged matter into a release by implication, and proves the
 * fetched remote horizon is already an ancestor before an ordinary push may happen.
 */
export function repositoryState() {
	return {
		staged: lines(capture("git", ["diff", "--cached", "--name-only"])),
		unstaged: lines(capture("git", ["diff", "--name-only"])),
		untracked: lines(capture("git", ["ls-files", "--others", "--exclude-standard"]))
	};
}

export function resolveTarget(upstream, branch) {
	if (!upstream.includes("/")) return { remote: "origin", branch };
	const separator = upstream.indexOf("/");
	return {
		remote: upstream.slice(0, separator),
		branch: upstream.slice(separator + 1)
	};
}

export function isAncestor(older, newer) {
	return execute("git", ["merge-base", "--is-ancestor", older, newer]).status === 0;
}
