#!/usr/bin/env node
/**
 * B"H
 * Deep menu-independent Emerald audit.
 */
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
import { assert, runTest } from './assertions.js';
import { assertWorldCounts, loadEmerald, summarizeWorld } from './emeraldHarness.js';

function filesFromFind(args) {
  return execFileSync('find', args, { encoding: 'utf8' }).trim().split('\n').filter(Boolean);
}

function nodeCheck(file) {
  execFileSync('node', ['--check', file], { encoding: 'utf8' });
}

function grepText(pattern, files) {
  const hits = [];
  for (const file of files) {
    const text = fs.readFileSync(file, 'utf8');
    const lines = text.split(/\r?\n/);
    lines.forEach((line, index) => {
      if (pattern.test(line)) hits.push({ file, line: index + 1, text: line.trim() });
    });
  }
  return hits;
}

const tests = [
  runTest('all-emerald-js-syntax', async () => {
    const files = filesFromFind(['ckidsAwtsmoos/tochen/worlds/emeraldVillage', 'ckidsAwtsmoos/tochen/worlds/emerald.js', 'ckidsAwtsmoos/tochen/worlds/village.js', 'tests/emerald', '-type', 'f', '-name', '*.js']);
    files.forEach(nodeCheck);
    return { files: files.length };
  }),
  runTest('emerald-renderer-capability-headless', async () => {
    const output = execFileSync('node', ['tests/emerald/emeraldRendererCapabilitiesAudit.mjs'], { encoding: 'utf8' });
    const report = JSON.parse(output.slice(output.indexOf('{')));
    assert(report.ok === true, 'Renderer capability audit should pass headless', report);
    return report.checks;
  }),
  runTest('emerald-renderer-boundary-inventory', async () => {
    const output = execFileSync('node', ['tests/emerald/emeraldRendererBoundaryInventory.mjs'], { encoding: 'utf8' });
    const report = JSON.parse(output.slice(output.indexOf('{')));
    assert(report.ok === true, 'Renderer boundary inventory should produce a stable report', report);
    assert(report.totalHits >= 0 && report.totalFiles >= 0, 'Renderer boundary inventory should expose totals', report);
    return { totalHits: report.totalHits, totalFiles: report.totalFiles, topFiles: report.topFiles.slice(0, 5) };
  }),
  runTest('emerald-renderer-boundary-inventory', async () => {
    const output = execFileSync('node', ['tests/emerald/emeraldRendererBoundaryInventory.mjs'], { encoding: 'utf8' });
    const report = JSON.parse(output.slice(output.indexOf('{')));
    assert(report.ok === true, 'Renderer boundary inventory should produce a stable report', report);
    assert(report.totalHits >= 0 && report.totalFiles >= 0, 'Renderer boundary inventory should expose totals', report);
    return { totalHits: report.totalHits, totalFiles: report.totalFiles, topFiles: report.topFiles.slice(0, 5) };
  }),
  runTest('all-menu-worlds-import', async () => {
    const map = await import('../../ckidsAwtsmoos/Olam/uiManager/ui/screens/levelSelect/LevelDataMap.js?audit=' + Date.now());
    const ids = map.LevelDataMap.map(x => x.id);
    const localIds = ids.filter(id => ['emerald.js', 'village.js', 'garden.js', 'floatingIslands.js', 'labyrinth.js'].includes(id));
    const imported = [];
    for (const id of localIds) {
      const path = `../../ckidsAwtsmoos/tochen/worlds/${id}`;
      try {
        const mod = await import(path + '?audit=' + Date.now());
        imported.push({ id, ok: Boolean(mod.default) });
      } catch (error) {
        imported.push({ id, ok: false, message: error.message });
      }
    }
    assert(imported.every(x => x.ok), 'Every local menu world should import', { imported });
    return { ids, imported };
  }),
  runTest('emerald-no-import-time-random-code', async () => {
    const files = filesFromFind(['ckidsAwtsmoos/tochen/worlds/emeraldVillage', 'ckidsAwtsmoos/tochen/worlds/emerald.js', '-type', 'f', '-name', '*.js']);
    const hits = grepText(/Math\.random\s*\(/, files);
    assert(hits.length === 0, 'Emerald files should not call Math.random at import/compile time', { hits });
    return { files: files.length };
  }),
  runTest('emerald-world-100-repeat-smoke', async () => {
    let first = null;
    for (let i = 0; i < 100; i++) {
      const world = await loadEmerald('deep-' + i);
      const summary = summarizeWorld(world);
      assertWorldCounts(world);
      const encoded = JSON.stringify(summary);
      if (first === null) first = encoded;
      assert(encoded === first, '100-run Emerald summary must remain stable', { i, current: summary, first: JSON.parse(first) });
    }
    return { repeat: 100, summary: JSON.parse(first) };
  }),
  runTest('emerald-coordinate-sanity', async () => {
    const world = await loadEmerald('coordinates');
    const buckets = ['ProceduralBuilding', 'ProceduralRoad', 'InteractiveNpc', 'ProceduralTree', 'Domem', 'Mazik'];
    const bad = [];
    const check = (name, id, p) => {
      if (!p) return;
      for (const axis of ['x', 'y', 'z']) {
        if (p[axis] !== undefined && !Number.isFinite(Number(p[axis]))) bad.push({ name, id, axis, value: p[axis] });
      }
    };
    for (const bucket of buckets) {
      for (const [id, value] of Object.entries(world.nivrayim[bucket] || {})) {
        check(bucket, id, value.position || value.pos);
      }
    }
    assert(bad.length === 0, 'All inspected Emerald coordinates must be finite', { bad: bad.slice(0, 20), count: bad.length });
    return { buckets, bad: 0 };
  }),
  runTest('emerald-registry-blueprint-aligned', async () => {
    const { AwtsmoosWorldRegistry } = await import('../../src/levels/AwtsmoosWorldRegistry.js?audit=' + Date.now());
    const blueprint = AwtsmoosWorldRegistry.getBlueprint('emerald_world');
    assert(blueprint?.metadata?.name === 'Emerald Void — Living District', 'Registry Emerald name must match runtime world', { blueprint });
    assert(blueprint?.metadata?.runtimeWorld === 'ckidsAwtsmoos/tochen/worlds/emerald.js', 'Registry Emerald must point to runtime world', { blueprint });
    assert(blueprint?.promises?.deterministicGeneration === true, 'Registry Emerald must advertise deterministic generation', { blueprint });
    return { metadata: blueprint.metadata, promises: blueprint.promises };
  }),
  runTest('emerald-file-inventory-classified', async () => {
    const files = filesFromFind(['.', '-type', 'f', '(', '-iname', '*emerald*', '-o', '-iname', '*void*', '-o', '-iname', '*brown*', ')']);
    const allowed = [
      './ckidsAwtsmoos/Olam/worlds/mitzvahWorld/data/nefashos/EmeraldVoidGeneratedDistrict.js',
      './ckidsAwtsmoos/Olam/worlds/mitzvahWorld/data/nefashos/EmeraldVoidStreet.js',
      './ckidsAwtsmoos/Olam/worlds/mitzvahWorld/postbuild/EmeraldVoidFeaturePostBuild.js',
      './ckidsAwtsmoos/tochen/worlds/emerald.js',
      './ckidsAwtsmoos/utils/TextureForge/Generators/Emerald.js',
      './src/levels/blueprints/EmeraldWorld.js',
      './tests/emerald/assertions.js',
      './tests/emerald/emeraldHarness.js',
      './tests/emerald/runEmeraldDeepAudit.js',
      './tests/emerald/runEmeraldTests.js',
      './tests/emerald/emeraldGameplayAudit.mjs',
      './tests/emerald/emeraldGeometryDoorStress.mjs',
      './tests/emerald/emeraldGraphIntegrity.mjs',
      './tests/emerald/emeraldRendererCapabilitiesAudit.mjs'
    ];
    const extra = files.filter(file => !allowed.includes(file));
    assert(extra.length === 0, 'Every Emerald/Void/Brown file should be classified and intentional', { files, extra });
    return { files };
  }),
  runTest('package-emerald-scripts-present', async () => {
    const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    assert(pkg.scripts?.['test:emerald']?.includes('runEmeraldTests.js'), 'package should expose focused Emerald tests', pkg.scripts || {});
    assert(pkg.scripts?.['test:emerald:deep']?.includes('runEmeraldDeepAudit.js'), 'package should expose deep Emerald audit', pkg.scripts || {});
    assert(pkg.scripts?.['test:emerald:stress']?.includes('--repeat=100'), 'package should expose stress Emerald test', pkg.scripts || {});
    return { scripts: pkg.scripts };
  })
];

const results = await Promise.all(tests);
const failed = results.filter(r => !r.ok);
console.log(JSON.stringify({ ok: failed.length === 0, results }, null, 2));
if (failed.length) process.exit(1);
