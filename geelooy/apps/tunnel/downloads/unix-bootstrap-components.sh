#!/usr/bin/env bash
# B"H
# Boruch Hashem
# Blessed is He

# One component covenant serves archive publication and fallback downloads. The
# Awtsmoos keeps every installer, guardian, identity, and emergency helper together.
helpers=(
	unix-install-core.sh unix-install-sources.sh unix-cleanup.sh
	unix-install-log.sh unix-install-progress.sh unix-install-browser.sh
	unix-install-lock.sh unix-install-lock-owner.cjs unix-log-retention.sh
	unix-device-identity-state.sh unix-state-migration.sh
	unix-chrome-profile-process.cjs unix-displaced-cleanup.sh
	unix-package-io.sh unix-release-metadata.sh unix-package-config.sh
	unix-legacy-catalog.sh unix-process-census.sh unix-process-runtime.sh
	unix-process-control.sh unix-connection-health.sh unix-project-root-health.sh
	unix-project-root-compat.sh unix-service-health.sh unix-install-readiness.sh
	unix-install-success.sh unix-version-policy.sh unix-legacy-fallback.sh
	unix-install-resume.sh unix-fast-repair.sh unix-package-stage.sh
	unix-recovery-archive-list.sh unix-recovery-retention.sh
	unix-recovery-store.sh unix-recovery-validation.sh
	unix-recovery-candidates.sh unix-recovery-rescue.sh
	unix-emergency-capture.sh unix-emergency-runtime.sh
	unix-activation-state.sh unix-activation-fresh.sh
	unix-activation-rollback.sh unix-candidate-probe.sh
	unix-activation-promotion.sh unix-activation.sh unix-install-lifecycle.sh
	unix-service-identity.sh unix-service-manager.sh unix-service-project-root.sh
	unix-supervisor-install.sh unix-launchd-family.sh
	unix-agent-singleton.cjs unix-agent-receipt.cjs
	unix-agent-launcher.cjs unix-agent-identity.cjs
	unix-supervisor-files.sh unix-supervisor-runtime.sh
	unix-supervisor-agents.sh unix-supervisor-guard.sh
	unix-supervisor-health-memory.sh unix-supervisor-receipt.sh
	unix-supervisor-health.sh unix-supervisor-recovery.sh
	unix-supervisor-identity.sh unix-supervisor-emergency.sh
	unix-supervisor-legacy.sh unix-supervisor.sh awtsmoos-tunnel-client.js
)

wait_for_component_batch() {
	local failed=0 position=0 pid
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

archive_components() {
	local archive="$runtime_root/installer-components.tar.gz"
	local expected="${AWTSMOOS_INSTALLER_COMPONENTS_SHA256:-}"
	[[ "$expected" =~ ^[0-9a-f]{64}$ ]] || return 1
	bootstrap_progress 7 'Downloading verified installer component bundle'
	curl -fsSL --retry 5 --retry-delay 1 --connect-timeout 10 \
		--speed-time 30 --speed-limit 1024 \
		"${AWTSMOOS_INSTALL_COMPONENTS_URL:-$origin/api/tunnel/install/installer-components.tar.gz}" \
		-o "$archive" || return 1
	local actual
	actual="$("$AWTSMOOS_NODE_BIN" -e '
const fs=require("node:fs"),crypto=require("node:crypto");
process.stdout.write(crypto.createHash("sha256").update(fs.readFileSync(process.argv[1])).digest("hex"));
' "$archive")"
	[ "$actual" = "$expected" ] || return 1
	tar -xzf "$archive" -C "$runtime_root" || return 1
	for helper in "${helpers[@]}"; do
		[ -f "$runtime_root/$helper" ] || return 1
		chmod +x "$runtime_root/$helper"
	done
	bootstrap_progress 18 \
		"Verified reinstall component bundle ready (${#helpers[@]} files, one request)"
}

fallback_components() {
	local total="${#helpers[@]}" index=0 helper temporary percent
	local parallel="${AWTSMOOS_INSTALL_PARALLEL_DOWNLOADS:-16}"
	case "$parallel" in ''|*[!0-9]*) parallel=16 ;; esac
	[ "$parallel" -ge 1 ] 2>/dev/null || parallel=1
	[ "$parallel" -le 16 ] 2>/dev/null || parallel=16
	batch_pids=()
	batch_helpers=()
	bootstrap_progress 7 'Using compatible component download fallback'
	for helper in "${helpers[@]}"; do
		index=$(( index + 1 ))
		(
			temporary="$runtime_root/.$helper.part"
			curl -fsSL --retry 5 --retry-delay 1 --connect-timeout 10 \
				--speed-time 30 --speed-limit 1024 \
				"$origin/apps/tunnel/downloads/$helper" -o "$temporary"
			chmod +x "$temporary"
			mv -f "$temporary" "$runtime_root/$helper"
		) &
		batch_pids+=("$!")
		batch_helpers+=("$helper")
		if [ "${#batch_pids[@]}" -ge "$parallel" ] || [ "$index" -eq "$total" ]; then
			wait_for_component_batch
			percent=$(( 7 + index * 11 / total ))
			bootstrap_progress "$percent" "Downloaded reinstall components ($index/$total)"
		fi
	done
}

download_installer_components() {
	archive_components && return 0
	rm -f "$runtime_root/installer-components.tar.gz"
	for helper in "${helpers[@]}"; do rm -f "$runtime_root/$helper"; done
	fallback_components
}
