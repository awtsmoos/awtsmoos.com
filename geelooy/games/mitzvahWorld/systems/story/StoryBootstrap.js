// B"H
/** @file StoryBootstrap.js @description Boots cheap living story memory and event-driven thread runtime. */
import { createStoryMemoryRuntime } from './StoryMemoryRuntime.js?compact=true&v=compact-all-visible-npc-never-cull-20260708-bh11';
import { createStoryThreadRuntime } from './StoryThreadRuntime.js?compact=true&v=compact-all-visible-npc-never-cull-20260708-bh11';
import { livingStoryPolicy } from './LivingStoryPolicy.js?compact=true&v=compact-all-visible-npc-never-cull-20260708-bh11';

const scope = globalThis;
if (!scope.__MITZVAH_STORY_RUNTIME__) {
  const memory = createStoryMemoryRuntime(360);
  const threads = createStoryThreadRuntime(memory, scope.__MITZVAH_WORLD_PERFORMANCE_BUDGET__);
  const runtime = { memory, threads, policy:livingStoryPolicy(scope.__MITZVAH_WORLD_PERFORMANCE_BUDGET__), report:() => ({ memory:memory.report(), threads:threads.report() }) };
  scope.__MITZVAH_STORY_RUNTIME__ = runtime;
  scope.__MITZVAH_STORY_EVENT__ = event => {
    if (event?.type === 'start-thread') return threads.startThread(event);
    if (event?.type === 'add-beat') return threads.addBeat(event.id, event);
    if (event?.type === 'resolve-thread') return threads.resolve(event.id, event);
    return memory.remember({ kind:event?.type || 'story-event', target:event?.target || 'world', text:event?.text || 'A quiet story event occurred.', reputation:event?.reputation || 0 });
  };
  memory.remember({ kind:'world-awakening', target:'village', text:'The village begins remembering the player as a shliach in a living ancient world.', reputation:0 });
}
export default scope.__MITZVAH_STORY_RUNTIME__;
