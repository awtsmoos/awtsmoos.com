// B"H
/** Feature49JournalRuntime: NPC journals and history from actual events. */
import { loadFeature49State, mutateFeature49State } from './Feature49State.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
export function journalEntry(npcId = 'villager', event = {}) { return mutateFeature49State(s => { s.journals ||= {}; (s.journals[npcId] ||= []).push({ ...event, at: Date.now() }); s.journals[npcId] = s.journals[npcId].slice(-60); return s; }); }
export function npcJournalSummary(npcId = 'villager', state = loadFeature49State()) { const rows = state.journals?.[npcId] || []; return rows.length ? `${npcId} remembers ${rows.length} recent happenings.` : `${npcId} has not written today.`; }
export function historicalArchivePage(state = loadFeature49State()) { return { accomplishments: state.archive || [], projects: state.projects || {}, civilization: state.civilization || {} }; }
export default { journalEntry, npcJournalSummary, historicalArchivePage };
