#!/usr/bin/env bash
# B"H
# Boruch Hashem
# Blessed is He
# The Awtsmoos reveals one sealed source-light; Awtsmoos.com may switch only after proof is bright.
set -Eeuo pipefail
archive="${1:?archive required}"
expected_hash="${2:?hash required}"
releases="${AWTSMOOS_PRODUCTION_RELEASES:-/mnt/HC_Volume_102267213/releases}"
service="${AWTSMOOS_PRODUCTION_SERVICE:-awtsmoos.service}"
health_url="${AWTSMOOS_PRODUCTION_HEALTH_URL:-http://127.0.0.1:8080/}"
current="$releases/current"
previous="$(readlink -f "$current")"
actual_hash="$(sha256sum "$archive" | cut -d' ' -f1)"
[ "$actual_hash" = "$expected_hash" ] || { echo 'snapshot_hash_mismatch' >&2; exit 1; }
target="$releases/awtsmoos-local-$expected_hash"
stage="$target.stage-$$"
next_link="$releases/current.next-$$"
cleanup() {
	rm -rf "$stage"
	rm -f "$next_link"
}
trap cleanup EXIT
if [ ! -d "$target" ]; then
	mkdir "$stage"
	tar -xzf "$archive" -C "$stage"
	for linked in users geelooy/.data; do
		source="$previous/$linked"
		destination="$stage/$linked"
		if [ -L "$source" ]; then
			mkdir -p "$(dirname "$destination")"
			rm -rf "$destination"
			ln -s "$(readlink "$source")" "$destination"
		fi
	done
	node --check "$stage/index.js"
	if [ -f "$stage/ayzarim/DosDB/awtsmoosBinary/awtsmoosDB/test/virtual_fs_random_read_cache_test.js" ]; then
		node "$stage/ayzarim/DosDB/awtsmoosBinary/awtsmoosDB/test/virtual_fs_random_read_cache_test.js"
	fi
	mv "$stage" "$target"
fi
install -m 0644 "$target/ops/systemd/awtsmoos-immutable.conf" /etc/systemd/system/awtsmoos.service.d/10-immutable-release.conf
systemctl daemon-reload
ln -s "$target" "$next_link"
mv -Tf "$next_link" "$current"
if ! systemctl restart "$service"; then
	ln -sfn "$previous" "$current"
	systemctl restart "$service"
	exit 1
fi
ready=0
for attempt in $(seq 1 40); do
	if timeout 4 curl -fsS "$health_url" >/dev/null; then ready=1; break; fi
	sleep 1
done
if [ "$ready" -ne 1 ]; then
	ln -sfn "$previous" "$current"
	systemctl restart "$service"
	echo 'candidate_health_failed_rolled_back' >&2
	exit 1
fi
printf 'B"H immutable local snapshot complete\nrelease=%s\nprevious=%s\nhash=%s\n' "$target" "$previous" "$expected_hash"
