// B"H
/** Proves the mobile boot blocker named in DevTools cannot recur silently. */
import { readFile } from 'node:fs/promises';
function assert(ok,msg){ if(!ok) throw new Error(msg); }
const vessel = await readFile('ckidsAwtsmoos/Olam/core/OlamVessel.js','utf8');
const store = await import('../../ckidsAwtsmoos/systems/worldState/WorldStateStore.js');
const html = await readFile('index.html','utf8');
const clean = await readFile('systems/mobile/MobileCleanHudRuntime.js','utf8');
assert(vessel.includes('ensureWorldState') && vessel.includes('worldStateSnapshot'), 'OlamVessel should use world state compatibility exports');
assert(typeof store.ensureWorldState === 'function', 'WorldStateStore must export ensureWorldState');
assert(typeof store.worldStateSnapshot === 'function', 'WorldStateStore must export worldStateSnapshot');
assert(typeof store.default.ensureWorldState === 'function', 'default export should expose ensureWorldState');
assert(html.includes('MobileCleanHudRuntime.js'), 'index must load mobile clean HUD runtime');
assert(clean.includes('awtsmoos-mobile-clean-hud'), 'clean HUD class must exist');
console.log(JSON.stringify({ ok:true, exports:['ensureWorldState','worldStateSnapshot'], cleanHud:true }, null, 2));
