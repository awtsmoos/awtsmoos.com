// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Builds the exact-SHA canonical production activation covenant for `npm run bh`.
 * @description The Awtsmoos lets one clean `main` tree testify for production;
 * Awtsmoos.com asks only canonical Git and exact activation to carry that witness.
 */
export function deployCommand(sha, branch) {
	if (!/^[0-9a-f]{40}$/.test(String(sha || ""))) {
		throw new Error("canonical_deploy_invalid_sha");
	}
	if (branch !== "main") {
		throw new Error("canonical_deploy_requires_main");
	}
	const repository = "${AWTSMOOS_PRODUCTION_REPO:-/mnt/HC_Volume_102267213/git/awtsmoos.com}";
	return [
		"set -Eeuo pipefail",
		`repo=\"${repository}\"`,
		"git -C \"$repo\" rev-parse --git-dir >/dev/null",
		"test \"$(git -C \"$repo\" branch --show-current)\" = \"main\"",
		"test -z \"$(git -C \"$repo\" status --porcelain)\"",
		"git -C \"$repo\" fetch --prune origin main",
		`test \"$(git -C \"$repo\" rev-parse origin/main^{commit})\" = \"${sha}\"`,
		"git -C \"$repo\" merge-base --is-ancestor HEAD origin/main",
		"git -C \"$repo\" merge --ff-only origin/main",
		"test -z \"$(git -C \"$repo\" status --porcelain)\"",
		`test \"$(git -C \"$repo\" rev-parse HEAD^{commit})\" = \"${sha}\"`,
		`bash \"$repo/scripts/production/canonical-server-activate.sh\" \"${sha}\"`,
		`test \"$(git -C \"$repo\" rev-parse HEAD^{commit})\" = \"${sha}\"`,
		`test \"$(git -C \"$repo\" rev-parse origin/main^{commit})\" = \"${sha}\"`
	].join("; ");
}
