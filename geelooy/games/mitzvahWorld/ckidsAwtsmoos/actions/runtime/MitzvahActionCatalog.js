// B"H
/** @file MitzvahActionCatalog.js @description Verbs for physical gameplay, creativity, and avodah. */
const ACTIONS = ["block","dodge","roll","parry","light-attack","heavy-attack","staff-combat","sword-combat","push","grab","throw","cast","bless","pray","dance","wave","point","sit","sleep","study","read","write","craft","cook","harvest","mine","fish","build","repair"];
export function mitzvahActionCatalog() { return ACTIONS.map(id => ({ id, tags:id.match(/pray|bless|study|read|write/) ? ["mitzvah","social"] : ["gameplay"], stamina:id.match(/attack|roll|mine/) ? 10 : 1, cooldownMs:id.match(/heavy|cast/) ? 700 : 120 })); }
export function installMitzvahActions(runtime) { const actions = mitzvahActionCatalog(); runtime?.actions?.registerMany?.(actions); runtime?.markReady?.("gameplay:actions", { count:actions.length }); return actions; }
export default mitzvahActionCatalog;
