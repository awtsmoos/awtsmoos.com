// B"H
/** Audit the Phase 1 world-memory substrate. */
import { readFile } from 'node:fs/promises';
import path from 'node:path';

const root = path.resolve(new URL('../..', import.meta.url).pathname);
const modules = [
  'systems/worldMemory/WorldFactDatabase.js',
  'systems/worldMemory/WorldFactStore.js',
  'systems/worldMemory/WorldEventHistory.js',
  'systems/worldMemory/NpcMemory.js',
  'systems/worldMemory/AnimalMemory.js',
  'systems/worldMemory/WeatherMemory.js',
  'systems/worldMemory/VillageMemory.js',
  'systems/worldMemory/SettlementMemory.js',
  'systems/worldMemory/WorldMemoryRuntime.js',
  'systems/worldMemory/WorldMemoryBootstrap.js'
];
function assert(ok, msg) { if (!ok) throw new Error(msg); }
for (const file of modules) {
  const mod = await import(path.join(root, file));
  assert(Object.keys(mod).length > 0, `${file} has no exports`);
}
const { createWorldMemoryRuntime } = await import(path.join(root, 'systems/worldMemory/WorldMemoryRuntime.js'));
const memory = createWorldMemoryRuntime({ factLimit:20, eventLimit:20 });
memory.npc.remember('rebbe-1', 'helped', { text:'Player helped carry seforim.', reputation:2 });
memory.animal.remember('goat-1', 'trail', { text:'Goat remembers the water path.' });
memory.weather.record('rain', { amount:3 });
memory.village.remember('village', 'chesed', { reputation:5 });
assert(memory.npc.attitude('rebbe-1') === 2, 'NPC attitude must use remembered reputation');
assert(memory.weather.wetness() === 3, 'Weather wetness must reflect rain');
assert(memory.village.reputation('village') === 5, 'Village reputation must reflect chesed');
const index = await readFile(path.join(root, 'index.html'), 'utf8');
assert(index.includes('WorldMemoryBootstrap.js'), 'index missing WorldMemoryBootstrap');
const pkg = await readFile(path.join(root, 'package.json'), 'utf8');
assert(pkg.includes('test:world-memory'), 'package missing test:world-memory');
console.log(JSON.stringify({ ok:true, modules:modules.length, report:memory.report() }, null, 2));
