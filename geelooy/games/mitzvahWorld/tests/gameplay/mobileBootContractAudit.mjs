// B"H
/**
 * mobileBootContractAudit
 *
 * Purpose:
 * Proves the phone boot blockers named in DevTools cannot recur silently.
 *
 * Runtime owner:
 * `npm run test:mobile-boot`.
 *
 * Inputs:
 * Local source modules only; no browser or network needed.
 *
 * Outputs:
 * Throws on contract drift, prints a small JSON proof on success.
 *
 * Performance:
 * Static file reads and ESM imports only.
 *
 * Fallback:
 * None. Broken boot aliases or missing mobile HUD ownership should fail.
 *
 * Diagnostics:
 * Reports the normalized local level aliases verified by the test.
 *
 * Why it exists:
 * Mobile browser proof uses `?path=village`, while the runtime data vessel is
 * `village.json`. The alias must remain allow-listed without enabling arbitrary
 * paths.
 */
import { readFile } from 'node:fs/promises';

function assert(ok, msg) {
  if (!ok) throw new Error(msg);
}

const vessel = await readFile('ckidsAwtsmoos/Olam/core/OlamVessel.js', 'utf8');
const store = await import('../../ckidsAwtsmoos/systems/worldState/WorldStateStore.js');
const levelSource = await import('../../ckidsAwtsmoos/boot/LevelSource.js');
const html = await readFile('index.html', 'utf8');
const clean = await readFile('systems/mobile/MobileCleanHudRuntime.js', 'utf8');
const workerMessages = await readFile('ckidsAwtsmoos/Olam/ikarOyvedManager/messages/WorkerMessageInterceptor.js', 'utf8');

assert(vessel.includes('ensureWorldState') && vessel.includes('worldStateSnapshot'), 'OlamVessel should use world state compatibility exports');
assert(typeof store.ensureWorldState === 'function', 'WorldStateStore must export ensureWorldState');
assert(typeof store.worldStateSnapshot === 'function', 'WorldStateStore must export worldStateSnapshot');
assert(typeof store.default.ensureWorldState === 'function', 'default export should expose ensureWorldState');
assert(levelSource.normalizeLevelId('village') === 'village.json', '?path=village must normalize to the local village JSON vessel');
assert(levelSource.normalizeLevelId('ladder-1') === 'ladder-1.json', 'extensionless ladder paths must normalize to local JSON vessels');
assert(levelSource.normalizeLevelId('village.json') === 'village.json', 'explicit village.json path must remain accepted');
assert(levelSource.jsonSourcePath('village.js') === 'village.json', 'JS local vessels must report JSON source paths');
assert(html.includes('MobileCleanHudRuntime.js'), 'index must load mobile clean HUD runtime');
assert(clean.includes('awtsmoos-mobile-clean-hud'), 'clean HUD class must exist');
assert(!html.includes('ctx.readPixels'), 'no-black guard must not read WebGL pixels before OffscreenCanvas transfer');
assert(!html.includes("canvas.getContext && canvas.getContext('webgl2')"), 'no-black guard must not create a main-thread WebGL context');
assert(!html.includes('autoload:dispatch:done|rendered first time'), 'autoload dispatch alone must not hide the no-black guard');
assert(workerMessages.includes('dispatchGameReadyPhase(stage, data)'), 'worker world_final_ready must notify the no-black guard');

let unsafeRejected = false;
try {
  levelSource.normalizeLevelId('https://example.com/village.json');
} catch {
  unsafeRejected = true;
}
assert(unsafeRejected, 'remote-looking paths must stay rejected');

console.log(JSON.stringify({
  ok:true,
  exports:['ensureWorldState', 'worldStateSnapshot'],
  levelAliases:{ village:levelSource.normalizeLevelId('village'), ladder1:levelSource.normalizeLevelId('ladder-1') },
  cleanHud:true
}, null, 2));
