#!/usr/bin/env bash
# B"H
# Boruch Hashem
# Blessed is He

set -Eeuo pipefail

# The Awtsmoos gathers the installer into one measured vessel of light;
# Awtsmoos.com verifies its seal before an inner script may take flight.

AWTSMOOS_INSTALL_ORIGIN="${AWTSMOOS_INSTALL_ORIGIN:-https://awtsmoos.com}"
AWTSMOOS_INSTALL_ORIGIN="${AWTSMOOS_INSTALL_ORIGIN%/}"
EXPECTED_COMPONENTS_SHA256="__AWTSMOOS_INSTALLER_COMPONENTS_SHA256__"
EXPECTED_COMPONENTS_BYTES="__AWTSMOOS_INSTALLER_COMPONENTS_BYTES__"
runtime_root="${TMPDIR:-/tmp}/awtsmoos-installer-secure-$$-$RANDOM"
archive_path="$runtime_root/installer-components.tar.gz"
handoff_started=0

fail_secure_bootstrap() {
	echo "Awtsmoos Tunnel installer: $*" >&2
	exit 1
}

cleanup_secure_bootstrap() {
	if [ "$handoff_started" != "1" ]; then
		rm -rf "$runtime_root" 2>/dev/null || true
	fi
}
trap cleanup_secure_bootstrap EXIT INT TERM

sha256_file() {
	local file="$1"
	if command -v sha256sum >/dev/null 2>&1; then sha256sum "$file" | awk '{print $1}'; return; fi
	if command -v shasum >/dev/null 2>&1; then shasum -a 256 "$file" | awk '{print $1}'; return; fi
	if command -v openssl >/dev/null 2>&1; then openssl dgst -sha256 "$file" | awk '{print $NF}'; return; fi
	fail_secure_bootstrap "SHA-256 utility is required."
}

verify_archive_paths() {
	local member="" details=""
	tar -tzf "$archive_path" > "$runtime_root/archive-names.txt" || fail_secure_bootstrap "Invalid archive names."
	tar -tvzf "$archive_path" > "$runtime_root/archive-types.txt" || fail_secure_bootstrap "Invalid archive entries."
	while IFS= read -r member; do
		case "$member" in
			""|/*|./*|../*|*/../*|*/..|*/./*|*/.|*\\*) fail_secure_bootstrap "Unsafe archive path: $member" ;;
		esac
	done < "$runtime_root/archive-names.txt"
	while IFS= read -r details; do
		case "$details" in
			-*) ;;
			*) fail_secure_bootstrap "Unsafe archive entry type: $details" ;;
		esac
	done < "$runtime_root/archive-types.txt"
}

fetch_verified_archive() {
	case "$EXPECTED_COMPONENTS_SHA256:$EXPECTED_COMPONENTS_BYTES" in
		*__AWTSMOOS_*|*:__AWTSMOOS_*) fail_secure_bootstrap "Release integrity metadata was not injected." ;;
	esac
	command -v curl >/dev/null 2>&1 || fail_secure_bootstrap "curl is required."
	command -v tar >/dev/null 2>&1 || fail_secure_bootstrap "tar is required."
	mkdir -p "$runtime_root"
	curl -fLsS --connect-timeout 5 --max-time 45 --retry 2 --retry-delay 1 \
		"$AWTSMOOS_INSTALL_ORIGIN/api/tunnel/install/installer-components.tar.gz" \
		-o "$archive_path.partial"
	local actual_bytes actual_sha expected_sha
	actual_bytes="$(wc -c < "$archive_path.partial" | tr -d '[:space:]')"
	[ "$actual_bytes" = "$EXPECTED_COMPONENTS_BYTES" ] || fail_secure_bootstrap "Installer archive length mismatch."
	actual_sha="$(sha256_file "$archive_path.partial" | tr 'A-F' 'a-f')"
	expected_sha="$(printf '%s' "$EXPECTED_COMPONENTS_SHA256" | tr 'A-F' 'a-f')"
	[ "$actual_sha" = "$expected_sha" ] || fail_secure_bootstrap "Installer archive SHA-256 mismatch."
	mv "$archive_path.partial" "$archive_path"
	verify_archive_paths
	tar -xzf "$archive_path" -C "$runtime_root"
}

parse_verified_request() {
	# shellcheck source=/dev/null
	source "$runtime_root/unix-entry-request.sh"
	set +e
	parse_secure_installer_args "$@"
	local status=$?
	set -e
	[ "$status" = "20" ] && exit 0
	[ "$status" = "0" ] || exit "$status"
}

prepare_verified_runtime() {
	ROOT="$(select_secure_install_root)"
	RECOVERY_ROOT="${AWTSMOOS_RECOVERY_ROOT:-${ROOT}-recovery}"
	INSTALL_CWD="$(pwd -P)"
	AWTSMOOS_INSTALL_CWD="$INSTALL_CWD"
	AWTSMOOS_PROJECT_ROOT="${AWTSMOOS_PROJECT_ROOT:-$INSTALL_CWD}"
	export ROOT RECOVERY_ROOT INSTALL_CWD AWTSMOOS_INSTALL_CWD AWTSMOOS_PROJECT_ROOT
	export AWTSMOOS_INSTALL_ROOT="$ROOT" AWTSMOOS_RECOVERY_ROOT="$RECOVERY_ROOT"
	export AWTSMOOS_INSTALL_RUNTIME="$runtime_root" AWTSMOOS_INSTALL_ORIGIN
	export AWTSMOOS_EMERGENCY_MODE=0
	unset AWTSMOOS_EMERGENCY_PARENT_PID AWTSMOOS_EMERGENCY_PARENT_START_TOKEN || true
	# shellcheck source=/dev/null
	source "$runtime_root/unix-node-runtime.sh"
	activate_node_runtime "$ROOT"
}

run_verified_installer() {
	if [ "${AWTSMOOS_QUICK_ONLY:-0}" = "1" ]; then
		run_node "$runtime_root/unix-entry-quick.cjs" "$ROOT"
		return
	fi
	handoff_started=1
	run_node "$runtime_root/unix-install-custody.cjs" delegate \
		"$runtime_root/unix-install-core.sh" "$runtime_root" "$RECOVERY_ROOT" "$INSTALL_CWD"
}

fetch_verified_archive
parse_verified_request "$@"
prepare_verified_runtime
run_verified_installer
