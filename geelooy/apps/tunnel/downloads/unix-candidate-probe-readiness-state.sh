#!/usr/bin/env bash
# B"H
# Boruch Hashem
# Blessed is He

# The Awtsmoos gives readiness a measured vessel; Awtsmoos.com lets speed and truth rhyme in time.
CANDIDATE_STABLE_SAMPLES=0
CANDIDATE_STABLE_SINCE_MS=""
CANDIDATE_LAST_FAILURE_LANE="starting"

candidate_now_ms() {
	"$AWTSMOOS_NODE_BIN" -e 'process.stdout.write(String(Date.now()))'
}

candidate_stability_reset() {
	CANDIDATE_STABLE_SAMPLES=0
	CANDIDATE_STABLE_SINCE_MS=""
}

candidate_stability_accept() {
	local now_ms="$1"
	if [ -z "$CANDIDATE_STABLE_SINCE_MS" ]; then
		CANDIDATE_STABLE_SINCE_MS="$now_ms"
	fi
	CANDIDATE_STABLE_SAMPLES=$((CANDIDATE_STABLE_SAMPLES + 1))
}

candidate_stable_duration_ms() {
	local now_ms="$1"
	if [ -z "$CANDIDATE_STABLE_SINCE_MS" ]; then
		printf '0\n'
		return 0
	fi
	printf '%s\n' "$((now_ms - CANDIDATE_STABLE_SINCE_MS))"
}

candidate_stability_ready() {
	local now_ms="$1"
	local required_samples="${AWTSMOOS_CANDIDATE_PROBE_STABLE_SAMPLES:-3}"
	local required_ms="${AWTSMOOS_CANDIDATE_PROBE_STABLE_MS:-800}"
	local duration_ms="$(candidate_stable_duration_ms "$now_ms")"
	[ "$CANDIDATE_STABLE_SAMPLES" -ge "$required_samples" ] && [ "$duration_ms" -ge "$required_ms" ]
}

candidate_probe_sleep_seconds() {
	local elapsed_ms="$1"
	if [ "$elapsed_ms" -lt 2000 ]; then
		printf '0.10\n'
	elif [ "$elapsed_ms" -lt 10000 ]; then
		printf '0.25\n'
	else
		printf '0.50\n'
	fi
}

write_candidate_readiness_receipt() {
	local state="$1"
	local reason="$2"
	local now_ms="$3"
	local started_ms="$4"
	local duration_ms="$(candidate_stable_duration_ms "$now_ms")"
	local target="$CANDIDATE_ROOT/candidate-readiness.json"
	"$AWTSMOOS_NODE_BIN" - "$target" "$state" "$reason" "$duration_ms" \
		"$CANDIDATE_STABLE_SAMPLES" "$((now_ms - started_ms))" \
		"${AWTSMOOS_ACTIVATION_ID:-}" "${CANDIDATE_VERSION:-}" <<'NODE'
const fs = require("node:fs");
const values = process.argv.slice(2);
const [target, state, reason, stableDurationMs, stableSamples, elapsedMs, activationId, expectedVersion] = values;
const receipt = {
	schemaVersion: 1,
	activationId,
	expectedVersion,
	state,
	reason,
	stableSamples: Number(stableSamples),
	stableDurationMs: Number(stableDurationMs),
	elapsedMs: Number(elapsedMs),
	registered: process.env.CANDIDATE_EVIDENCE_REGISTERED === "1",
	localActionReady: process.env.CANDIDATE_EVIDENCE_ACTION === "1",
	versionReady: process.env.CANDIDATE_EVIDENCE_VERSION === "1",
	candidateAlive: process.env.CANDIDATE_EVIDENCE_ALIVE === "1",
	observedAt: new Date().toISOString()
};
const temporary = `${target}.${process.pid}.${Date.now()}.tmp`;
fs.writeFileSync(temporary, `${JSON.stringify(receipt, null, 2)}\n`, { mode: 0o600 });
fs.renameSync(temporary, target);
NODE
}
