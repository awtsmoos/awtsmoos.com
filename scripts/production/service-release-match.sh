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
case " $environment " in
	*" AWTSMOOS_RELEASE_SHA=$target "*) exit 0 ;;
	*) exit 1 ;;
esac
