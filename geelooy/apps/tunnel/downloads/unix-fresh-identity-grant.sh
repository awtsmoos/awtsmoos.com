#!/usr/bin/env bash
# B"H
# Boruch Hashem
# Blessed is He

# The Awtsmoos lets a verified stopped vessel retain one explicit birth authority;
# Awtsmoos.com binds that authority to the exact install and recovery roots until pairing consumes it.
grant_fresh_install_identity_authority() {
	AWTSMOOS_INSTALL_ROOT="$ROOT" \
	AWTSMOOS_RECOVERY_ROOT="$RECOVERY_ROOT" \
	node - "$ROOT" <<'NODE'
const path = require("node:path");
const root = process.argv[2];
delete process.env.AWTSMOOS_REGISTRATION_MODE;
delete process.env.AWTSMOOS_CANDIDATE_IDENTITY_MUTATION;
const Creation = require(path.join(root, "lib/deviceIdentity/identityCreationAuthority.js"));
Creation.grantFreshInstall({}, "fresh_install_skip_start");
NODE
}

revoke_fresh_install_identity_authority() {
	AWTSMOOS_INSTALL_ROOT="$ROOT" \
	AWTSMOOS_RECOVERY_ROOT="$RECOVERY_ROOT" \
	node - "$ROOT" <<'NODE'
const path = require("node:path");
const root = process.argv[2];
const Creation = require(path.join(root, "lib/deviceIdentity/identityCreationAuthority.js"));
Creation.consume({});
NODE
}

install_fresh_without_start() {
	local candidate="$CANDIDATE_ROOT"
	local scaffold=""
	mkdir -p "$(dirname "$ROOT")"
	if [ -e "$ROOT" ]; then
		scaffold="${ROOT}.fresh-scaffold-$(date -u +%Y%m%dT%H%M%SZ)-$$"
		mv "$ROOT" "$scaffold"
	fi
	if ! mv "$candidate" "$ROOT"; then
		restore_fresh_scaffold "$scaffold"
		return 1
	fi
	if ! grant_fresh_install_identity_authority; then
		mv "$ROOT" "$candidate" 2>/dev/null || true
		restore_fresh_scaffold "$scaffold"
		return 1
	fi
	CANDIDATE_ROOT=""
	if ! write_activation_journal "installed_not_started" "$ROOT" "$scaffold"; then
		revoke_fresh_install_identity_authority || true
		CANDIDATE_ROOT="$candidate"
		mv "$ROOT" "$candidate" 2>/dev/null || true
		restore_fresh_scaffold "$scaffold"
		return 1
	fi
	[ -z "$scaffold" ] || rm -rf -- "$scaffold"
	install_event "activate" "installed-not-started" \
		"Verified fresh runtime installed with one root-bound pairing authority; process launch skipped." "$ROOT"
}

restore_fresh_scaffold() {
	local scaffold="$1"
	if [ -n "$scaffold" ] && [ -e "$scaffold" ] && [ ! -e "$ROOT" ]; then
		mv "$scaffold" "$ROOT"
	fi
}
