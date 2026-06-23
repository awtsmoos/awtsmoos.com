// B"H
/**
 * @file StoryMemoryRuntime.js
 * Compact story memory: facts, not giant transcripts. NPCs can remember and the
 * village can whisper without making every frame carry a library.
 */
export function createStoryMemoryRuntime(limit = 300) {
  const facts = new Map();
  function key(fact = {}) { return `${fact.kind || 'memory'}:${fact.target || 'world'}:${fact.id || fact.text || Date.now()}`; }
  function remember(fact = {}) {
    const k = key(fact);
    facts.set(k, { ...fact, key:k, at:Date.now(), strength:fact.strength ?? 1 });
    while (facts.size > limit) facts.delete(facts.keys().next().value);
    return facts.get(k);
  }
  function recall(filter = {}) {
    return [...facts.values()].filter(f => (!filter.kind || f.kind === filter.kind) && (!filter.target || f.target === filter.target));
  }
  function reputation(target = 'village') {
    return recall({ target }).reduce((sum, f) => sum + Number(f.reputation || 0), 0);
  }
  function report() {
    const byKind = {};
    for (const f of facts.values()) byKind[f.kind || 'memory'] = (byKind[f.kind || 'memory'] || 0) + 1;
    return { facts:facts.size, byKind };
  }
  return { remember, recall, reputation, report, facts };
}
export default createStoryMemoryRuntime;
