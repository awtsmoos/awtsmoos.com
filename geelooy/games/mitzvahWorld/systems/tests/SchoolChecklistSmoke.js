// B"H
import checklist from "../schools/PlayerSchoolChecklist.js";
import { schoolSummary } from "../schools/PlayerSchoolProgress.js";
globalThis.window = { localStorage:{ getItem(){return "{}";}, setItem(){} } };
console.log(JSON.stringify({ total:checklist.length, summary:schoolSummary(globalThis.window) }, null, 2));
