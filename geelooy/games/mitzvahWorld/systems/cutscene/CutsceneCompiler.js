// B"H
import { normalizeCutscene } from "./CutsceneSchema.js";
import { cutsceneBeat } from "./CutsceneBeat.js";
import { cutsceneTrack } from "./CutsceneTrack.js";
import { cutsceneTimeline } from "./CutsceneTimeline.js";
function beatsOf(c, kind) { return (c.beats || []).filter(b => b.kind === kind).map(b => cutsceneBeat(kind, b.at || 0, { ...b })); }
export function compileCutscene(input = {}) { const c = normalizeCutscene(input); const tracks = ["control","camera","lighting","dialogue","animation","audio","consequence"].map(kind => cutsceneTrack(kind, beatsOf(c, kind))).filter(t => t.beats.length); return { id:c.id, title:c.title, mood:c.mood || "wonder", timeline:cutsceneTimeline(tracks), triggers:c.triggers || [], consequences:c.consequences || [] }; }
export default compileCutscene;
