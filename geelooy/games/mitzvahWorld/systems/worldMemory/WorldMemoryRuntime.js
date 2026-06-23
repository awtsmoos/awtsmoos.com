// B"H
/**
 * @file WorldMemoryRuntime.js
 * One runtime where villages, NPCs, animals, weather, and settlements remember.
 */
import { createWorldFactDatabase } from './WorldFactDatabase.js';
import { createWorldFactStore } from './WorldFactStore.js';
import { createWorldEventHistory } from './WorldEventHistory.js';
import { createNpcMemory } from './NpcMemory.js';
import { createAnimalMemory } from './AnimalMemory.js';
import { createWeatherMemory } from './WeatherMemory.js';
import { createVillageMemory } from './VillageMemory.js';
import { createSettlementMemory } from './SettlementMemory.js';

export function createWorldMemoryRuntime(options = {}) {
  const database = createWorldFactDatabase(options.factLimit || 1600);
  const store = createWorldFactStore(database);
  const events = createWorldEventHistory(options.eventLimit || 700);
  const runtime = {
    database,
    store,
    events,
    npc:createNpcMemory(store, events),
    animal:createAnimalMemory(store, events),
    weather:createWeatherMemory(store, events),
    village:createVillageMemory(store, events),
    settlement:createSettlementMemory(store, events)
  };
  runtime.remember = (kind, target, data = {}) => store.remember(kind, target, data);
  runtime.record = (type, payload = {}) => events.record(type, payload);
  runtime.report = () => ({ facts:database.report(), events:events.report() });
  return runtime;
}
export default createWorldMemoryRuntime;
