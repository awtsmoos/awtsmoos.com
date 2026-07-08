// B"H
/** Feature49ProfessionRuntime: tool wear, apprentices, scroll handwriting. */
import { mutateFeature49State } from './Feature49State.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
export function wearTool(toolId = 'hammer', stress = 1) { return mutateFeature49State(s => { s.toolWear ||= {}; s.toolWear[toolId] = Math.min(100, (s.toolWear[toolId] || 0) + stress); return s; }); }
export function toolCondition(toolId = 'hammer', state = {}) { const wear = state.toolWear?.[toolId] || 0; return wear > 80 ? 'fragile' : wear > 45 ? 'worn' : 'sound'; }
export function mentorApprentice(mentor = 'betzalel_crafter', apprentice = 'player', profession = 'repairer') { return mutateFeature49State(s => { s.apprentices ||= []; s.apprentices.push({ mentor, apprentice, profession, since: Date.now() }); s.apprentices = s.apprentices.slice(-40); return s; }); }
export function handwritingVariation(scribe = 'player', text = 'Alef') { return { slant: (scribe.length * 7 + text.length) % 11 - 5, pressure: 1 + ((scribe.length + text.length) % 5) / 10, seed: `${scribe}:${text.length}` }; }
export default { wearTool, toolCondition, mentorApprentice, handwritingVariation };
