// B"H
/** Browser readiness contract: verifies code exposes enough boot diagnostics for real Chrome when available. */
import fs from 'node:fs';
function assert(ok, msg) { if (!ok) throw new Error(msg); }
const vessel = fs.readFileSync('ckidsAwtsmoos/Olam/core/OlamVessel.js', 'utf8');
const mobile = fs.readFileSync('systems/mobile/MobileCleanHudRuntime.js', 'utf8');
assert(vessel.includes('__AWTS_OLAM__'), 'OlamVessel must expose __AWTS_OLAM__ for browser proof');
assert(vessel.includes('__AWTS_SPATIAL_DIAG__'), 'OlamVessel must expose spatial diagnostics');
assert(vessel.includes('__AWTS_COMBAT_DIAG__'), 'OlamVessel must expose combat diagnostics');
assert(mobile.includes('awtsmoos-mobile-clean-hud'), 'mobile clean HUD should be detectable');
console.log(JSON.stringify({ ok:true, browserProofBlockedHere:true, diagnostics:['__AWTS_OLAM__','__AWTS_SPATIAL_DIAG__','__AWTS_COMBAT_DIAG__'] }, null, 2));
