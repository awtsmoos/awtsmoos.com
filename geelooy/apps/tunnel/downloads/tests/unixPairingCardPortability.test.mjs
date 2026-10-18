//B"H
// Boruch Hashem
// Blessed is He

import test from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";

const source = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../unix-pairing-direct-flow.sh");

/** Use the actual Bash functions with no network, identity, or durable writes. */
function runCase(commands) {
	const shell = `source "$1"; ${commands}`;
	return spawnSync("bash", ["-c", shell, "--", source], {
		encoding: "utf8",
		timeout: 5000,
		env: { ...process.env, AWTSMOOS_NODE_BIN: process.execPath }
	});
}

test("Mac installer shows a compact, aligned approval card with portable milliseconds", () => {
	const result = runCase(`
		direct_pairing_field() {
			case "$1" in
				pairingId) echo 'pair_fixture' ;;
				userCode) echo 'ABCDEFGH23' ;;
				approvalUrl) echo 'https://example.test/approve' ;;
				expiresAt) "$AWTSMOOS_NODE_BIN" -p 'Date.now()+600000' ;;
			esac
		}
		direct_pairing_show_card`);
	assert.equal(result.status, 0, result.stderr);
	const card = result.stderr;
	assert.match(card, /ABCDE-FGH23/);
	assert.match(card, /Expires in 10 min/);
	const lines = card.split("\n").filter(Boolean);
	assert.match(card, /Status: awaiting approval/);
	assert.match(card, /Approval link \(copy\):/);
	assert(lines.filter(line => !line.includes("https://") && !line.includes("Approval link")).every(line => Array.from(line).length <= 40));
});

test("approval poll completes on macOS without GNU date extensions", () => {
	const result = runCase(`
		direct_pairing_field() { echo 'pair_fixture'; }
		direct_pairing_show_card() { :; }
		installer_pairing_state() { echo 'approved'; }
		install_event() { :; }
		prg_ok() { :; }
		direct_pairing_wait_for_approval`);
	assert.equal(result.status, 0, result.stderr);
});
