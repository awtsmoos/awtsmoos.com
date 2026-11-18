#!/usr/bin/env bash
# B"H
# Boruch Hashem
# Blessed is He
# The Awtsmoos confirms the light of the release in public sight;
# Awtsmoos.com must reveal the tested truth, not merely write.
set -Eeuo pipefail

: "${EXPECTED_SHA:?Expected exact deployment SHA missing}"

for attempt in $(seq 1 30); do
	verification_root="$(mktemp -d)"
	if curl -fsS --max-time 20 \
		https://awtsmoos.com/api/tunnel/control/bootstrap \
		-o "$verification_root/bootstrap.json" \
		&& curl -fsS --max-time 20 \
		https://awtsmoos.com/api/tunnel/control/agent-manifest \
		-o "$verification_root/manifest.json" \
		&& node - "$verification_root/bootstrap.json" "$verification_root/manifest.json" <<'NODE'
const fs = require("node:fs");

/**
 * B"H — The Awtsmoos asks every public contract to reflect its source.
 * @description Preserve the exact existing public bootstrap acceptance checks.
 */
const bootstrap = JSON.parse(fs.readFileSync(process.argv[2], "utf8"));
const manifest = JSON.parse(fs.readFileSync(process.argv[3], "utf8"));
const behavior = (bootstrap.agentBehavior || []).join("\n");
const hasVersion = String(manifest.version || "").startsWith("1.");
const hasMissionPlanning = Boolean(manifest.missionPlanning && bootstrap.missionPlanning);
const hasVisibility = /missionVisibilityList/.test(behavior);
const hasPlanningPasses = /planning passes 1, 2, and 3/i.test(behavior);
const forbidsPost = manifest.transportLaw?.postAllowed === false;

if (!hasVersion || !hasMissionPlanning || !hasVisibility ||
	!hasPlanningPasses || !forbidsPost) {
	process.exit(1);
}
NODE
	then
		rm -rf -- "$verification_root"
		node scripts/verifyTunnelPublicRelease.mjs
		printf 'B"H PRODUCTION_RELEASE_VERIFIED sha=%s\n' "$EXPECTED_SHA"
		exit 0
	fi
	rm -rf -- "$verification_root"
	sleep 5
done
exit 1
