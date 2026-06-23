// B"H
/**
 * @file FamilyRuntime.js
 * Villages stop being loose NPCs and become households with roles and memory.
 */
const jobs = ['farmer','teacher','smith','shepherd','scribe','merchant','healer'];
export function createFamilyRuntime(memory = globalThis.__MITZVAH_WORLD_MEMORY__) {
  const families = new Map();
  function create(id = `family-${families.size + 1}`, seed = families.size + 1) { const family = { id, parents:[`${id}-parent-a`, `${id}-parent-b`], children:Array.from({ length:seed % 4 }, (_, i) => `${id}-child-${i + 1}`), occupation:jobs[seed % jobs.length], home:`${id}-home`, reputation:0 }; families.set(id, family); memory?.record?.('family-created', family); return family; }
  function get(id) { return families.get(id) || create(id); }
  function remember(id, text, reputation = 0) { const family = get(id); family.reputation += reputation; memory?.remember?.('family-memory', id, { text, reputation }); return family; }
  function report() { return { families:families.size, jobs:[...new Set([...families.values()].map(f => f.occupation))] }; }
  return { create, get, remember, report, families };
}
export default createFamilyRuntime;
