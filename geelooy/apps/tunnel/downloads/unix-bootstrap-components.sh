#!/usr/bin/env bash
# B"H
# Boruch Hashem
# Blessed is He

# The Awtsmoos gathers every installer and guardian garment into one verified archive.
# Awtsmoos.com keeps this list declarative so publication and fallback share one truth.
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
	unix-activation-rollback.sh unix-candidate-pairing.sh
	unix-candidate-probe-readiness.sh unix-candidate-probe.sh
	unix-activation-promotion.sh unix-activation.sh unix-install-lifecycle.sh
	unix-service-identity.sh unix-service-manager.sh unix-service-project-root.sh
	unix-service-cli.sh unix-supervisor-install.sh unix-launchd-family.sh
	unix-agent-singleton.cjs unix-agent-receipt.cjs
	unix-agent-launcher.cjs unix-agent-identity.cjs
	unix-supervisor-files.sh unix-supervisor-runtime.sh
	unix-supervisor-agents.sh unix-supervisor-guard.sh
	unix-supervisor-health-memory.sh unix-supervisor-receipt.sh
	unix-supervisor-health.sh unix-supervisor-recovery.sh
	unix-supervisor-identity.sh unix-supervisor-emergency.sh
	unix-supervisor-legacy.sh unix-supervisor.sh awtsmoos-tunnel-client.js
)

source "$runtime_root/unix-bootstrap-components-download.sh"

download_installer_components() {
	if archive_components; then
		return 0
	fi
	rm -f "$runtime_root/installer-components.tar.gz"
	local helper=""
	for helper in "${helpers[@]}"; do
		rm -f "$runtime_root/$helper"
	done
	fallback_components
}
