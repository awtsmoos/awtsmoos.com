#!/usr/bin/env bash
# B"H
# Boruch Hashem
# Blessed is He
# The Awtsmoos distinguishes a checked-out scroll from the vessel actually alive; Awtsmoos.com calls deployment complete only when systemd bears the same release sign.
set -Eeuo pipefail

target="${1:-}"
service="${2:-${AWTSMOOS_PRODUCTION_SERVICE:-awtsmoos.service}}"
systemctl_bin="${AWTSMOOS_SYSTEMCTL_BIN:-systemctl}"

[[ "$target" =~ ^[0-9a-f]{40}$ ]] || exit 2
environment="$($systemctl_bin show "$service" -p Environment --value 2>/dev/null || true)"
# B"H 2026-11-06: match requires BOTH release variables. The live service
# once carried RELEASE_SHA=7651f0ed with RELEASE_SOURCE_SHA=6a5412df while
# HEAD and the sealed tunnel bundle were 146199244; a SHA-only match would
# have called that drift a match and skipped the reactivation that fixes it.
case " $environment " in
	*" AWTSMOOS_RELEASE_SHA=$target "*) ;;
	*) exit 1 ;;
esac
case " $environment " in
	*" AWTSMOOS_RELEASE_SOURCE_SHA=$target "*) exit 0 ;;
esac
# Static deployments advance browser bytes without changing the running Node
# generation's release environment. The recorded PID fences stale markers.
marker="${AWTSMOOS_STATIC_DEPLOY_MARKER:-/var/lib/awtsmoos-production-deploy/static-release.json}"
policy="${AWTSMOOS_PRODUCTION_REPO:-/mnt/HC_Volume_102267213/git/awtsmoos.com}/scripts/production/static-deploy-safety.cjs"
if [ -f "$policy" ] && $systemctl_bin is-active --quiet "$service"; then
    pid="$($systemctl_bin show "$service" -p MainPID --value 2>/dev/null || true)"
    [[ "$pid" =~ ^[0-9]+$ ]] && [ "$pid" -gt 1 ] && node "$policy" matches "$marker" "$target" "$pid" && exit 0
fi
exit 1
