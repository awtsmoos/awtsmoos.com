// B"H
/**
 * @file FullHyperrealismRuntime.js
 * Master vessel for every hyperrealism foundation: memory, state, simulation,
 * wear, terrain, families, NPCs, villages, community, animals, weather, audio,
 * and buildings. Low-level renderers can consume this without guessing.
 */
import { createWorldStateRuntime } from '../worldState/WorldStateRuntime.js';
import { createHyperrealSimulationRuntime } from '../simulation/HyperrealSimulationRuntime.js';
import { createEnvironmentWearRuntime } from '../environment/EnvironmentWearRuntime.js';
import { createFamilyRuntime } from '../families/FamilyRuntime.js';
import { createNpcLivingRuntime } from '../npc/NpcLivingRuntime.js';
import { createVillageLifeRuntime } from '../villages/VillageLifeRuntime.js';
import { createCommunityRuntime } from '../community/CommunityRuntime.js';
import { createAnimalEcosystemRuntime } from '../animals/AnimalEcosystemRuntime.js';
import { createWeatherConsequenceRuntime } from '../weather/WeatherConsequenceRuntime.js';
import { createAudioEcologyRuntime } from '../audio/AudioEcologyRuntime.js';
import { createBuildingLifecycleRuntime } from '../buildings/BuildingLifecycleRuntime.js';
import { createTerrainMemoryRuntime } from '../terrain/TerrainMemoryRuntime.js';

export function createFullHyperrealismRuntime(scope = globalThis) {
  const memory = scope.__MITZVAH_WORLD_MEMORY__;
  const state = createWorldStateRuntime(memory);
  const environment = createEnvironmentWearRuntime(memory);
  const runtime = {
    memory,
    state,
    simulation:createHyperrealSimulationRuntime(scope.__MITZVAH_WORLD_PERFORMANCE_BUDGET__?.simulation),
    environment,
    terrain:createTerrainMemoryRuntime(memory),
    families:createFamilyRuntime(memory),
    npcs:createNpcLivingRuntime(memory),
    villages:createVillageLifeRuntime(memory, state),
    community:createCommunityRuntime(memory),
    animals:createAnimalEcosystemRuntime(memory),
    weather:createWeatherConsequenceRuntime(memory, environment),
    audio:createAudioEcologyRuntime(memory),
    buildings:createBuildingLifecycleRuntime(memory, environment)
  };
  runtime.seed = () => {
    runtime.families.create('cohen-family', 2);
    runtime.npcs.rumor('rebbe-1', 'The village remembers every mitzvah.');
    runtime.villages.need('village', 'repair-fence', 2);
    runtime.community.learning('Children gather for alef-beis and stories of chesed.');
    runtime.animals.create('goat-1', 'goat', 5);
    runtime.weather.rain('village', 2);
    runtime.audio.village();
    runtime.buildings.age('house-1', 8);
    runtime.terrain.wet('village:0:0', 2);
    runtime.simulation.stat('farHerds', 3);
    return runtime.report();
  };
  runtime.report = () => Object.fromEntries(Object.entries(runtime).filter(([, v]) => v?.report).map(([k, v]) => [k, v.report()]));
  return runtime;
}
export default createFullHyperrealismRuntime;
