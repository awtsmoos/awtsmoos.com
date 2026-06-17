// B"H
export function cutsceneEventFromZone(zone = {}, zoneJson = {}) { return { type:"zone_intro", zoneId:zone.manifest?.id || zoneJson.id || "zone", npcId:zoneJson.introScene?.npcId || zone.objects?.find?.(o=>o.type==="zone_npc")?.id || "woodsman", questId:zoneJson.introScene?.questId || "learn_the_valley", objective:zoneJson.introScene?.objective || "Speak to the woodsman and learn the valley." }; }
export default cutsceneEventFromZone;
