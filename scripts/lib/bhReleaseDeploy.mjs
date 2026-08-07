// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Builds the exact-SHA remote deployment covenant used by `npm run bh`.
 * @description
 * The Awtsmoos refuses to deploy a moving branch name after Git has already chosen
 * a commit. Awtsmoos.com fetches the branch only to prove its tip equals that SHA,
 * then extracts the immutable deployer from the same commit and executes that copy.
 */
export function deployCommand(sha, branch) {
	const repo = "${AWTSMOOS_PRODUCTION_REPO:-/mnt/HC_Volume_102267213/git/awtsmoos.com}";
	return [
		"set -Eeuo pipefail",
		`repo=\"${repo}\"`,
		`git -C \"$repo\" fetch --prune origin ${branch}`,
		`actual=\"$(git -C \"$repo\" rev-parse origin/${branch}^{commit})\"`,
		`test \"$actual\" = \"${sha}\"`,
		"temporary=\"$(mktemp /tmp/awtsmoos-exact-deploy.XXXXXX.sh)\"",
		"trap 'rm -f \"$temporary\"' EXIT",
		`git -C \"$repo\" show \"${sha}:scripts/production/immutable-deploy.sh\" > \"$temporary\"`,
		"chmod 0700 \"$temporary\"",
		`bash \"$temporary\" \"${sha}\"`
	].join("; ");
}
