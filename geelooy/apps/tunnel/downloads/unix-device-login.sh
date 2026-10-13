#!/usr/bin/env bash
# B"H
# Boruch Hashem
# Blessed is He

# Headless device-flow login (Yaakov 2026-10-12):
# the installer prints a URL + short code, the owner approves on their phone,
# the installer polls until the box is bound to the owner's account.
# Works on a bare GPU box with no browser at all.

# Skip switch: AWTSMOOS_SKIP_DEVICE_LOGIN=1 or --no-login.
device_login_skipped() {
	case "${AWTSMOOS_SKIP_DEVICE_LOGIN:-}" in
		1|true|TRUE|yes|YES|on|ON) return 0 ;;
	esac
	return 1
}

# 0 = this box still needs to log in (not paired yet).
device_login_needed() {
	device_login_skipped && return 1
	[ -n "${ROOT:-}" ] || return 1
	[ -f "$ROOT/device-binding.json" ] || return 0
	"$AWTSMOOS_NODE_BIN" - "$ROOT/device-binding.json" <<'NODE'
const fs = require("node:fs");
try {
	const value = JSON.parse(fs.readFileSync(process.argv[2], "utf8"));
	process.exit(
		value.deviceId && value.tunnelId && value.pairedAt && !value.pairingId ? 1 : 0
	);
} catch {
	process.exit(0);
}
NODE
	[ $? -eq 0 ]
}

device_login_value() {
	local key="$1" file="$2"
	"$AWTSMOOS_NODE_BIN" - "$file" "$key" <<'NODE'
const fs = require("node:fs");
const [file, key] = process.argv.slice(2);
try {
	const value = JSON.parse(fs.readFileSync(file, "utf8"));
	process.stdout.write(String(value[key] ?? ""));
} catch {}
NODE
}

device_login_api() {
	local method="$1" path="$2" payload="${3:-}"
	curl -sS -L --connect-timeout 8 --max-time 30 \
		-X "$method" "$origin$path" \
		-H 'Content-Type: application/json' \
		${payload:+ -d "$payload"} 2>/dev/null
}

print_device_login_card() {
	local url="$1" code="$2" expires="$3"
	if [ "${PRG_TTY:-0}" = "1" ]; then
		printf '\n' >&2
		printf '%s  ╭──────────────────────────────────────────────╮%s\n' "$PRG_C_GOLD" "$PRG_C_OFF" >&2
		printf '%s  │  %s🔑  LOG IN THIS MACHINE%s                  │%s\n' "$PRG_C_GOLD" "$PRG_C_BOLD" "$PRG_C_GOLD" "$PRG_C_OFF" >&2
		printf '%s  ├──────────────────────────────────────────────┤%s\n' "$PRG_C_GOLD" "$PRG_C_OFF" >&2
		printf '%s  │%s  On your phone, open:                       %s│%s\n' "$PRG_C_GOLD" "$PRG_C_OFF" "$PRG_C_GOLD" "$PRG_C_OFF" >&2
		printf '%s  │%s     %s%s%s\n' "$PRG_C_GOLD" "$PRG_C_CYAN" "$url" "$PRG_C_OFF" >&2
		printf '%s  │%s  and enter this code:                       %s│%s\n' "$PRG_C_GOLD" "$PRG_C_OFF" "$PRG_C_GOLD" "$PRG_C_OFF" >&2
		printf '%s  │%s         %s%s%s\n' "$PRG_C_GOLD" "$PRG_C_BOLD" "$code" "$PRG_C_OFF" >&2
		printf '%s  │%s  Tap Approve. This screen waits for you.     %s│%s\n' "$PRG_C_GOLD" "$PRG_C_DIM" "$PRG_C_GOLD" "$PRG_C_OFF" >&2
		printf '%s  │%s  Code expires in %s. Ctrl+C skips login.      %s│%s\n' "$PRG_C_GOLD" "$PRG_C_DIM" "$expires" "$PRG_C_GOLD" "$PRG_C_OFF" >&2
		printf '%s  ╰──────────────────────────────────────────────╯%s\n' "$PRG_C_GOLD" "$PRG_C_OFF" >&2
	else
		printf '\nLOG IN THIS MACHINE\n' >&2
		printf 'On your phone, open: %s\n' "$url" >&2
		printf 'Enter code: %s\n' "$code" >&2
		printf 'Tap Approve. Waiting for approval (code expires in %s; Ctrl+C skips).\n' "$expires" >&2
	fi
}

save_device_login() {
	local api_key="$1" key_id="$2" account_id="$3" tunnel_id="$4"
	local binding="$ROOT/device-binding.json"
	local credentials="$ROOT/credentials.json"
	"$AWTSMOOS_NODE_BIN" - "$binding" "$api_key" "$key_id" "$account_id" "$tunnel_id" <<'NODE'
const fs = require("node:fs");
const [file, apiKey, keyId, accountId, tunnelId] = process.argv.slice(2);
let value = {};
try { value = JSON.parse(fs.readFileSync(file, "utf8")); } catch {}
if (!value.deviceId) value.deviceId = "dev_" + require("node:crypto").randomBytes(9).toString("base64url");
value.tunnelId = tunnelId || value.tunnelId || "";
value.accountId = accountId || "";
value.pairedAt = new Date().toISOString();
delete value.pairingId;
const tmp = file + ".tmp-" + process.pid;
fs.writeFileSync(tmp, JSON.stringify(value, null, 2), { mode: 0o600 });
fs.renameSync(tmp, file);
NODE
	"$AWTSMOOS_NODE_BIN" - "$credentials" "$api_key" "$key_id" "$account_id" <<'NODE'
const fs = require("node:fs");
const [file, apiKey, keyId, accountId] = process.argv.slice(2);
const value = {
	apiKey, keyId, accountId,
	issuedAt: new Date().toISOString(),
	usage: { header: "x-awtsmoos-api-key", base: "https://awtsmoos.com/api/tunnel/control" }
};
const tmp = file + ".tmp-" + process.pid;
fs.writeFileSync(tmp, JSON.stringify(value, null, 2), { mode: 0o600 });
fs.renameSync(tmp, file);
NODE
	chmod 600 "$binding" "$credentials" 2>/dev/null
}

# Runs the full device flow. Best-effort: never fatal to the install.
run_device_login() {
	device_login_needed || return 0
	[ -n "${origin:-}" ] || return 0

	local tunnel_id device_id device_name payload response
	tunnel_id="$(device_login_value tunnelId "$ROOT/connection-state.json" 2>/dev/null)"
	device_id="$(device_login_value deviceId "$ROOT/device-binding.json" 2>/dev/null)"
	device_name="$(hostname 2>/dev/null || printf 'headless box')"
	payload="$(printf '{"tunnelId":%s,"deviceId":%s,"deviceName":%s}' \
		"$(printf '%s' "$tunnel_id" | "$AWTSMOOS_NODE_BIN" -e 'let d="";process.stdin.on("data",c=>d+=c).on("end",()=>process.stdout.write(JSON.stringify(d)))')" \
		"$(printf '%s' "$device_id" | "$AWTSMOOS_NODE_BIN" -e 'let d="";process.stdin.on("data",c=>d+=c).on("end",()=>process.stdout.write(JSON.stringify(d)))')" \
		"$(printf '%s' "$device_name" | "$AWTSMOOS_NODE_BIN" -e 'let d="";process.stdin.on("data",c=>d+=c).on("end",()=>process.stdout.write(JSON.stringify(d)))')")"

	install_phase "Logging in this machine" "no browser needed — approve on your phone"
	prg_spinner_start "Requesting a login code…"
	response="$(device_login_api POST /api/tunnel/control/device-login/code "$payload")"
	prg_spinner_stop
	finish_install_progress_line

	local ok user_code verify_url device_code expires_in interval
	ok="$(printf '%s' "$response" | "$AWTSMOOS_NODE_BIN" -e 'let d="";process.stdin.on("data",c=>d+=c).on("end",()=>{try{process.stdout.write(String(JSON.parse(d).ok===true))}catch{process.stdout.write("false")}})')"
	if [ "$ok" != "true" ]; then
		prg_warn "Could not start device login (server unreachable). Skipping — the tunnel still works."
		return 0
	fi
	# Extract fields cleanly (values may contain spaces, so one field per call).
	user_code="$(printf '%s' "$response" | "$AWTSMOOS_NODE_BIN" -e 'let d="";process.stdin.on("data",c=>d+=c).on("end",()=>{try{process.stdout.write(JSON.parse(d).userCode||"")}catch{}})' )"
	device_code="$(printf '%s' "$response" | "$AWTSMOOS_NODE_BIN" -e 'let d="";process.stdin.on("data",c=>d+=c).on("end",()=>{try{process.stdout.write(JSON.parse(d).deviceCode||"")}catch{}})' )"
	verify_url="$(printf '%s' "$response" | "$AWTSMOOS_NODE_BIN" -e 'let d="";process.stdin.on("data",c=>d+=c).on("end",()=>{try{const j=JSON.parse(d);process.stdout.write(j.verificationUrlWithCode||j.verificationUrl||"")}catch{}})' )"
	expires_in="$(printf '%s' "$response" | "$AWTSMOOS_NODE_BIN" -e 'let d="";process.stdin.on("data",c=>d+=c).on("end",()=>{try{process.stdout.write(String(JSON.parse(d).expiresIn||600))}catch{process.stdout.write("600")}})' )"
	interval="$(printf '%s' "$response" | "$AWTSMOOS_NODE_BIN" -e 'let d="";process.stdin.on("data",c=>d+=c).on("end",()=>{try{process.stdout.write(String(JSON.parse(d).interval||5))}catch{process.stdout.write("5")}})' )"
	[ -n "$user_code" ] || { prg_warn "Login code was empty; skipping login."; return 0; }

	local expires_label
	if [ "$expires_in" -ge 120 ]; then
		expires_label="$((expires_in / 60)) minutes"
	elif [ "$expires_in" -ge 60 ]; then
		expires_label="1 minute"
	else
		expires_label="$expires_in seconds"
	fi
	print_device_login_card "$verify_url" "$user_code" "$expires_label"

	local deadline=$(( $(date +%s) + expires_in ))
	local status_payload status api_key key_id account_id
	while [ "$(date +%s)" -lt "$deadline" ]; do
		sleep "$interval"
		status_payload="$(printf '{"deviceCode":%s}' \
			"$(printf '%s' "$device_code" | "$AWTSMOOS_NODE_BIN" -e 'let d="";process.stdin.on("data",c=>d+=c).on("end",()=>process.stdout.write(JSON.stringify(d)))')")"
		response="$(device_login_api POST /api/tunnel/control/device-login/status "$status_payload")"
		status="$(printf '%s' "$response" | "$AWTSMOOS_NODE_BIN" -e 'let d="";process.stdin.on("data",c=>d+=c).on("end",()=>{try{process.stdout.write(String(JSON.parse(d).status||""))}catch{process.stdout.write("")}})' )"
		case "$status" in
			approved)
				api_key="$(printf '%s' "$response" | "$AWTSMOOS_NODE_BIN" -e 'let d="";process.stdin.on("data",c=>d+=c).on("end",()=>{try{process.stdout.write(JSON.parse(d).apiKey||"")}catch{}})' )"
				key_id="$(printf '%s' "$response" | "$AWTSMOOS_NODE_BIN" -e 'let d="";process.stdin.on("data",c=>d+=c).on("end",()=>{try{process.stdout.write(JSON.parse(d).keyId||"")}catch{}})' )"
				account_id="$(printf '%s' "$response" | "$AWTSMOOS_NODE_BIN" -e 'let d="";process.stdin.on("data",c=>d+=c).on("end",()=>{try{process.stdout.write(JSON.parse(d).accountId||"")}catch{}})' )"
				if [ -n "$api_key" ]; then
					save_device_login "$api_key" "$key_id" "$account_id" "$tunnel_id"
					finish_install_progress_line
					prg_ok "Logged in — this machine is bound to your account."
					prg_dim "Credentials saved to $ROOT/credentials.json (private)."
					return 0
				fi
				prg_warn "Approval arrived but the credential was empty; skipping login."
				return 0
				;;
			denied)
				finish_install_progress_line
				prg_warn "Login was denied on your phone. The tunnel still works; run again to retry."
				return 0
				;;
			expired|"")
				finish_install_progress_line
				prg_warn "Login code expired before approval. The tunnel still works; run again to retry."
				return 0
				;;
			slow_down)
				interval=$((interval + 5))
				;;
		esac
		if [ "${PRG_TTY:-0}" = "1" ]; then
			local remaining=$(( deadline - $(date +%s) ))
			printf '\r\033[2K%s  ⏳  Waiting for approval… %ss left (Ctrl+C skips)%s' \
				"$PRG_C_DIM" "$remaining" "$PRG_C_OFF" >&2
		fi
	done
	finish_install_progress_line
	prg_warn "Login timed out. The tunnel still works; run again to retry."
	return 0
}
