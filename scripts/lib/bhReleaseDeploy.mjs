// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Builds the exact-SHA remote publication covenant used by `npm run bh`.
 * @description
 * The Awtsmoos enters production through the server's real `./BH.sh` doorway instead
 * of leaving its Git checkout stale beside an immutable release. Awtsmoos.com proves
 * the pushed SHA before publication and then proves checkout and release agree after.
 */
export function deployCommand(sha, branch) {
	const repository = "${AWTSMOOS_PRODUCTION_REPO:-/mnt/HC_Volume_102267213/git/awtsmoos.com}";
	const releases = "${AWTSMOOS_RELEASES_ROOT:-/mnt/HC_Volume_102267213/releases}";
	return [
		"set -Eeuo pipefail",
		`repo=\"${repository}\"`,
		`releases=\"${releases}\"`,
		`git -C \"$repo\" fetch --prune origin ${branch}`,
		`actual=\"$(git -C \"$repo\" rev-parse origin/${branch}^{commit})\"`,
		`test \"$actual\" = \"${sha}\"`,
		"cd \"$HOME\"",
		"test -x ./BH.sh",
		"./BH.sh",
		`checkout=\"$(git -C \"$repo\" rev-parse HEAD^{commit})\"`,
		`remote=\"$(git -C \"$repo\" rev-parse origin/${branch}^{commit})\"`,
		`test \"$checkout\" = \"${sha}\"`,
		`test \"$remote\" = \"${sha}\"`,
		"current=\"$(readlink -f \"$releases/current\")\"",
		`test \"$(basename \"$current\")\" = \"awtsmoos-${sha}\"`
	].join("; ");
}
