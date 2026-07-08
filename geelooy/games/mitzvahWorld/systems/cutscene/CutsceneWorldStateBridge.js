// B"H
import { applyCutsceneConsequences } from "./CutsceneConsequenceRuntime.js?compact=true&v=compact-all-visible-npc-never-cull-20260708-bh11";
export function bridgeCutsceneWorldState(holder = {}, consequences = []) { const base = holder.worldState || holder.__awtsmoosWorldState || {}; const next = applyCutsceneConsequences(base, consequences); holder.worldState = next; holder.__awtsmoosWorldState = next; return next; }
export default bridgeCutsceneWorldState;
