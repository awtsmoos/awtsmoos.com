/**
 * B"H
 * @module OhrTestHarness
 */
import { State } from '../binah/State.js';
import { WorldData } from '../data/WorldData.js';
import { DebateEncounters } from '../data/EncounterIndex.js';
import { tileAt, setPathTo } from './OhrWorld.js';
import { startDebate } from './OhrDebate.js';
import { questSummary, startQuest, recordQuestEvent } from './OhrQuest.js';
import { installEquipmentTests } from './equipment/EquipmentTestApi.js';

export const installOhrTest = () => {
  window.OhrTest = {
    state: State,
    tileAt,
    pathTo: setPathTo,
    simulateClickTile: setPathTo,
    jump: (mapId, x, y) => {
      if (WorldData[mapId]) State.MapId = mapId;
      State.resetHero(x, y);
    },
    preset: (name) => {
      const preset = State.Test.presets[name];
      if (!preset) return false;
      State.MapId = preset.map;
      State.resetHero(preset.start.x, preset.start.y);
      return setPathTo(preset.target.x, preset.target.y);
    },
    startTrainer: () => startDebate(DebateEncounters.trainer),
    startWild: () => startDebate(DebateEncounters.wild[0]),
    questSummary,
    startQuest,
    questEvent: recordQuestEvent
  };
  installEquipmentTests(window.OhrTest);
  console.log('B"H - OhrTest ready: preset door/forest/trainer/grass/market/orchard/quest, pathTo(x,y), questSummary()');
};
