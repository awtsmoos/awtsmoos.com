// B"H
export function resolveCutsceneIntent(event = {}, context = {}) { const type = event.type || "zone_intro"; return { type, zoneId:event.zoneId || context.zone?.manifest?.id || context.zone?.id || "zone", npcId:event.npcId || context.npcId || context.zone?.objects?.find?.(o=>o.type==="zone_npc")?.id || "guide", mood:event.mood || "warm_guidance", objective:event.objective || context.zoneJson?.introScene?.objective || "Meet the guide and learn the valley.", questId:event.questId || context.zoneJson?.introScene?.questId || "learn_the_valley" }; }
export default resolveCutsceneIntent;
