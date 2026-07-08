// B"H
/** Feature49Runtime: one low-cost doorway into all 49 living-world features. */
import { FEATURE49, feature49Get, feature49List } from './Feature49Registry.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
import * as State from './Feature49State.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
import * as Social from './Feature49SocialRuntime.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
import * as World from './Feature49WorldRuntime.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
import * as Economy from './Feature49EconomyRuntime.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
import * as Ecology from './Feature49EcologyRuntime.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
import * as Weather from './Feature49WeatherRuntime.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
import * as Torah from './Feature49TorahRuntime.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
import * as Simulation from './Feature49SimulationRuntime.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
import * as Calendar from './Feature49CalendarRuntime.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
import * as Housing from './Feature49HousingRuntime.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
import * as Journal from './Feature49JournalRuntime.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
import * as Profession from './Feature49ProfessionRuntime.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
export function createFeature49Runtime(scope=globalThis){
  const api = { FEATURE49, feature49Get, feature49List, ...State, Social, World, Economy, Ecology, Weather, Torah, Simulation, Calendar, Housing, Journal, Profession,
    step(reason='tick'){
      const state=State.loadFeature49State();
      const budget=scope.__MITZVAH_WORLD_REALISM_BUDGET__||{};
      const plan=Simulation.villageBrain(['social','economy','ecology','world','torah'],budget);
      State.appendFeature49Log({type:'feature49-step',reason,plan:plan.slice(0,3)});
      return { state, budgetLevel:budget.level||'unknown', plan };
    }
  };
  scope.__MITZVAH_WORLD_FEATURE49__ = api;
  return api;
}
export default createFeature49Runtime;
