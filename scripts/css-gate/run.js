#!/usr/bin/env node
// CSS Gate pre-commit runner: invokes cssImmediateIssues via tunnel action path
// and fails if new conflicts/overrides/unstyled elements appear vs baseline.
// Usage: node scripts/css-gate/run.js [--url URL] [--width W] [--height H] [--baseline PATH]
const { spawn } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

const REPO = '/Users/awtsmoos/work/awtsmoos.com';
const GATE_DIR = path.join(REPO, 'scripts', 'css-gate');
const DEFAULT_BASELINE = path.join(GATE_DIR, 'baseline.json');

function parseArgs() {
  const a = { url: 'https://awtsmoos.com/about', width: 390, height: 844, baseline: DEFAULT_BASELINE };
  for (let i = 2; i < process.argv.length; i++) {
    if (process.argv[i] === '--url') a.url = process.argv[++i];
    else if (process.argv[i] === '--width') a.width = parseInt(process.argv[++i], 10);
    else if (process.argv[i] === '--height') a.height = parseInt(process.argv[++i], 10);
    else if (process.argv[i] === '--baseline') a.baseline = process.argv[++i];
  }
  return a;
}

// Invoke via the tunnel action path using the local tcall helper.
// This script runs ON THE MAC (pre-commit hook), so it uses the tunnel
// action directly through the agent's action dispatcher.
async function invokeAction(url, width, height) {
  // Invoke the CSS health action directly (same code path as tunnel invocation,
  // bypassing the full action-chain config which needs a live agent context).
  const modPath = path.join(REPO, 'geelooy', 'apps', 'tunnel', 'agent', 'tools', 'fs',
    'actionGroups', 'cssHealthActions.js');
  const { buildCssHealthActions } = require(modPath);
  const context = { payload: { params: JSON.stringify({ url, width, height }) } };
  const actions = buildCssHealthActions(context);
  const fn = actions.cssImmediateIssues;
  if (!fn) throw new Error('cssImmediateIssues not exported by buildCssHealthActions');
  return await fn();
}

async function main() {
  const args = parseArgs();
  console.log('[css-gate] probing', args.url, args.width + 'x' + args.height);

  let result;
  try {
    result = await invokeAction(args.url, args.width, args.height);
  } catch (e) {
    console.error('[css-gate] PROBE FAILED:', e.message);
    process.exit(2);
  }

  if (!result || !result.ok) {
    console.error('[css-gate] PROBE ERROR:', (result && result.error) || 'unknown');
    process.exit(2);
  }

  const summary = {
    url: args.url,
    viewport: args.width + 'x' + args.height,
    timestamp: new Date().toISOString(),
    totalIssues: result.summary.totalIssues,
    conflicts: result.summary.conflicts,
    overrides: result.summary.overrides,
    unstyledInteractive: result.summary.unstyledInteractive,
    byType: result.summary.byType,
  };

  console.log('[css-gate] result:', JSON.stringify({
    totalIssues: summary.totalIssues,
    conflicts: summary.conflicts,
    overrides: summary.overrides,
    unstyled: summary.unstyledInteractive,
  }));

  // Compare vs baseline
  if (!fs.existsSync(args.baseline)) {
    console.log('[css-gate] no baseline at', args.baseline, '— writing current as baseline');
    fs.mkdirSync(path.dirname(args.baseline), { recursive: true });
    fs.writeFileSync(args.baseline, JSON.stringify(summary, null, 2));
    console.log('[css-gate] BASELINE WRITTEN — gate passes (first run)');
    process.exit(0);
  }

  const baseline = JSON.parse(fs.readFileSync(args.baseline, 'utf8'));
  const failures = [];

  // Gate: zero NEW issues vs baseline (counts must not increase)
  for (const k of ['totalIssues', 'conflicts', 'overrides', 'unstyledInteractive']) {
    const before = baseline[k] || 0;
    const after = summary[k] || 0;
    if (after > before) {
      failures.push(k + ': baseline ' + before + ' → now ' + after + ' (+' + (after - before) + ' new)');
    }
  }

  // Gate: no new high-severity issue types
  const beforeTypes = new Set(Object.keys(baseline.byType || {}));
  for (const t of Object.keys(summary.byType || {})) {
    if (!beforeTypes.has(t) && /high|critical/.test(t)) {
      failures.push('new issue type: ' + t);
    }
  }

  if (failures.length > 0) {
    console.error('[css-gate] BLOCKED — new CSS issues detected:');
    for (const f of failures) console.error('  ✗', f);
    console.error('[css-gate] fix the CSS or update the baseline deliberately:');
    console.error('  node scripts/css-gate/run.js --url ' + args.url + ' # then review baseline.json');
    process.exit(1);
  }

  console.log('[css-gate] GREEN — no new conflicts/overrides/unstyled elements vs baseline');
  process.exit(0);
}

main().catch(e => { console.error('[css-gate] FATAL:', e.message); process.exit(2); });
