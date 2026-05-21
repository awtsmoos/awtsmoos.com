import assert from 'node:assert/strict';
import { describeNpcAtTime, resolveNpcSchedule } from '../ckidsAwtsmoos/Olam/runtime/npcs/NpcScheduleRuntime.js';

const npc = {
  id: 'npc_reb_yosei',
  schedule: [
    { from: 6, to: 12, locationId: 'beis_midrosh', action: 'learn' },
    { from: 12, to: 18, locationId: 'wood_yard', action: 'guideQuest' },
    { from: 18, to: 22, locationId: 'home_yosei', action: 'host' }
  ]
};

assert.equal(resolveNpcSchedule(npc.schedule, 13).action, 'guideQuest');
assert.deepEqual(describeNpcAtTime(npc, 19), {
  npcId: 'npc_reb_yosei',
  locationId: 'home_yosei',
  action: 'host',
  reason: 'schedule'
});
assert.equal(describeNpcAtTime({ id: 'empty' }, 9).action, 'idle');

console.log('B"H npc schedule passed');
