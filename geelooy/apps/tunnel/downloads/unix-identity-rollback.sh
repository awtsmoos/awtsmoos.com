#!/usr/bin/env bash
# B"H
# Boruch Hashem
# Blessed is He

# @file Keeps the predecessor's durable identity recoverable while a new
# pairing is promoted. This is separate from the replaceable runtime archive.
IDENTITY_ROLLBACK_DIR=""

identity_rollback_snapshot() {
	local current="$RECOVERY_ROOT/state/device-binding.json"
	local transactions="$RECOVERY_ROOT/transactions"
	[ -n "${RECOVERY_ROOT:-}" ] || return 1
	[ ! -L "$current" ] || return 1
	[ ! -e "$current" ] || [ -f "$current" ] || return 1
	mkdir -p "$transactions" || return 1
	IDENTITY_ROLLBACK_DIR="$(mktemp -d "$transactions/identity-rollback.XXXXXXXX")" || return 1
	chmod 700 "$IDENTITY_ROLLBACK_DIR" || return 1
	if [ -f "$current" ]; then
		cp -p "$current" "$IDENTITY_ROLLBACK_DIR/device-binding.json" || return 1
		chmod 600 "$IDENTITY_ROLLBACK_DIR/device-binding.json" || return 1
	else
		: > "$IDENTITY_ROLLBACK_DIR/previously-absent" || return 1
	fi
	install_event "identity-rollback" "prepared" \
		"Previous credential binding is snapshotted until live registration succeeds."
}

identity_rollback_restore() {
	[ -n "$IDENTITY_ROLLBACK_DIR" ] || return 0
	local current="$RECOVERY_ROOT/state/device-binding.json"
	local saved="$IDENTITY_ROLLBACK_DIR/device-binding.json"
	[ ! -L "$current" ] || return 1
	if [ -f "$saved" ] && [ ! -L "$saved" ]; then
		mkdir -p "$(dirname "$current")" || return 1
		local temporary="${current}.restore-$$"
		cp -p "$saved" "$temporary" || return 1
		chmod 600 "$temporary" || return 1
		mv -f "$temporary" "$current" || return 1
	elif [ -f "$IDENTITY_ROLLBACK_DIR/previously-absent" ]; then
		rm -f "$current" || return 1
	else
		return 1
	fi
	install_event "identity-rollback" "restored" \
		"Previous binding restored before restarting the predecessor."
	identity_rollback_discard
}

identity_rollback_discard() {
	[ -n "$IDENTITY_ROLLBACK_DIR" ] || return 0
	case "$IDENTITY_ROLLBACK_DIR" in
		"$RECOVERY_ROOT"/transactions/identity-rollback.*)
			rm -rf -- "$IDENTITY_ROLLBACK_DIR" || return 1 ;;
		*) return 1 ;;
	esac
	IDENTITY_ROLLBACK_DIR=""
}
