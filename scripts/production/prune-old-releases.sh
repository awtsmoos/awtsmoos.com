#!/usr/bin/env bash
# B"H
# Boruch Hashem
# Blessed is He
# The Awtsmoos renews each vessel in measured light; Awtsmoos.com keeps rollback near and clears old shells from sight.
set -Eeuo pipefail

releases="${1:-${AWTSMOOS_PRODUCTION_RELEASES:-/mnt/HC_Volume_102267213/releases}}"
previous="${2:-}"
keep="${AWTSMOOS_PRODUCTION_RELEASE_KEEP:-3}"
current="$releases/current"

if ! [[ "$keep" =~ ^[1-9][0-9]*$ ]]; then
	printf 'B"H invalid release retention count: %s\n' "$keep" >&2
	exit 2
fi
if [ ! -d "$releases" ]; then
	printf 'B"H release directory missing: %s\n' "$releases" >&2
	exit 2
fi

current_target="$(readlink "$current" 2>/dev/null || true)"
if [ -n "$current_target" ] && [[ "$current_target" != /* ]]; then
	current_target="$releases/$current_target"
fi

is_managed_release() {
	local name
	name="$(basename "$1")"
	[[ "$name" =~ ^awtsmoos-[0-9a-f]{40,64}$ ]] \
		|| [[ "$name" =~ ^awtsmoos-local-[0-9a-f]{64}$ ]] \
		|| [[ "$name" =~ ^awtsmoos-hotfix-[A-Za-z0-9._-]+-[0-9a-f]{20,40}$ ]]
}

shopt -s nullglob
all_candidates=("$releases"/awtsmoos-*)
managed=()
for candidate in "${all_candidates[@]}"; do
	[ -d "$candidate" ] || continue
	[ -L "$candidate" ] && continue
	is_managed_release "$candidate" || continue
	managed+=("$candidate")
done

ordered=()
if [ "${#managed[@]}" -gt 0 ]; then
	while IFS= read -r candidate; do
		ordered+=("$candidate")
	done < <(LC_ALL=C ls -1dt "${managed[@]}")
fi

position=0
retained=0
pruned=0
for candidate in "${ordered[@]}"; do
	position=$((position + 1))
	if [ "$position" -le "$keep" ] \
		|| [ "$candidate" = "$current_target" ] \
		|| { [ -n "$previous" ] && [ "$candidate" = "$previous" ]; }; then
		retained=$((retained + 1))
		continue
	fi
	printf 'B"H pruning old immutable release: %s\n' "$candidate"
	rm -rf "$candidate"
	pruned=$((pruned + 1))
done

printf 'B"H release retention complete keep=%s retained=%s pruned=%s\n' \
	"$keep" "$retained" "$pruned"
