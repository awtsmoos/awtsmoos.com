// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Makes read-only native upgrade evidence explicit and actionable.
 * @description The Awtsmoos illumines each source without restarting its vessel;
 * Awtsmoos.com distinguishes a metadata promise from proved native possession.
 */
const SHA = /^[a-f0-9]{40}$/;
const DIGEST = /^[a-f0-9]{64}$/;

function normalizedSha(value) {
	const sha = String(value || "").trim().toLowerCase();
	return SHA.test(sha) ? sha : null;
}

/** Never describes a different commit as necessarily older without ancestry. */
export function assessNativeUpgrade({ descriptor, installedSha, installedVersion, expectedSha } = {}) {
	const published = normalizedSha(descriptor?.releaseSourceSha);
	const installed = normalizedSha(installedSha);
	const expected = normalizedSha(expectedSha);
	const version = typeof descriptor?.version === "string" ? descriptor.version.trim() : "";
	const manifestHash = String(descriptor?.manifestSha256 || "").toLowerCase();
	const valid = descriptor?.ok === true && published && version.length > 0 &&
		DIGEST.test(manifestHash);
	if (!valid) {
		return { ok: false, status: "invalid_public_descriptor",
			canActivate: false, artifactIntegrity: "unverified" };
	}
	if (expectedSha && (!expected || expected !== published)) {
		return { ok: false, status: "unexpected_public_commit", publishedSha: published,
			expectedSha: expected, canActivate: false, artifactIntegrity: "unverified" };
	}
	const status = !installed ? "installed_source_unknown"
		: installed === published ? "already_current" : "different_native_source";
	return {
		ok: true,
		status,
		publishedVersion: version,
		installedVersion: String(installedVersion || "").trim() || null,
		publishedSha: published,
		installedSha: installed,
		manifestSha256: manifestHash,
		artifactIntegrity: "metadata_only_unverified",
		canActivate: false,
		activationPerformed: false,
		nextAction: status === "already_current" ? "verify_native_health"
			: "verify_public_artifacts_and_arrange_safe_native_handoff"
	};
}
