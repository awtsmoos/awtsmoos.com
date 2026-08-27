#!/usr/bin/env bash
# B"H
# Boruch Hashem
# Blessed is He

set -u

LAB="/Users/awtsmoos/work/awtsmoos-mitzvah-massive-lab"
EVIDENCE="$LAB/.evidence"
LOG="$EVIDENCE/remaining-compiler.log"
STATUS="$EVIDENCE/remaining-compiler.exit"
ARTIFACT="$LAB/geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/mitzvah-world.compact.js"

mkdir -p "$EVIDENCE"
rm -f "$STATUS"
exec >"$LOG" 2>&1
cd "$LAB" || exit 90

run_step() {
	local label="$1"
	shift
	printf '\n=== %s ===\n' "$label"
	"$@"
	local exit_code=$?
	printf '=== %s exit=%s ===\n' "$label" "$exit_code"
	if [ "$exit_code" -ne 0 ]; then
		printf '%s\n' "$exit_code" >"$STATUS"
		exit "$exit_code"
	fi
}

run_step "Generated compact syntax" node --check "$ARTIFACT"
run_step "Generated native boot contract" node --test \
	geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/test/world/minimalMeadowNativeBootContract.test.mjs
run_step "CompactJS compiler universe" node ayzarim/awtsmoosDynamicServer/tests/compactJs.test.js
run_step "CompactJS Mitzvah feature graph" node ayzarim/awtsmoosDynamicServer/tests/compactJs.mitzvahFeature.test.js
run_step "CompactJS Mitzvah runtime graph" node ayzarim/awtsmoosDynamicServer/tests/compactJs.mitzvahWorldRuntime.test.js

printf '\n=== Artifact evidence ===\n'
wc -c "$ARTIFACT"
shasum -a 256 "$ARTIFACT"
printf '\n=== Handwritten line ceilings ===\n'
wc -l \
	geelooy/libs/awtsmoos-procedural-core/src/adapters/awtsmoos/createAwtsmoosAdapterManifest.js \
	geelooy/libs/awtsmoos-procedural-core/src/adapters/awtsmoos/createAwtsmoosObjectRuntime.js \
	geelooy/libs/awtsmoos-procedural-core/src/adapters/awtsmoos/index.js \
	geelooy/libs/awtsmoos-procedural-core/src/adapters/awtsmoos/materializeGeometryArtifact.js \
	geelooy/libs/awtsmoos-procedural-core/test/awtsmoosAdapterSourceContract.test.mjs \
	geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/app/MinimalMeadowBootTimeline.js \
	geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/app/MinimalMeadowEssentialFeatureGate.js \
	geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/app/createMinimalMeadowRuntime.js \
	geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/app/MinimalMeadowFeatureScheduler.js \
	geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/test/app/minimalMeadowBootTimeline.test.mjs \
	geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/test/app/minimalMeadowEssentialFeatureGate.test.mjs \
	geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/test/app/minimalMeadowFeatureScheduler.test.mjs \
	geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/test/world/minimalMeadowNativeBootContract.test.mjs \
	ayzarim/awtsmoosDynamicServer/tests/compactJs.mitzvahWorldRuntime.test.js

printf '0\n' >"$STATUS"
printf '\nB_H remaining compiler verification passed\n'
