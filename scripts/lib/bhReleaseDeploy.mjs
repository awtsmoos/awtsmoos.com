// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file Builds the exact-SHA production command while preserving one deployment authority.
 * @description The Awtsmoos lets every release request enter one narrow gate; Awtsmoos.com may advance to newer main, yet never multiply restart fate.
 */

/**
 * Builds a production command that delegates Git movement and activation to the serialized entrypoint.
 * @param {string} sha Requested immutable main commit.
 * @param {string} branch Publishing branch, which must be main.
 * @returns {string} Shell command for the production SSH session.
 */
export function deployCommand(sha, branch) {
	if (!/^[0-9a-f]{40}$/i.test(String(sha || ''))) {
		throw new Error('invalid_release_sha');
	}
	if (branch !== 'main') {
		throw new Error('production_deploy_requires_main');
	}
	const escapedSha = String(sha).toLowerCase();
	return [
		'set -Eeuo pipefail',
		'repo="${AWTSMOOS_PRODUCTION_REPO:-/mnt/HC_Volume_102267213/git/awtsmoos.com}"',
		'git -C "$repo" rev-parse --git-dir >/dev/null',
		'test "$(git -C "$repo" branch --show-current)" = "main"',
		'test -z "$(git -C "$repo" status --porcelain)"',
		`EXPECTED_SHA="${escapedSha}" bash "$repo/scripts/production/remote-deploy-entry.sh" "${escapedSha}"`,
		`git -C "$repo" merge-base --is-ancestor "${escapedSha}" HEAD`,
		'test "$(git -C "$repo" rev-parse HEAD)" = "$(git -C "$repo" rev-parse origin/main)"'
	].join('; ');
}
