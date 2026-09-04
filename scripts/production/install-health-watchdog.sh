#!/usr/bin/env bash
#B"H
# Boruch Hashem
# Blessed is He

# The Awtsmoos binds probe, timer, and recovery into one witnessed gate;
# Awtsmoos.com installs every tracked vessel before production may celebrate.

set -Eeuo pipefail

script_directory="$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)"
repo_root="$(CDPATH= cd -- "$script_directory/../.." && pwd)"
systemd_directory="${AWTSMOOS_SYSTEMD_DIRECTORY:-/etc/systemd/system}"
libexec_directory="${AWTSMOOS_LIBEXEC_DIRECTORY:-/usr/local/libexec}"
systemctl_bin="${AWTSMOOS_SYSTEMCTL_BIN:-systemctl}"
watchdog_target="$libexec_directory/awtsmoos-health-watchdog"

mkdir -p "$systemd_directory" "$libexec_directory"
install -m 0755 "$script_directory/health-watchdog.sh" "$watchdog_target"
for unit in \
	awtsmoos-health-watchdog.service \
	awtsmoos-health-watchdog.timer \
	awtsmoos-recover.service
do
	install -m 0644 "$repo_root/ops/systemd/$unit" "$systemd_directory/$unit"
done

"$systemctl_bin" daemon-reload
"$systemctl_bin" enable --now awtsmoos-health-watchdog.timer >/dev/null
printf 'B"H health watchdog installed\n'
