// B"H
/** Feature49Runtime: one low-cost doorway into all 49 living-world features. */
import { FEATURE49, feature49Get, feature49List } from './Feature49Registry.js';
import * as State from './Feature49State.js';
import * as Social from './Feature49SocialRuntime.js';
import * as World from './Feature49WorldRuntime.js';
import * as Economy from './Feature49EconomyRuntime.js';
import * as Ecology from './Feature49EcologyRuntime.js';
import * as Weather from './Feature49WeatherRuntime.js';
import * as Torah from './Feature49TorahRuntime.js';
import * as Simulation from './Feature49SimulationRuntime.js';
import * as Calendar from './Feature49CalendarRuntime.js';
import * as Housing from './Feature49HousingRuntime.js';
import * as Journal from './Feature49JournalRuntime.js';
import * as Profession from './Feature49ProfessionRuntime.js';
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
