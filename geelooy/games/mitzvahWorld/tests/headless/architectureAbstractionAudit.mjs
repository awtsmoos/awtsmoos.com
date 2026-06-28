// B"H
/**
 * Architecture abstraction audit.
 * Protects the new Reality / Simulation / Presentation seams so future code does
 * not slide back into ad-hoc dispatch, cadence, and unbounded list mutation.
 */
import fs from 'node:fs';
function assert(ok, msg) { if (!ok) throw new Error(msg); }
const files = {
  reality:'ckidsAwtsmoos/systems/core/WorldRealityAdapter.js',
  simulation:'ckidsAwtsmoos/systems/core/SimulationPulsePolicy.js',
  presentation:'ckidsAwtsmoos/systems/ui/WorldPresentationBus.js',
  living:'ckidsAwtsmoos/systems/livingWorld/LivingWorldRuntime.js',
  village:'ckidsAwtsmoos/systems/village/VillageActivitySchedulerRuntime.js',
  director:'ckidsAwtsmoos/systems/world/WorldEventDirectorRuntime.js'
};
const text = Object.fromEntries(Object.entries(files).map(([k,v]) => [k, fs.readFileSync(v, 'utf8')]));
assert(text.reality.includes('appendBounded') && text.reality.includes('capList'), 'Reality adapter must expose bounded mutation helpers');
assert(text.simulation.includes('pulsePolicy') && text.simulation.includes('framePolicy'), 'Simulation pulse policy must exist');
assert(text.presentation.includes('publishLivingWorld') && text.presentation.includes('publishUiPayload'), 'Presentation bus must publish living-world and UI payloads');
assert(text.living.includes('SimulationPulsePolicy.js') && text.living.includes('WorldPresentationBus.js'), 'LivingWorldRuntime must use simulation/presentation seams');
assert(text.village.includes('WorldRealityAdapter.js') && text.village.includes('WorldPresentationBus.js'), 'Village scheduler must use reality/presentation seams');
assert(text.director.includes('WorldRealityAdapter.js') && text.director.includes('WorldPresentationBus.js'), 'World director must use reality/presentation seams');
assert(!text.living.includes("new CustomEvent('mitzvah-world:living-world'"), 'LivingWorldRuntime should not hand-roll living-world CustomEvent');
console.log(JSON.stringify({ ok:true, seams:Object.keys(files), migrated:['LivingWorldRuntime','VillageActivitySchedulerRuntime','WorldEventDirectorRuntime'] }, null, 2));
