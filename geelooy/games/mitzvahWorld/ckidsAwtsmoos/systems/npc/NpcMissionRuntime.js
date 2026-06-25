// B"H
/** NPC mission glue with Torah/story compatibility responses. */
export function npcMissionOffer(npcId, missions = []) { return missions.find(m=>m.npc===npcId||m.giver===npcId)||null; }
export function npcMissionResponses(npc = {}, ctx = {}) { const offer=npcMissionOffer(npc.id||npc.npcId, ctx.missions||[]); return offer?[{kind:'mission',missionId:offer.id,text:offer.title}]:[{kind:'mission',text:'I have no task now, but kindness is never idle.'}]; }
export function npcTorahTeachingResponses(npc = {}, ctx = {}) { return [{ kind:'torah', text:ctx.topic ? 'A teaching about '+ctx.topic+' waits in your next good action.' : 'A mitzvah makes the world more awake.' }]; }
export function emitNpcMissionPayload(payload = {}) { globalThis.dispatchEvent?.(new CustomEvent('mitzvah-world:npc-mission',{detail:payload})); return payload; }
export default { npcMissionOffer, npcMissionResponses, npcTorahTeachingResponses, emitNpcMissionPayload };
