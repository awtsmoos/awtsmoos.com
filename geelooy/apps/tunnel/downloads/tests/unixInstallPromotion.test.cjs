#!/usr/bin/env node
// B"H
// Boruch Hashem
// Blessed is He

// A healthy Mac registration took ~83s, so the post-promotion readiness
// wait is legitimately long — but it was silent, and the custody watchdog
// killed the install after 15s with no progress output. The wait now
// reports on the progress line every 5s, and starting the promoted agent
// says so at once.
const assert = require('node:assert');
const { test } = require('node:test');
const { execFile } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');

const progressFile = path.join(__dirname, '..', 'unix-install-progress.sh');
const supervisorFile = path.join(__dirname, '..', 'unix-supervisor-install.sh');
const promotionFile = path.join(__dirname, '..', 'unix-activation-promotion.sh');

test('the readiness wait reports on the progress line while the agent starts', async () => {
  const runtime = fs.mkdtempSync(path.join(os.tmpdir(), 'awt-promote-wait-'));
  const root = path.join(runtime, 'root');
  fs.mkdirSync(root, { recursive: true });
  const script = [
    // The supervisor file sources its sibling list from the runtime dir,
    // so point that at the real components dir; keep only the progress
    // state file in the temp dir.
    `export AWTSMOOS_INSTALL_RUNTIME='${path.join(__dirname, '..')}'`,
    `export INSTALL_PROGRESS_FILE='${path.join(runtime, 'install-progress.state')}'`,
    `ROOT='${root}'`,
    `. '${progressFile}'`,
    `. '${supervisorFile}'`,
    'install_event() { printf "event %s %s\\n" "$1" "$2" >&2; }',
    'runtime_health_summary() { printf ""; }',
    'runtime_pid_matches() { return 0; }',
    'READY_AT=$((SECONDS + 6))',
    'runtime_registered() { [ "$SECONDS" -ge "$READY_AT" ]; }',
    'START=$SECONDS',
    'wait_for_runtime 30',
    'echo "wait rc=$? elapsed=$((SECONDS-START))"',
  ].join('\n');
  try {
    const out = await new Promise((resolve, reject) => {
      execFile('bash', ['-c', script], (error, stdout, stderr) => {
        if (error && error.code === undefined) return reject(error);
        resolve({ code: error ? error.code : 0, stdout, stderr });
      });
    });
    assert.match(out.stderr, /Waiting for the agent to register… \(5s\)/);
    assert.match(out.stdout, /wait rc=0 elapsed=[6789]/);
  } finally {
    fs.rmSync(runtime, { recursive: true, force: true });
  }
}, { timeout: 30000 });

test('starting the promoted agent announces itself on the progress line', () => {
  const promotion = fs.readFileSync(promotionFile, 'utf8');
  assert.match(promotion, /install_progress "\$INSTALL_PROGRESS_LAST" "Starting the promoted agent…"/);
  const supervisor = fs.readFileSync(supervisorFile, 'utf8');
  assert.match(supervisor, /install_progress "\$INSTALL_PROGRESS_LAST" "Waiting for the agent to register… /);
});
