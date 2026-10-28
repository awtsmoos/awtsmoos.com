#!/usr/bin/env bash
# B"H
# Boruch Hashem
# Blessed is He

# The Awtsmoos gathers each requested mode into one truthful vessel;
# Awtsmoos.com rejects retired shortcuts so secure installation stays universal.

AWTSMOOS_INSTALL_MODE="${AWTSMOOS_INSTALL_MODE:-}"
AWTSMOOS_INSTALL_CLEAN="${AWTSMOOS_INSTALL_CLEAN:-0}"
AWTSMOOS_KEEP_OLD_TUNNELS="${AWTSMOOS_KEEP_OLD_TUNNELS:-0}"
AWTSMOOS_REUSE_IDENTITY="${AWTSMOOS_REUSE_IDENTITY:-0}"
AWTSMOOS_EXPLICIT_REINSTALL="${AWTSMOOS_EXPLICIT_REINSTALL:-0}"
AWTSMOOS_INSTALL_REFRESH="${AWTSMOOS_INSTALL_REFRESH:-0}"
AWTSMOOS_SKIP_DEVICE_LOGIN="${AWTSMOOS_SKIP_DEVICE_LOGIN:-}"
AWTSMOOS_QUICK_ONLY=0
AWTSMOOS_MODE_FLAG_SEEN=0

print_secure_installer_help() {
	cat >&2 <<EOF
Usage: curl -fsSL ${AWTSMOOS_INSTALL_ORIGIN}/api/tunnel/install/unix | bash -s -- [options]

  --full              Full tunnel features (default)
  --minimal           System Node.js 18+, no browser auto-open
  --agent-only        Headless agent installation
  --quick             Verify the existing tunnel without changing it
  --reinstall         Force a transactional replacement
  --refresh           Restart/repair the current verified release
  --clean             Explicit destructive installer-state reset
  --keep-old-tunnels  Preserve previous runtime installations
  --reuse-identity    Explicitly reuse an existing credential
  --no-login          Skip headless device login
  -y, --yes           Accepted for unattended compatibility
  -h, --help          Show this help
EOF
}

select_secure_install_root() {
	local canonical="$HOME/.awtsmoos-tunnel"
	local recovery="${AWTSMOOS_RECOVERY_ROOT:-${canonical}-recovery}"
	local inherited="${AWTSMOOS_INSTALL_ROOT:-$canonical}"
	if [ -n "${AWTSMOOS_PRIMARY_INSTALL_ROOT:-}" ]; then
		printf '%s\n' "$AWTSMOOS_PRIMARY_INSTALL_ROOT"
		return 0
	fi
	if [ "${AWTSMOOS_EMERGENCY_MODE:-0}" = "1" ]; then
		printf '%s\n' "$canonical"
		return 0
	fi
	case "$inherited" in
		"$recovery"/emergency-runtime/*|*/.awtsmoos-tunnel.candidate-*|*/.awtsmoos-tunnel.activation-rollback-*|\
		*/.awtsmoos-tunnel.failed-*|*/.awtsmoos-tunnel.incomplete-*|*/.awtsmoos-tunnel.installer-runtime-*|\
		*/.awtsmoos-tunnel.recovery-displaced-*) printf '%s\n' "$canonical" ;;
		*) printf '%s\n' "$inherited" ;;
	esac
}

parse_secure_installer_args() {
	while [ $# -gt 0 ]; do
		case "$1" in
			--full) AWTSMOOS_INSTALL_MODE="full"; AWTSMOOS_MODE_FLAG_SEEN=1 ;;
			--minimal) AWTSMOOS_INSTALL_MODE="minimal"; AWTSMOOS_MODE_FLAG_SEEN=1; AWTSMOOS_EXPLICIT_REINSTALL=1 ;;
			--agent-only|--agentonly) AWTSMOOS_INSTALL_MODE="agent-only"; AWTSMOOS_MODE_FLAG_SEEN=1; AWTSMOOS_EXPLICIT_REINSTALL=1 ;;
			--mode=full) AWTSMOOS_INSTALL_MODE="full"; AWTSMOOS_MODE_FLAG_SEEN=1 ;;
			--mode=minimal|--mode=agent-only) AWTSMOOS_INSTALL_MODE="${1#--mode=}"; AWTSMOOS_MODE_FLAG_SEEN=1; AWTSMOOS_EXPLICIT_REINSTALL=1 ;;
			--simple-poll|--simple-approval|--simple-websocket|--simple-file)
				echo "Retired insecure simple-agent mode: $1. Use --agent-only instead." >&2
				return 64 ;;
			--clean) AWTSMOOS_INSTALL_CLEAN=1 ;;
			--keep-old-tunnels) AWTSMOOS_KEEP_OLD_TUNNELS=1 ;;
			--reuse-identity) AWTSMOOS_REUSE_IDENTITY=1 ;;
			--quick) AWTSMOOS_QUICK_ONLY=1 ;;
			--reinstall) AWTSMOOS_EXPLICIT_REINSTALL=1 ;;
			--refresh) AWTSMOOS_INSTALL_REFRESH=1 ;;
			--no-login) AWTSMOOS_SKIP_DEVICE_LOGIN=1 ;;
			-y|--yes) ;;
			-h|--help) print_secure_installer_help; return 20 ;;
			--) shift; break ;;
			*) echo "Unknown installer option: $1" >&2; return 64 ;;
		esac
		shift
	done
	AWTSMOOS_INSTALL_MODE="${AWTSMOOS_INSTALL_MODE:-full}"
	if [ "$AWTSMOOS_QUICK_ONLY" = "1" ] && {
		[ "$AWTSMOOS_MODE_FLAG_SEEN" = "1" ] || [ "$AWTSMOOS_EXPLICIT_REINSTALL" = "1" ] ||
		[ "$AWTSMOOS_INSTALL_CLEAN" = "1" ] || [ "$AWTSMOOS_INSTALL_REFRESH" = "1" ];
	}; then
		echo "--quick cannot be combined with reinstall, clean, refresh, or mode flags." >&2
		return 64
	fi
	export AWTSMOOS_INSTALL_MODE AWTSMOOS_INSTALL_CLEAN AWTSMOOS_KEEP_OLD_TUNNELS
	export AWTSMOOS_REUSE_IDENTITY AWTSMOOS_EXPLICIT_REINSTALL AWTSMOOS_INSTALL_REFRESH
	export AWTSMOOS_SKIP_DEVICE_LOGIN AWTSMOOS_QUICK_ONLY
}
