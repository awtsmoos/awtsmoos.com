// B"H
/** @file WorldMemoryBootstrap.js @description Boots the shared memory substrate before story, missions, and realism layers. */
import { createWorldMemoryRuntime } from './WorldMemoryRuntime.js';

const scope = globalThis;
if (!scope.__MITZVAH_WORLD_MEMORY__) {
  const memory = createWorldMemoryRuntime({ factLimit:1600, eventLimit:700 });
  scope.__MITZVAH_WORLD_MEMORY__ = memory;
  scope.__MITZVAH_WORLD_REMEMBER__ = (kind, target, data) => memory.remember(kind, target, data);
  scope.__MITZVAH_WORLD_RECORD__ = (type, payload) => memory.record(type, payload);
  memory.record('world-memory-awake', { text:'Mitzvah World begins remembering consequences.' });
  memory.village.remember('village', 'world-awakening', { text:'The living village receives its first shared memory.', reputation:0 });
}
export default scope.__MITZVAH_WORLD_MEMORY__;
