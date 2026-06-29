/* B"H
Inspector model: the selected clip/source exposes transform, crop, audio, and speed.
*/
export function createInspectorModel(target = null) { return { target, transform:{ x:0, y:0, scale:1, rotation:0, opacity:1 }, crop:{ left:0, top:0, right:0, bottom:0 }, audio:{ volume:1, mute:false, pan:0, syncOffsetMs:0 }, speed:{ rate:1, reverse:false } }; }
export function updateInspectorSection(model, section, patch = {}) { model[section] = { ...(model[section] || {}), ...patch }; return model[section]; }
