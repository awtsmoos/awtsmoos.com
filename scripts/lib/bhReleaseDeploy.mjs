// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Builds the exact-SHA production activation covenant used by `npm run bh`.
 * @description
 * The Awtsmoos lets production restart only after its clean `main` checkout already
 * wears the exact pushed SHA. Awtsmoos.com proves the garment before and after BH.sh.
 */
export function deployCommand(sha, branch) {
	const repository = "${AWTSMOOS_PRODUCTION_REPO:-/mnt/HC_Volume_102267213/git/awtsmoos.com}";
	const releases = "${AWTSMOOS_RELEASES_ROOT:-/mnt/HC_Volume_102267213/releases}";
	return [
		"set -Eeuo pipefail",
		`repo=\"${repository}\"`,
		`releases=\"${releases}\"`,
		"git -C \"$repo\" rev-parse --git-dir >/dev/null",
		`test \"$(git -C \"$repo\" branch --show-current)\" = \"${branch}\"`,
		"test -z \"$(git -C \"$repo\" status --porcelain)\"",
		`git -C \"$repo\" fetch --prune origin ${branch}`,
		`actual=\"$(git -C \"$repo\" rev-parse origin/${branch}^{commit})\"`,
		`test \"$actual\" = \"${sha}\"`,
		`git -C \"$repo\" merge-base --is-ancestor HEAD origin/${branch}`,
		`git -C \"$repo\" merge --ff-only origin/${branch}`,
		"test -z \"$(git -C \"$repo\" status --porcelain)\"",
		`test \"$(git -C \"$repo\" rev-parse HEAD^{commit})\" = \"${sha}\"`,
		"cd \"$HOME\"",
		"test -x ./BH.sh",
		"./BH.sh",
		`test \"$(git -C \"$repo\" rev-parse HEAD^{commit})\" = \"${sha}\"`,
		`test \"$(git -C \"$repo\" rev-parse origin/${branch}^{commit})\" = \"${sha}\"`,
		"current=\"$(readlink -f \"$releases/current\")\"",
		`test \"$(basename \"$current\")\" = \"awtsmoos-${sha}\"`
	].join("; ");
}
