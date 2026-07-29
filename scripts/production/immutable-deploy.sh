#!/usr/bin/env bash
# B"H

set -Eeuo pipefail

repo="${AWTSMOOS_PRODUCTION_REPO:-/mnt/HC_Volume_102267213/git/awtsmoos.com}"
releases="${AWTSMOOS_PRODUCTION_RELEASES:-/mnt/HC_Volume_102267213/releases}"
persistent_data="${AWTSMOOS_PRODUCTION_DATA_DIR:-$repo/geelooy/.data}"
service="${AWTSMOOS_PRODUCTION_SERVICE:-awtsmoos.service}"
health_url="${AWTSMOOS_PRODUCTION_HEALTH_URL:-http://127.0.0.1:8080/}"
requested_commit="${1:-origin/main}"
full_commit="$(git -C "$repo" rev-parse "${requested_commit}^{commit}")"
target="$releases/awtsmoos-$full_commit"
current="$releases/current"
previous="$(readlink -f "$current")"
previous_name="$(basename "$previous")"
previous_commit="${previous_name#awtsmoos-}"
allowed_legacy="${AWTSMOOS_PRODUCTION_ALLOW_LEGACY_PREDECESSOR:-}"
legacy_predecessor=0
stage="$target.stage-$$"
next_link="$releases/current.next-$$"
user_link=""

cleanup() {
	rm -rf "$stage"
	rm -f "$next_link"
}
trap cleanup EXIT

if ! git -C "$repo" cat-file -e "$previous_commit^{commit}" 2>/dev/null; then
	if [ "$allowed_legacy" != "$previous_name" ] \
		|| [[ ! "$previous_name" =~ ^awtsmoos-hotfix-[A-Za-z0-9._-]+-[0-9a-f]{20,40}$ ]] \
		|| [ ! -f "$previous/index.js" ] \
		|| [ ! -L "$previous/users" ]; then
		printf 'B"H immutable deploy refused unknown predecessor: %s\n' "$previous" >&2
		printf 'B"H set AWTSMOOS_PRODUCTION_ALLOW_LEGACY_PREDECESSOR to its exact basename only after auditing it.\n' >&2
		exit 1
	fi
	node --check "$previous/index.js"
	legacy_predecessor=1
	printf 'B"H migrating audited legacy predecessor through a clean Git archive: %s\n' \
		"$previous_name"
fi

if [ ! -d "$target" ]; then
	if [ -L "$previous/users" ]; then
		user_link="$(readlink "$previous/users")"
	fi
	if [ "$legacy_predecessor" -eq 1 ]; then
		mkdir "$stage"
	else
		cp -a --reflink=auto "$previous" "$stage"
		if [ -L "$stage/users" ]; then
			rm "$stage/users"
		fi
		while IFS= read -r deleted_path; do
			[ -n "$deleted_path" ] && rm -rf "$stage/$deleted_path"
		done < <(
			git -C "$repo" diff --no-renames --name-only \
				--diff-filter=D "$previous_commit" "$full_commit"
		)
	fi
	git -C "$repo" archive "$full_commit" | tar -x -C "$stage"
	if [ -n "$user_link" ]; then
		rm -rf "$stage/users"
		ln -s "$user_link" "$stage/users"
	fi
	mkdir -p "$persistent_data"
	chmod 0700 "$persistent_data"
	rm -rf "$stage/geelooy/.data"
	ln -s "$persistent_data" "$stage/geelooy/.data"
	node --check "$stage/index.js"
	if [ -f "$stage/ayzarim/DosDB/awtsmoosBinary/awtsmoosDB/test/virtual_fs_random_read_cache_test.js" ]; then
		node "$stage/ayzarim/DosDB/awtsmoosBinary/awtsmoosDB/test/virtual_fs_random_read_cache_test.js"
	fi
	mv "$stage" "$target"
fi

install -m 0644 "$target/ops/systemd/awtsmoos-immutable.conf" \
	/etc/systemd/system/awtsmoos.service.d/10-immutable-release.conf
install -m 0644 "$target/ops/systemd/awtsmoos-health-watchdog.service" \
	/etc/systemd/system/awtsmoos-health-watchdog.service
install -m 0644 "$target/ops/systemd/awtsmoos-health-watchdog.timer" \
	/etc/systemd/system/awtsmoos-health-watchdog.timer
install -m 0644 "$target/ops/systemd/awtsmoos-recover.service" \
	/etc/systemd/system/awtsmoos-recover.service
bash "$target/scripts/production/ensure-nginx-websocket-timeouts.sh"
systemctl daemon-reload

ln -s "$target" "$next_link"
mv -Tf "$next_link" "$current"
if ! systemctl restart "$service"; then
	ln -sfn "$previous" "$current"
	systemctl restart "$service"
	exit 1
fi

ready=0
for attempt in $(seq 1 30); do
	if timeout 3 curl -fsS "$health_url" >/dev/null; then
		ready=1
		break
	fi
	sleep 1
done
if [ "$ready" -ne 1 ]; then
	ln -sfn "$previous" "$current"
	systemctl restart "$service"
	printf 'B"H candidate failed health verification and was rolled back.\n' >&2
	exit 1
fi

systemctl enable --now awtsmoos-health-watchdog.timer >/dev/null
printf 'B"H immutable deployment complete\n'
printf 'commit=%s\nrelease=%s\nprevious=%s\nlegacyMigration=%s\n' \
	"$full_commit" "$target" "$previous" "$legacy_predecessor"
