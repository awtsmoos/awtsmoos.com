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
	assert(lines.filter(line => !line.includes("https://") && !line.includes("Approval link")).every(line => Array.from(line).length <= 78));
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

test("approval URL has a dedicated mobile-width panel without losing its copyable original", () => {
  const url = 'https://example.test/approve?pairingId=abcdefghijklmnopqrstuvwxyz&pairingCode=ABCDEFGH23';
  for (const cols of [32, 40, 78]) {
    const result = runCase(`
      COLUMNS=${cols}; PRG_SMOOTH=1
      direct_pairing_field() {
        case "$1" in
          pairingId) echo pair_fixture ;;
          userCode) echo ABCDEFGH23 ;;
          approvalUrl) echo '${url}' ;;
          expiresAt) echo 0 ;;
        esac
      }
      direct_pairing_show_card`);
    assert.equal(result.status, 0, result.stderr);
    const lines = result.stderr.split('\n');
    const frame = lines.filter(line => /^[╭│├╰]/u.test(line));
    assert(frame.length >= 8, 'both code and URL must be framed');
    assert(frame.every(line => Array.from(line).length === cols), 'box must fit terminal');
    assert(result.stderr.includes(`Full URL: ${url}`), 'copy line must remain complete');
    assert(!result.stderr.includes(String.fromCharCode(27)), 'no ANSI escapes in piped output');
  }
});
