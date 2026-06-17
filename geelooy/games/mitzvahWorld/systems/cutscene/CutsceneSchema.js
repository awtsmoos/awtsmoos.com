// B"H
export function normalizeCutscene(input = {}) { return { id:input.id || "cutscene", title:input.title || input.id || "Cutscene", mood:input.mood || "wonder", beats:Array.isArray(input.beats) ? input.beats : [], tracks:input.tracks || {}, triggers:input.triggers || [], consequences:input.consequences || [] }; }
export default normalizeCutscene;
