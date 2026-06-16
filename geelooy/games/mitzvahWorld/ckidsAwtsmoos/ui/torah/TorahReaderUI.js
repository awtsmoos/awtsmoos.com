// B"H
/** @file TorahReaderUI.js @description Pure view-models for sefer reader and Torah spellbook payloads. */
export function seferReaderView(payload = {}) { const sefer = payload.sefer || {}; return { type:"SeferReaderUI", open:payload.open === true, seferId:sefer.id || null, name:sefer.name || "Sefer", text:sefer.readableText || "", passages:payload.passages || [] }; }
export function torahSpellbookView(payload = {}) { return { type:"TorahSpellbookUI", open:payload.open === true, learned:payload.learned || [], sefarim:payload.sefarim || [], mastery:payload.mastery || {} }; }
export default { seferReaderView, torahSpellbookView };
