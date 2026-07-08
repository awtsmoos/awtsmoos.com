// B"H
import { normalizeCutscene } from "./CutsceneSchema.js?compact=true&v=compact-all-visible-npc-never-cull-20260708-bh11";
import { cutsceneBeat } from "./CutsceneBeat.js?compact=true&v=compact-all-visible-npc-never-cull-20260708-bh11";
import { cutsceneTrack } from "./CutsceneTrack.js?compact=true&v=compact-all-visible-npc-never-cull-20260708-bh11";
import { cutsceneTimeline } from "./CutsceneTimeline.js?compact=true&v=compact-all-visible-npc-never-cull-20260708-bh11";
function beatsOf(c, kind) { return (c.beats || []).filter(b => b.kind === kind).map(b => cutsceneBeat(kind, b.at || 0, { ...b })); }
export function compileCutscene(input = {}) { const c = normalizeCutscene(input); const tracks = ["control","camera","lighting","dialogue","animation","audio","consequence"].map(kind => cutsceneTrack(kind, beatsOf(c, kind))).filter(t => t.beats.length); return { id:c.id, title:c.title, mood:c.mood || "wonder", timeline:cutsceneTimeline(tracks), triggers:c.triggers || [], consequences:c.consequences || [] }; }
export default compileCutscene;
