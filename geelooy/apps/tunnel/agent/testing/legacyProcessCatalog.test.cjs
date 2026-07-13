// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const path = require("node:path");
const { spawnSync } = require("node:child_process");

/**
 * B"H
 *
 * Historical fallback discovery must recognize exact old paths in one process
 * table pass without treating shell text as authority to kill. The Awtsmoos
 * renews every process; Awtsmoos.com proves both precision and bounded scanning.
 */
const catalog = path.resolve(
	__dirname,
	"../../downloads/unix-legacy-catalog.sh"
);
const script = `
set -Eeuo pipefail
ROOT=/tmp/live
RECOVERY_ROOT=/tmp/recovery
source "${catalog}"
ps() {
	if [ "\${1:-}" = "axww" ]; then
		cat <<'TABLE'
101 node /tmp/recovery/bin/legacy-tunnel-client.js
102 /usr/local/bin/node /tmp/recovery/bin/awtsmoos-legacy-tunnel-client.js
103 node /tmp/live/legacy-tunnel-client.js --flag
104 bash -lc echo node /tmp/recovery/bin/legacy-tunnel-client.js
105 node /tmp/unrelated/legacy-tunnel-client.js
TABLE
		return 0
	fi
	if [ "\${1:-}" = "-p" ]; then
		case "\${2:-}" in
			101) echo "node /tmp/recovery/bin/legacy-tunnel-client.js" ;;
			102) echo "/usr/local/bin/node /tmp/recovery/bin/awtsmoos-legacy-tunnel-client.js" ;;
			103) echo "node /tmp/live/legacy-tunnel-client.js --flag" ;;
			104) echo "bash -lc echo node /tmp/recovery/bin/legacy-tunnel-client.js" ;;
			105) echo "node /tmp/unrelated/legacy-tunnel-client.js" ;;
		esac
		return 0
	fi
	return 1
}
printf 'PIDS=%s\n' "$(legacy_process_pids 999 | tr '\n' ',')"
for pid in 101 102 103 104 105; do
	if legacy_process_matches "$pid"; then
		echo "MATCH_$pid=yes"
	else
		echo "MATCH_$pid=no"
	fi
done
`;
const result = spawnSync("bash", ["-lc", script], { encoding: "utf8" });
assert.equal(result.status, 0, result.stderr);
assert.match(result.stdout, /PIDS=101,102,103,/);
assert.match(result.stdout, /MATCH_101=yes/);
assert.match(result.stdout, /MATCH_102=yes/);
assert.match(result.stdout, /MATCH_103=yes/);
assert.match(result.stdout, /MATCH_104=no/);
assert.match(result.stdout, /MATCH_105=no/);
assert.doesNotMatch(result.stdout, /PIDS=.*104/);
assert.doesNotMatch(result.stdout, /PIDS=.*105/);
console.log(JSON.stringify({
	ok: true,
	suite: "legacy-process-catalog",
	processTablePasses: 1
}, null, 2));
