#!/usr/bin/env bash
# B"H
# Boruch Hashem
# Blessed is He

set -Eeuo pipefail
export LC_ALL=C
export LANG=C

origin="${AWTSMOOS_INSTALL_ORIGIN:-https://awtsmoos.com}"
origin="${origin%/}"
install_root="${AWTSMOOS_INSTALL_ROOT:-$HOME/.awtsmoos-tunnel}"
runtime_root="${install_root}.installer-runtime-$$"
progress_file="$runtime_root/install-progress.state"
install_cwd="${AWTSMOOS_INSTALL_CWD:-$PWD}"
project_root="${AWTSMOOS_PROJECT_ROOT:-$install_cwd}"

case "$install_cwd" in
	/*) ;;
	*) printf '[Awtsmoos][bootstrap][failed] Invocation directory must be absolute.\n' >&2; exit 1 ;;
esac
case "$project_root" in
	/*) ;;
	*) printf '[Awtsmoos][bootstrap][failed] AWTSMOOS_PROJECT_ROOT must be absolute.\n' >&2; exit 1 ;;
esac

mkdir -p "$(dirname "$install_root")" "$runtime_root"
export AWTSMOOS_INSTALL_PROGRESS_FILE="$progress_file"
export AWTSMOOS_INSTALL_CWD="$install_cwd"
export AWTSMOOS_PROJECT_ROOT="$project_root"

# The Awtsmoos renews one human command into a complete verified release.
# Awtsmoos.com remembers the caller's exact vessel without asking Git or stale
# runtime state where the user's present workspace is meant to dwell.
bootstrap_progress() {
	local percent="$1"
	local message="$2"
	printf '%s\n' "$percent" > "$progress_file"
	if [ -t 1 ] && [ "${AWTSMOOS_PROGRESS_MODE:-tty}" != "plain" ]; then
		printf '\r\033[2K[%3d%%] %s' "$percent" "$message"
	else
		printf '[%3d%%] %s\n' "$percent" "$message"
	fi
}

cleanup_bootstrap() {
	local exit_code=$?
	if [ "$exit_code" -ne 0 ]; then
		[ -t 1 ] && [ "${AWTSMOOS_PROGRESS_MODE:-tty}" != "plain" ] && printf '\n'
		printf '[FAILED] Awtsmoos Tunnel bootstrap stopped before completion.\n' >&2
	fi
	rm -rf "$runtime_root"
	exit "$exit_code"
}

trap cleanup_bootstrap EXIT
bootstrap_progress 0 'Preparing complete Awtsmoos Tunnel reinstall'
command -v curl >/dev/null 2>&1 || {
	printf '[Awtsmoos][bootstrap][failed] curl was not found.\n' >&2
	exit 1
}
curl -fsSL --retry 5 --retry-delay 1 --connect-timeout 10 \
	--speed-time 30 --speed-limit 1024 \
	"$origin/apps/tunnel/downloads/unix-node-runtime.sh" \
	-o "$runtime_root/unix-node-runtime.sh"
chmod +x "$runtime_root/unix-node-runtime.sh"
source "$runtime_root/unix-node-runtime.sh"
activate_node_runtime "$install_root" || {
	printf '[Awtsmoos][bootstrap][failed] Node.js 18+ was not found in PATH, Homebrew, MacPorts, nvm, or saved installer state.\n' >&2
	exit 1
}
persist_node_runtime "$install_root"
bootstrap_progress 4 "Node runtime verified: $AWTSMOOS_NODE_BIN"

helpers=(
	unix-install-core.sh unix-install-log.sh unix-install-progress.sh
	unix-install-browser.sh unix-install-success.sh unix-install-readiness.sh
	unix-version-policy.sh unix-install-lock.sh unix-install-lock-owner.cjs
	unix-log-retention.sh unix-device-identity-state.sh unix-state-migration.sh
	unix-chrome-profile-process.cjs unix-displaced-cleanup.sh unix-package-io.sh
	unix-release-metadata.sh unix-package-config.sh unix-package-stage.sh
	unix-install-resume.sh unix-fast-repair.sh unix-legacy-catalog.sh
	unix-process-census.sh unix-process-runtime.sh unix-process-control.sh
	unix-service-identity.sh unix-service-manager.sh unix-supervisor-install.sh
	unix-connection-health.sh unix-project-root-health.sh
	unix-project-root-compat.sh unix-service-health.sh unix-legacy-fallback.sh
	unix-agent-singleton.cjs unix-agent-receipt.cjs unix-agent-launcher.cjs
	unix-recovery-archive-list.sh unix-recovery-retention.sh
	unix-recovery-store.sh unix-recovery-validation.sh
	unix-recovery-candidates.sh unix-recovery-rescue.sh
	unix-activation-state.sh unix-activation-fresh.sh
	unix-activation-rollback.sh unix-activation.sh unix-cleanup.sh
	unix-supervisor-runtime.sh unix-supervisor-agents.sh unix-supervisor-guard.sh
	unix-supervisor-health-memory.sh unix-supervisor-receipt.sh
	unix-supervisor-health.sh unix-supervisor-recovery.sh
	unix-supervisor-legacy.sh unix-supervisor.sh awtsmoos-tunnel-client.js
)

total="${#helpers[@]}"
index=0
parallel_downloads="${AWTSMOOS_INSTALL_PARALLEL_DOWNLOADS:-16}"
case "$parallel_downloads" in
	''|*[!0-9]*) parallel_downloads=16 ;;
esac
[ "$parallel_downloads" -ge 1 ] 2>/dev/null || parallel_downloads=1
[ "$parallel_downloads" -le 16 ] 2>/dev/null || parallel_downloads=16
batch_pids=()
batch_helpers=()

wait_for_download_batch() {
	local failed=0
	local position=0
	local pid
	for pid in "${batch_pids[@]}"; do
		if ! wait "$pid"; then
			printf '[Awtsmoos][download][failed] Could not fetch %s.\n' \
				"${batch_helpers[$position]}" >&2
			failed=1
		fi
		position=$(( position + 1 ))
	done
	batch_pids=()
	batch_helpers=()
	[ "$failed" -eq 0 ]
}

for helper in "${helpers[@]}"; do
	index=$(( index + 1 ))
	(
		temporary="$runtime_root/.$helper.part"
		rm -f "$temporary"
		curl -fsSL --retry 5 --retry-delay 1 --connect-timeout 10 \
			--speed-time 30 --speed-limit 1024 \
			"$origin/apps/tunnel/downloads/$helper" -o "$temporary"
		chmod +x "$temporary"
		mv -f "$temporary" "$runtime_root/$helper"
	) &
	batch_pids+=("$!")
	batch_helpers+=("$helper")
	if [ "${#batch_pids[@]}" -ge "$parallel_downloads" ] || [ "$index" -eq "$total" ]; then
		wait_for_download_batch
		percent=$(( 4 + index * 14 / total ))
		bootstrap_progress "$percent" \
			"Downloaded verified reinstall components ($index/$total)"
	fi
done

bootstrap_progress 18 'Verified reinstall components ready'
export AWTSMOOS_INSTALL_ORIGIN="$origin"
export AWTSMOOS_INSTALL_ROOT="$install_root"
export AWTSMOOS_INSTALL_RUNTIME="$runtime_root"
bash "$runtime_root/unix-install-core.sh"
trap - EXIT
rm -rf "$runtime_root"
