// B"H
/**
 * @file StoryThreadRuntime.js
 * Event-driven story threads: a village request can become rumor, memory,
 * consequence, and reward without per-frame scanning.
 */
import { livingStoryPolicy } from './LivingStoryPolicy.js?compact=true&v=compact-all-visible-npc-never-cull-20260708-bh11';

export function createStoryThreadRuntime(memory, budget = globalThis.__MITZVAH_WORLD_PERFORMANCE_BUDGET__) {
  const policy = livingStoryPolicy(budget);
  const threads = new Map();
  function startThread(seed = {}) {
    const id = seed.id || `${seed.family || 'story'}-${Date.now()}-${threads.size}`;
    if (threads.size >= policy.maxActiveThreads) return { ok:false, reason:'story-thread-budget-full', policy };
    const thread = { id, family:seed.family || 'mitzvah-chain', state:'seed', beats:[{ kind:'seed', at:Date.now(), text:seed.text || 'A quiet need enters the world.' }], active:true, createdAt:Date.now(), updatedAt:Date.now(), target:seed.target || 'village' };
    threads.set(id, thread);
    memory?.remember?.({ kind:'story-thread-started', id, target:thread.target, text:thread.beats[0].text, reputation:0 });
    return { ok:true, thread };
  }
  function addBeat(id, beat = {}) {
    const thread = threads.get(id);
    if (!thread) return null;
    const next = { kind:beat.kind || 'memory', at:Date.now(), text:beat.text || '', consequence:beat.consequence || null };
    thread.beats.push(next);
    thread.state = next.kind;
    thread.updatedAt = Date.now();
    memory?.remember?.({ kind:`story-${next.kind}`, id, target:thread.target, text:next.text, reputation:beat.reputation || 0 });
    return thread;
  }
  function resolve(id, outcome = {}) {
    const thread = addBeat(id, { kind:'reward', text:outcome.text || 'The mitzvah leaves a blessing in the village.', reputation:outcome.reputation ?? 1 });
    if (thread) thread.active = false;
    return thread;
  }
  function active() { return [...threads.values()].filter(t => t.active); }
  function report() { return { policy, threads:threads.size, active:active().length, families:[...new Set([...threads.values()].map(t => t.family))] }; }
  return { startThread, addBeat, resolve, active, report, threads };
}
export default createStoryThreadRuntime;
