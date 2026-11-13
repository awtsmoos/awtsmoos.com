#!/usr/bin/env node
// B"H
// Boruch Hashem
// Blessed is He

// Install modes: instant is the very fast basic install (user order
// 2026-11-12). Full stays the default; instant verifies a healthy sealed
// tunnel in seconds and never forces a reinstall on its own.
const assert = require('node:assert');
const { test } = require('node:test');
const { execFile } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

const modesFile = path.join(__dirname, '..', 'unix-install-modes.sh');
const coreFile = path.join(__dirname, '..', 'unix-install-core.sh');
const repairFile = path.join(__dirname, '..', 'unix-fast-repair.sh');
const unixFile = path.join(__dirname, '..', 'unix.sh');

function runMode(mode, script) {
  // B"H — the mode must reach the shell as a real environment variable: an
  // assignment prefix on the '.' builtin does not persist to later commands.
  return new Promise((resolve, reject) => {
    execFile('bash', ['-c', `. '${modesFile}'\n${script}`],
      { env: { ...process.env, AWTSMOOS_INSTALL_MODE: mode } },
      (error, stdout, stderr) => {
        if (error && error.code === undefined) return reject(error);
        resolve({ code: error ? error.code : 0, stdout, stderr });
      });
  });
}

test('instant mode is accepted and described as the very fast basic install', async () => {
  const r = await runMode('instant', 'install_mode; mode_describe');
  assert.equal(r.stdout.split('\n')[0], 'instant');
  assert.match(r.stdout, /Instant/);
  assert.match(r.stdout, /seconds/);
});

test('instant skips recovery lanes, Chrome profile and browser; requires system node', async () => {
  const r = await runMode('instant', [
    'instant_mode_requested && echo PRED-OK',
    'mode_builds_recovery_lanes && echo LANES || echo NO-LANES',
    'mode_preserves_chrome_profile && echo PROFILE || echo NO-PROFILE',
    'mode_opens_browser && echo BROWSER || echo NO-BROWSER',
    'mode_requires_system_node && echo SYSNODE || echo NO-SYSNODE',
  ].join('\n'));
  assert.match(r.stdout, /PRED-OK/);
  assert.match(r.stdout, /NO-LANES/);
  assert.match(r.stdout, /NO-PROFILE/);
  assert.match(r.stdout, /NO-BROWSER/);
  assert.match(r.stdout, /SYSNODE/);
});

test('full mode keeps lanes, profile and browser; unknown mode falls back to full', async () => {
  const full = await runMode('full', [
    'mode_builds_recovery_lanes && echo LANES || echo NO-LANES',
    'mode_opens_browser && echo BROWSER || echo NO-BROWSER',
  ].join('\n'));
  assert.match(full.stdout, /LANES/);
  assert.match(full.stdout, /BROWSER/);
  const unknown = await runMode('nope', 'install_mode');
  assert.equal(unknown.stdout.trim(), 'full');
});

test('the core hooks the instant fast path before the metadata fetch', () => {
  const core = fs.readFileSync(coreFile, 'utf8');
  const repair = fs.readFileSync(repairFile, 'utf8');
  assert.match(core, /instant_mode_requested && instant_fast_path/);
  assert.match(core, /complete_install_experience "instant"/);
  assert.ok(core.indexOf('instant_fast_path') < core.indexOf('load_release_metadata'),
    'instant hook must run before the metadata fetch');
  assert.match(repair, /instant_fast_path\(\) \{/);
  assert.match(repair, /installed_runtime_self_verified \|\| return 1/);
  assert.match(repair, /current_runtime_is_stably_healthy \|\| return 1/);
});

test('the entry offers instant as a flag, an alias and the first menu choice', () => {
  const unix = fs.readFileSync(unixFile, 'utf8');
  assert.match(unix, /--instant\|--basic\) AWTSMOOS_INSTALL_MODE="instant"/);
  assert.match(unix, /--instant, --basic/);
  assert.match(unix, /1\)%s Instant/);
  assert.match(unix, /Choose \[1-11\] \(default 2\)/);
  assert.match(unix, /1\|instant\|basic\) AWTSMOOS_INSTALL_MODE="instant"/);
  assert.match(unix, /instant\)\n\t\t\tawt_dim "  1\. Verify the installed tunnel in seconds"/);
});

test('the LIVE entry parser accepts --instant, --basic and --mode=instant', async () => {
  // B"H — the served entry is unix-secure.sh + unix-entry-request.sh, NOT
  // the legacy unix.sh: this is the parser a real install actually runs.
  const entryFile = path.join(__dirname, '..', 'unix-entry-request.sh');
  const entry = fs.readFileSync(entryFile, 'utf8');
  assert.match(entry, /--instant\|--basic\) AWTSMOOS_INSTALL_MODE="instant"/);
  assert.match(entry, /--mode=instant\|--mode=basic\) AWTSMOOS_INSTALL_MODE="instant"/);
  assert.match(entry, /--instant, --basic/);
  const run = (args) => new Promise((resolve, reject) => {
    execFile('bash', ['-c', `. '${entryFile}'\nparse_secure_installer_args ${args}\necho "rc=$? mode=$AWTSMOOS_INSTALL_MODE"`],
      (error, stdout, stderr) => {
        if (error && error.code === undefined) return reject(error);
        resolve({ code: error ? error.code : 0, stdout, stderr });
      });
  });
  for (const args of ['--instant --yes', '--basic --yes', '--mode=instant']) {
    const r = await run(args);
    assert.match(r.stdout, /rc=0 mode=instant/, `parse failed for ${args}: ${r.stdout} ${r.stderr}`);
  }
  const full = await run('--full --yes');
  assert.match(full.stdout, /rc=0 mode=full/);
});

test('instant completion uses a short readiness sample, not the 20s sampler', () => {
  const success = fs.readFileSync(path.join(__dirname, '..', 'unix-install-success.sh'), 'utf8');
  assert.match(success, /Final checks: confirming the tunnel is live/);
  assert.match(success, /AWTSMOOS_FINAL_READINESS_TIMEOUT_SECONDS=8 AWTSMOOS_FINAL_STABILITY_SAMPLES=2 verified_agent_pid/);
});
