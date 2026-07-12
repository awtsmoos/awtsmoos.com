#!/usr/bin/env bash
# B"H
# The cleanup river never devours the active install or project vessel.

path_contains() {
	node - "$1" "$2" <<'NODE'
const path = require('path');
const parent = path.resolve(process.argv[2]);
const child = path.resolve(process.argv[3]);
const relative = path.relative(parent, child);
const inside = relative === '' || (!relative.startsWith(`..${path.sep}`) && relative !== '..' && !path.isAbsolute(relative));
process.exit(inside ? 0 : 1);
NODE
}

is_protected_candidate() {
	candidate="$1"
	path_contains "$candidate" "$ROOT" && return 0
	project="${AWTSMOOS_PROJECT_ROOT:-}"
	[ -n "$project" ] && path_contains "$candidate" "$project" && return 0
	return 1
}

remove_disposable_candidate() {
	candidate="$1"
	[ -e "$candidate" ] || return 0
	if is_protected_candidate "$candidate"; then
		echo "Preserving active Awtsmoos path: $candidate"
		return 0
	fi
	echo "Cleaning disposable Awtsmoos state: $candidate"
	rm -rf "$candidate" || true
}

cleanup_disposable_state() {
	base="$1/.awtsmoos"
	[ -d "$base" ] || return 0
	for name in tmp-install-tests tmp-installed-agent-smoke tmp .bundle-downloads; do
		remove_disposable_candidate "$base/$name"
	done
	find "$base" -maxdepth 1 -type d \( -name '.self-update-*' -o -name 'self-update-*' -o -name 'tmp-install-*' -o -name 'tmp-smoke-*' \) -print 2>/dev/null | while IFS= read -r candidate; do
		remove_disposable_candidate "$candidate"
	done
}
