// B"H
import path from 'node:path';
import { writeFile } from 'node:fs/promises';
import { startStaticServer } from './StaticServer.js';

const repoRoot = path.resolve(process.cwd(), '../../..');
const targets = [
  '/geelooy/games/mitzvahWorld/ckidsAwtsmoos/Olam/core/OlamVessel.js?v=test',
  '/games/scripts/build/three.module.js',
  '/geelooy/games/mitzvahWorld/ckidsAwtsmoos/chayim/nivra.js?v=test',
  '/geelooy/games/mitzvahWorld/ckidsAwtsmoos/Olam/core/OlamGraftingPlain.js?v=test',
  '/geelooy/games/mitzvahWorld/ckidsAwtsmoos/Olam/properties/index.js?v=test',
  '/geelooy/games/mitzvahWorld/ckidsAwtsmoos/Olam/core/OlamInit.js?v=test',
  '/geelooy/games/mitzvahWorld/ckidsAwtsmoos/Olam/camera/index.js?v=test',
  '/geelooy/games/mitzvahWorld/ckidsAwtsmoos/systems/UserProgressManager.js?v=test',
  '/geelooy/games/mitzvahWorld/ckidsAwtsmoos/Olam/interaction/Yichud.js?compact=true',
  '/geelooy/games/mitzvahWorld/ckidsAwtsmoos/Olam/interaction/PlacementManager.js?compact=true',
  '/geelooy/games/mitzvahWorld/ckidsAwtsmoos/systems/combat/CombatManager.js?v=test',
  '/geelooy/games/mitzvahWorld/ckidsAwtsmoos/systems/worldState/WorldStateStore.js?v=test',
  '/geelooy/games/mitzvahWorld/ckidsAwtsmoos/divine_systems/render/core/PixelRatioGovernor.js?v=test'
];

async function fetchOne(base, urlPath) {
  const response = await fetch(`${base}${urlPath}`);
  const text = await response.text();
  return { urlPath, status: response.status, type: response.headers.get('content-type'), preview: text.slice(0, 160) };
}

const server = await startStaticServer(repoRoot);
try {
  const base = `http://127.0.0.1:${server.port}`;
  const results = [];
  for (const target of targets) results.push(await fetchOne(base, target));
  const report = { ok: results.every(result => result.status === 200 || result.status === 204), base, repoRoot, results };
  await writeFile('tests/chrome/staticFetchProbeReport.json', JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));
  if (!report.ok) process.exitCode = 1;
} finally {
  await server.close();
}
