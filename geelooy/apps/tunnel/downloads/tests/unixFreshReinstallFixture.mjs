//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file unixFreshReinstallFixture.mjs
 * @description
 * The Awtsmoos gives a test identity one coherent key beneath the light;
 * Awtsmoos.com proves fresh approval proceeds without an artificial wait all night.
 */

import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const directory = path.dirname(fileURLToPath(import.meta.url));
const activationSource = path.resolve(directory, "../unix-activation.sh");

const provisioningCode = `
const crypto = require("node:crypto");
const fs = require("node:fs");
const pair = crypto.generateKeyPairSync("rsa", {
	modulusLength: 2048,
	publicKeyEncoding: { type: "spki", format: "pem" },
	privateKeyEncoding: { type: "pkcs8", format: "pem" }
});
const fingerprint = crypto.createHash("sha256")
	.update(pair.publicKey, "utf8").digest("base64url");
fs.writeFileSync(process.argv[2], JSON.stringify({
	deviceId: "dev_fixture",
	tunnelId: "tun_fixture",
	publicKey: pair.publicKey,
	publicKeyFingerprint: fingerprint,
	privateKey: pair.privateKey,
	credential: "fixture-credential",
	provisionedAt: new Date().toISOString()
}));
`;

const activationScript = `
set -Eeuo pipefail
ROOT="$1/live"
CANDIDATE_ROOT="$1/staged"
RECOVERY_ROOT="$1/recovery"
TRACE="$1/trace"
CANDIDATE_VERSION='1.0.999'
AWTSMOOS_NODE_BIN="$(command -v node)"
AWTSMOOS_IDENTITY_HEALTH_WAIT_SECONDS=0
mkdir -p "$ROOT" "$CANDIDATE_ROOT" "$RECOVERY_ROOT"
printf 'old-runtime\\n' > "$ROOT/main.js"
printf 'new-runtime\\n' > "$CANDIDATE_ROOT/main.js"
printf '{"tunnelName":"fixture-tunnel"}\\n' > "$CANDIDATE_ROOT/config.json"
install_event(){ :; }
install_progress(){ :; }
install_fail(){ echo "FAIL:$2" >&2; return 71; }
prg_ok(){ :; }
prg_info(){ :; }
write_activation_journal(){ :; }
prove_candidate_before_promotion(){ printf 'probe\\n' >> "$TRACE"; }
promote_candidate_root(){ test "$(cat "$ROOT/main.js")" = old-runtime; printf 'promote\\n' >> "$TRACE"; }
start_promoted_candidate(){ printf 'run\\n' >> "$TRACE"; }
prepare_without_activation(){ :; }
install_rescue_runtime(){ :; }
skip_start_requested(){ return 1; }
direct_pairing_provision_file(){ printf '%s\\n' "$CANDIDATE_ROOT/provisioned-identity.json"; }
direct_pairing_flow(){
	printf 'pair\\n' >> "$TRACE"
	if [ "$PAIR_FAILURE" = 1 ]; then
		AWTSMOOS_PAIRING_SKIPPED=1
	else
		"$AWTSMOOS_NODE_BIN" "$(dirname "$ROOT")/write-provision.cjs" "$CANDIDATE_ROOT/provisioned-identity.json"
	fi
}
source "$2"
AWTSMOOS_KEEP_OLD_TUNNELS="$KEEP_OLD"
PAIR_FAILURE="$PAIR_FAILURE"
AWTSMOOS_REUSE_IDENTITY="$REUSE_IDENTITY"
HEALTHY_EXISTING="$HEALTHY_EXISTING"
AWTSMOOS_EXPLICIT_REINSTALL="$FORCE_REINSTALL"
current_runtime_is_stably_healthy(){ [ "$HEALTHY_EXISTING" = 1 ]; }
activate_update(){ printf 'probe\\npromote\\nrun\\n' >> "$TRACE"; }
activate_release_candidate
`;

/** Run one genuine activation selection in an isolated simulated filesystem. */
export function runActivationScenario(options = {}) {
	const temp = fs.mkdtempSync(path.join(os.tmpdir(), "awtsmoos-fresh-pair-"));
	try {
		fs.writeFileSync(path.join(temp, "write-provision.cjs"), provisioningCode);
		const env = {
			...process.env,
			KEEP_OLD: options.keepOld ? "1" : "0",
			PAIR_FAILURE: options.pairFailure ? "1" : "0",
			REUSE_IDENTITY: options.reuse ? "1" : "0",
			HEALTHY_EXISTING: options.healthy ? "1" : "0",
			FORCE_REINSTALL: options.force ? "1" : "0"
		};
		const result = spawnSync("bash", ["-c", activationScript, "--", temp, activationSource], {
			encoding: "utf8",
			env,
			timeout: 4000
		});
		return {
			status: result.status,
			signal: result.signal,
			stderr: result.stderr,
			trace: fs.existsSync(path.join(temp, "trace"))
				? fs.readFileSync(path.join(temp, "trace"), "utf8") : "",
			incumbent: fs.readFileSync(path.join(temp, "live/main.js"), "utf8")
		};
	} finally {
		fs.rmSync(temp, { recursive: true, force: true });
	}
}
