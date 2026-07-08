// B"H
import checklist from "../schools/PlayerSchoolChecklist.js?compact=true&v=compact-all-visible-npc-never-cull-20260708-bh11";
import { schoolSummary } from "../schools/PlayerSchoolProgress.js?compact=true&v=compact-all-visible-npc-never-cull-20260708-bh11";
globalThis.window = { localStorage:{ getItem(){return "{}";}, setItem(){} } };
console.log(JSON.stringify({ total:checklist.length, summary:schoolSummary(globalThis.window) }, null, 2));
