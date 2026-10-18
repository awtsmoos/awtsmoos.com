// B"H
// Boruch Hashem
// Blessed is He
import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const url = 'https://awtsmoos.com/apps/tunnel-control/?device=abcdefghijklmnopqrstuvwxyz1234567890';

function render(width, action) {
  const command = `source "$1/unix-pairing-direct-flow.sh"
source "$1/unix-install-success.sh"
COLUMNS=${width}; PRG_TTY=1; PRG_SMOOTH=1
PRG_C_GREEN=''; PRG_C_CYAN=''; PRG_C_MAGENTA=''; PRG_C_BOLD=''; PRG_C_OFF=''
${action} 'tun_testing_1234567890' 'linux-headless-test' '${url}' '1.0.777'`;
  return spawnSync('bash', ['-c', command, '--', root], {encoding:'utf8', timeout:5000});
}

for(const width of [32, 40, 78]) {
  for(const action of ['print_tunnel_online_card','print_headless_operator_card']) {
    test(`${action} has full management URL in a separate framed panel at ${width} columns`, () => {
      const result = render(width, action);
      assert.equal(result.status, 0, result.stderr);
      const lines = result.stderr.split('\n').filter(line => /^[╭│├╰]/u.test(line));
      assert(lines.length >= 8, 'expected distinct device and URL panels');
      assert(lines.every(line => Array.from(line).length === width),
        JSON.stringify(lines.map(line => Array.from(line).length)));
      assert(result.stderr.includes(`Full URL: ${url}`), 'full URL must not be truncated');
      assert(!result.stderr.includes(String.fromCharCode(27)), 'fixture does not enable ANSI');
    });
  }
}
