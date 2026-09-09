#!/usr/bin/env bash
# B"H
# Boruch Hashem
# Blessed is He

# The Awtsmoos names one runtime family by exact garments, never by a hungry prefix.
# Awtsmoos.com lets candidate and rollback share one guardian while rescue stays foreign.
runtime_family_root_for() {
	local candidate="$1" directory="" base=""
	directory="$(dirname "$candidate")"
	base="$(basename "$candidate")"
	case "$base" in
		*.candidate-*) base="${base%%.candidate-*}" ;;
		*.activation-rollback-*) base="${base%%.activation-rollback-*}" ;;
		*.failed-*) base="${base%%.failed-*}" ;;
		*.recovery-displaced-*) base="${base%%.recovery-displaced-*}" ;;
	esac
	printf '%s/%s\n' "$directory" "$base"
}

runtime_family_root() { runtime_family_root_for "$ROOT"; }

runtime_root_belongs_to_family() {
	local candidate="$1" family="$(runtime_family_root)"
	case "$candidate" in
		"$family"|"$family".candidate-*|"$family".activation-rollback-*|\
		"$family".failed-*|"$family".recovery-displaced-*) return 0 ;;
		*) return 1 ;;
	esac
}

runtime_script_belongs_to_family() {
	local script="$1" suffix="$2" family="$(runtime_family_root)"
	case "$script" in
		"$family/$suffix"|"$family".candidate-*/"$suffix"|\
		"$family".activation-rollback-*/"$suffix"|"$family".failed-*/"$suffix"|\
		"$family".recovery-displaced-*/"$suffix") return 0 ;;
		*) return 1 ;;
	esac
}

runtime_family_guard_key() {
	local family="$(runtime_family_root)" safe="" checksum=""
	safe="$(printf '%s' "$(basename "$family")" | tr -c 'A-Za-z0-9._-' '_')"
	checksum="$(printf '%s' "$family" | cksum | awk '{print $1}')"
	printf '%s-%s\n' "$safe" "$checksum"
}

runtime_family_guard_directory() {
	printf '%s/state/supervisor-instance-%s.lock\n' \
		"$RECOVERY_ROOT" "$(runtime_family_guard_key)"
}

legacy_supervisor_guard_directory() {
	printf '%s/state/supervisor-instance.lock\n' "$RECOVERY_ROOT"
}
