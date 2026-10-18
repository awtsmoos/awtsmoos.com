#!/usr/bin/env bash
# B"H
# Boruch Hashem
# Blessed is He

# Installer-direct device pairing (Yaakov 2026-10-14).
#
# The Awtsmoos lets the installer complete the browser covenant directly. Instead
# of starting a candidate agent and hoping its poll loop detects approval, the
# installer itself:
#   1. Generates the device identity (keypair + deviceId)
#   2. Creates the pairing request via API
#   3. Shows the approval card
#   4. Polls pairing/state directly (passive, never consumes)
#   5. On approval: consumes the pairing, decrypts the credential
#   6. Writes a provisioned-identity file for the agent
#   7. The agent starts already-paired — no pairing poll needed. Instant.

DIRECT_PAIRING_SCRIPT="${AWTSMOOS_INSTALL_RUNTIME:-}/unix-pairing-direct.cjs"
# B"H — these resolve at call time (CANDIDATE_ROOT/RECOVERY_ROOT may not be
# set when this file is sourced).
direct_pairing_data_file() { printf '%s' "${RECOVERY_ROOT:-}/state/direct-pairing.json"; }
direct_pairing_provision_file() { printf '%s' "${CANDIDATE_ROOT:-}/provisioned-identity.json"; }

# B"H — creates the pairing request directly. Outputs pairing data to
# the direct-pairing data file and prints the user code.
direct_pairing_request() {
	local tunnel_name="${1:-}"
	[ -n "$tunnel_name" ] || tunnel_name="$(hostname 2>/dev/null || echo "tunnel-device")"
	[ -n "$AWTSMOOS_NODE_BIN" ] || {
		install_fail "direct-pairing" \
			"Node.js is not available for direct pairing." \
			"AWTSMOOS_NODE_BIN is empty."
	}
	[ -f "$DIRECT_PAIRING_SCRIPT" ] || {
		install_fail "direct-pairing" \
			"Direct pairing script is missing." \
			"expected=$DIRECT_PAIRING_SCRIPT"
	}
	mkdir -p "$(dirname "$(direct_pairing_data_file)")"
	local result
	result="$("$AWTSMOOS_NODE_BIN" "$DIRECT_PAIRING_SCRIPT" request \
		--tunnel-name "$tunnel_name" \
		--device-name "$(hostname 2>/dev/null || echo "tunnel-device")" \
		--platform "$(uname -s 2>/dev/null)-$(uname -m 2>/dev/null)" \
		2>/dev/null)" || {
		# B"H — Yaakov 2026-10-14: Pairing is optional. If the control API is
		# unavailable (e.g., testing on production), warn and continue instead
		# of failing the entire installation. The agent can be paired later.
		printf '%s\n' "⚠️  Pairing skipped: could not create pairing request (control API unavailable)." >&2
		printf '%s\n' "   The tunnel agent is installed and will work. Pair manually later if needed." >&2
		return 1
	}
	local ok
	ok="$(printf '%s' "$result" | "$AWTSMOOS_NODE_BIN" -e '
let s="";process.stdin.on("data",c=>{s+=c;});process.stdin.on("end",()=>{try{const j=JSON.parse(s);process.stdout.write(j.ok?"1":"0");}catch{process.stdout.write("0");}});' 2>/dev/null)"
	[ "$ok" = "1" ] || {
		install_fail "direct-pairing" \
			"Pairing request was rejected by the server." \
			"response=$(printf '%s' "$result" | head -c 200)"
	}
	printf '%s' "$result" > "$(direct_pairing_data_file)"
	chmod 600 "$(direct_pairing_data_file)"
	install_event "direct-pairing" "requested" \
		"Pairing request created directly by the installer." \
		"pairingId=$(direct_pairing_field pairingId)"
}

# B"H — reads one field from the direct pairing data file.
direct_pairing_field() {
	local field="$1"
	[ -f "$(direct_pairing_data_file)" ] || return 1
	"$AWTSMOOS_NODE_BIN" - "$(direct_pairing_data_file)" "$field" <<'NODE' 2>/dev/null
const fs = require("node:fs");
const [file, field] = process.argv.slice(2);
try {
	const value = JSON.parse(fs.readFileSync(file, "utf8"));
	const out = value[field];
	if (out !== undefined && out !== null && out !== "") process.stdout.write(String(out));
} catch {}
NODE
}

# B"H — beautiful approval card for installer-direct pairing.
direct_pairing_show_card() {
	local pairing_id pairing_code approval_url expires_at expires_label
	pairing_id="$(direct_pairing_field pairingId)"
	[ -n "$pairing_id" ] || return 1
	pairing_code="$(direct_pairing_field userCode)"
	approval_url="$(direct_pairing_field approvalUrl)"
	if [ -z "$approval_url" ]; then
		approval_url="https://awtsmoos.com/api/tunnel/control/pairing/page?pairingId=${pairing_id}&pairingCode=${pairing_code}"
	fi
	expires_at="$(direct_pairing_field expiresAt)"
	expires_label="unknown"
	if [ -n "$expires_at" ] && [ "$expires_at" -gt 0 ] 2>/dev/null; then
		local now_ms remaining
		now_ms="$("$AWTSMOOS_NODE_BIN" -p 'Date.now()')"
		remaining=$(( (expires_at - now_ms) / 1000 ))
		if [ "$remaining" -gt 0 ]; then
			expires_label="$(( (remaining + 59) / 60 )) min"
		else
			expires_label="expired"
		fi
	fi
	local c_gold="${PRG_C_GOLD:-}" c_off="${PRG_C_OFF:-}"
	local c_cyan="${PRG_C_CYAN:-}" c_bold="${PRG_C_BOLD:-}"
	local display_code="$pairing_code"
	if [ "${#pairing_code}" -eq 10 ]; then
		display_code="${pairing_code:0:5}-${pairing_code:5}"
	fi
	# B"H — Compact output never assumes a 46-column terminal.
	printf '\n%sAWTSMOOS  |  DEVICE PAIRING%s\n' "$c_bold" "$c_off" >&2
	printf '  Code: %s%s%s\n' "$c_cyan" "$display_code" "$c_off" >&2
	printf '  Status: awaiting approval\n' >&2
	printf '  Open: https://awtsmoos.com/api/tunnel/control/pairing/page\n' >&2
	printf '  Approval link (copy):\n  %s\n' "$approval_url" >&2
	printf '  Expires in %s\n' "$expires_label" >&2
	printf '  Approve only your own pairing code.\n\n' >&2
	return 0
}

# B"H — waits for the human to approve, polling pairing/state directly.
# Returns 0 on approval, 1 on terminal states (expired/cancelled/rejected).
direct_pairing_wait_for_approval() {
	local pairing_id
	pairing_id="$(direct_pairing_field pairingId)"
	[ -n "$pairing_id" ] || return 1
	local poll_interval_ms=1500
	local last_poll_ms=0
	direct_pairing_show_card || true
	install_event "direct-pairing" "waiting" \
		"Waiting for device approval (installer-direct)." \
		"pairingId=$pairing_id"
	while true; do
		local now_ms
		now_ms="$("$AWTSMOOS_NODE_BIN" -p 'Date.now()')"
		if [ "$((now_ms - last_poll_ms))" -ge "$poll_interval_ms" ]; then
			last_poll_ms="$now_ms"
			local state
			state="$(installer_pairing_state "$pairing_id" 2>/dev/null)"
			case "$state" in
				approved)
					prg_ok "Approval detected! Completing registration…"
					install_event "direct-pairing" "approved" \
						"Device approval detected by the installer." \
						"pairingId=$pairing_id"
					return 0
					;;
				expired|cancelled|rejected)
					install_event "direct-pairing" "terminal" \
						"Pairing ended before approval." \
						"state=$state"
					return 1
					;;
			esac
			# B"H — check expiry from our local data.
			local expires_at
			expires_at="$(direct_pairing_field expiresAt)"
			if [ -n "$expires_at" ] && [ "$now_ms" -gt "$expires_at" ] 2>/dev/null; then
				install_event "direct-pairing" "expired" \
					"Pairing code expired before approval." \
					"pairingId=$pairing_id"
				return 1
			fi
		fi
		sleep 1
	done
}

# B"H — consumes the approved pairing and decrypts the credential.
# Writes the provisioned identity file for the agent to pick up.
direct_pairing_consume() {
	local pairing_id request_secret private_key
	pairing_id="$(direct_pairing_field pairingId)"
	request_secret="$(direct_pairing_field requestSecret)"
	private_key="$(direct_pairing_field privateKeyPem)"
	[ -n "$pairing_id" ] && [ -n "$request_secret" ] && [ -n "$private_key" ] || {
		install_fail "direct-pairing" \
			"Pairing data is incomplete; cannot complete registration." \
			"Re-run the installer for a fresh code."
	}
	prg_info "Completing secure registration…"
	local consume_result
	consume_result="$("$AWTSMOOS_NODE_BIN" "$DIRECT_PAIRING_SCRIPT" consume \
		--pairing-id "$pairing_id" \
		--request-secret "$request_secret" \
		2>/dev/null)" || {
		install_fail "direct-pairing" \
			"Could not retrieve the device credential." \
			"The pairing may have been claimed already. Re-run the installer."
	}
	local tunnel_id envelope
	tunnel_id="$(printf '%s' "$consume_result" | "$AWTSMOOS_NODE_BIN" -e '
let s="";process.stdin.on("data",c=>{s+=c;});process.stdin.on("end",()=>{try{const j=JSON.parse(s);process.stdout.write(j.tunnelId||"");}catch{}});' 2>/dev/null)"
	envelope="$(printf '%s' "$consume_result" | "$AWTSMOOS_NODE_BIN" -e '
let s="";process.stdin.on("data",c=>{s+=c;});process.stdin.on("end",()=>{try{const j=JSON.parse(s);process.stdout.write(j.credentialEnvelope||"");}catch{}});' 2>/dev/null)"
	[ -n "$tunnel_id" ] && [ -n "$envelope" ] || {
		install_fail "direct-pairing" \
			"The server did not return a credential." \
			"Re-run the installer for a fresh code."
	}
	# B"H — decrypt the credential envelope with our private key.
	# Write the private key to a temp file to avoid shell-quoting issues.
	local key_tmp
	key_tmp="$(mktemp)"
	printf '%s' "$private_key" > "$key_tmp"
	chmod 600 "$key_tmp"
	local credential
	credential="$("$AWTSMOOS_NODE_BIN" - "$key_tmp" "$envelope" <<'NODE' 2>/dev/null
const crypto = require("node:crypto");
const fs = require("node:fs");
const [keyFile, envelope] = process.argv.slice(2);
try {
	const privateKeyPem = fs.readFileSync(keyFile, "utf8");
	const credential = crypto.privateDecrypt({
		key: privateKeyPem,
		padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
		oaepHash: "sha256"
	}, Buffer.from(envelope, "base64")).toString("utf8");
	process.stdout.write(credential);
} catch (e) {
	process.exit(1);
}
NODE
)"
	rm -f "$key_tmp"
	[ -n "$credential" ] || {
		install_fail "direct-pairing" \
			"Could not decrypt the device credential." \
			"Key mismatch — re-run the installer for a fresh code."
	}
	# B"H — write the provisioned identity for the agent to pick up on startup.
	# The agent reads this, stores it securely, deletes the file, and skips pairing.
	local device_id public_key fingerprint
	device_id="$(direct_pairing_field deviceId)"
	public_key="$(direct_pairing_field publicKeyPem)"
	fingerprint="$(direct_pairing_field publicKeyFingerprint)"
	mkdir -p "$(dirname "$(direct_pairing_provision_file)")"
	DEVICE_ID="$device_id" TUNNEL_ID="$tunnel_id" \
	PUBLIC_KEY="$public_key" FINGERPRINT="$fingerprint" \
	PRIVATE_KEY="$private_key" CREDENTIAL="$credential" \
	"$AWTSMOOS_NODE_BIN" - "$(direct_pairing_provision_file)" <<'NODE' 2>/dev/null
const fs = require("node:fs");
const data = {
	deviceId: process.env.DEVICE_ID,
	tunnelId: process.env.TUNNEL_ID,
	publicKey: process.env.PUBLIC_KEY,
	publicKeyFingerprint: process.env.FINGERPRINT,
	privateKey: process.env.PRIVATE_KEY,
	credential: process.env.CREDENTIAL,
	provisionedAt: new Date().toISOString()
};
fs.writeFileSync(process.argv[2], JSON.stringify(data));
NODE
	chmod 600 "$(direct_pairing_provision_file)"
	# B"H — clean up the pairing data (contains the request secret).
	rm -f "$(direct_pairing_data_file)"
	prg_ok "Device registered instantly."
	install_event "direct-pairing" "provisioned" \
		"Credential provisioned; agent will start already-paired." \
		"tunnelId=$tunnel_id"
}

# B"H — the complete installer-direct pairing flow. Call this instead of
# starting a candidate for the pairing step on fresh installs.
direct_pairing_flow() {
	local tunnel_name="${1:-}"
	# B"H — Yaakov 2026-10-14: If the pairing request fails (e.g., control API
	# unavailable), skip the entire pairing flow gracefully. The agent is
	# installed and can be paired later. Do NOT fail the installation.
	if ! direct_pairing_request "$tunnel_name"; then
		printf '%s\n' "ℹ️  Continuing without pairing. The installation will complete." >&2
		export AWTSMOOS_DIRECT_PAIRING_DONE=1
		export AWTSMOOS_PAIRING_SKIPPED=1
		return 0
	fi
	if ! direct_pairing_wait_for_approval; then
		install_fail "direct-pairing" \
			"Pairing was not approved." \
			"Re-run the installer for a fresh code."
	fi
	direct_pairing_consume
	# B"H — Yaakov 2026-10-14: pairing is fully done here. The candidate
	# probe must NOT run its own pairing-wait logic afterwards — the agent
	# starts already-paired. This flag skips it.
	export AWTSMOOS_DIRECT_PAIRING_DONE=1
}
