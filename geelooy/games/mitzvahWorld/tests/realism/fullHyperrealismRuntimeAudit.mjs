// B"H
/** Audit all-phase hyperrealism runtime foundations. */
import path from 'node:path';
import { readFile } from 'node:fs/promises';

const root = path.resolve(new URL('../..', import.meta.url).pathname);
const modules = [
  'systems/worldState/WorldStateRuntime.js',
  'systems/simulation/HyperrealSimulationRuntime.js',
  'systems/environment/EnvironmentWearRuntime.js',
  'systems/families/FamilyRuntime.js',
  'systems/npc/NpcLivingRuntime.js',
  'systems/villages/VillageLifeRuntime.js',
  'systems/community/CommunityRuntime.js',
  'systems/animals/AnimalEcosystemRuntime.js',
  'systems/weather/WeatherConsequenceRuntime.js',
  'systems/audio/AudioEcologyRuntime.js',
  'systems/buildings/BuildingLifecycleRuntime.js',
  'systems/terrain/TerrainMemoryRuntime.js',
  'systems/realism/FullHyperrealismRuntime.js',
  'systems/realism/FullHyperrealismBootstrap.js'
];
function assert(ok, msg) { if (!ok) throw new Error(msg); }
for (const file of modules) {
  const mod = await import(path.join(root, file));
  assert(Object.keys(mod).length > 0, `${file} has no exports`);
}
const { createWorldMemoryRuntime } = await import(path.join(root, 'systems/worldMemory/WorldMemoryRuntime.js'));
globalThis.__MITZVAH_WORLD_MEMORY__ = createWorldMemoryRuntime();
const { createFullHyperrealismRuntime } = await import(path.join(root, 'systems/realism/FullHyperrealismRuntime.js'));
const runtime = createFullHyperrealismRuntime(globalThis);
const report = runtime.seed();
assert(report.state.regions.length >= 1, 'world state not seeded');
assert(report.families.families >= 1, 'families not seeded');
assert(report.animals.animals >= 1, 'animals not seeded');
assert(report.environment.wear >= 1, 'environment wear not updated');
assert(report.weather.events >= 1, 'weather consequences not seeded');
const index = await readFile(path.join(root, 'index.html'), 'utf8');
assert(index.includes('FullHyperrealismBootstrap.js'), 'index missing FullHyperrealismBootstrap');
console.log(JSON.stringify({ ok:true, modules:modules.length, report }, null, 2));
