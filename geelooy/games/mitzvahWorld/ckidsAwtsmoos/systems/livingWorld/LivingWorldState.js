// B"H
/**
 * LivingWorldState
 * A small durable vessel where the Awtsmoos lets a town remember itself: bounded
 * NPC memories, family trust, schedules, rumors, economy, missions, projects,
 * social consequences, village activity, and UI payloads.
 */
const KEY = 'mitzvahWorld.livingWorld.state';
const memory = { value: null };
const MAX = Object.freeze({ memories: 32, rumors: 40, events: 80, feed: 18, social: 60, apologies: 40 });
function now(){ return Date.now(); }
function clone(v){ return JSON.parse(JSON.stringify(v ?? {})); }
function storage(){ try { return globalThis.localStorage || null; } catch { return null; } }
function cap(list, n){ return (list || []).slice(-n); }
export const STARTER_NPCS = Object.freeze([
  { id:'miriam_baker', name:'Miriam', home:'baker_home', workplace:'bakery', profession:'baker', family:['tova_child'], role:'baker' },
  { id:'rebbe_akiva', name:'Rebbe Akiva', home:'rebbe_home', workplace:'beis_midrash', profession:'teacher', family:[], role:'scholar' },
  { id:'levi_guard', name:'Levi', home:'guard_house', workplace:'village_gate', profession:'guard', family:[], role:'guard' },
  { id:'betzalel_crafter', name:'Betzalel', home:'crafter_home', workplace:'workshop', profession:'crafter', family:[], role:'artisan' },
  { id:'tova_child', name:'Tova', home:'baker_home', workplace:'schoolyard', profession:'child', family:['miriam_baker'], role:'child' }
]);
export function defaultLivingWorldState(){ return {
  currentDay:1, currentSeason:'spring', clockHour:6, discoveredPlaces:['market_square'], hearthLocation:'inn_hearth',
  npcs: STARTER_NPCS.map(n => ({ ...n, currentPlace:n.home, currentRole:'wake', knownRumors:[], needs:{ hunger:1, rest:1, trust:0 }, relationships:{} })),
  npcMemories:{}, npcSchedules:{}, movementIntents:[], rumors:[], activeMissions:{}, completedMissions:[], familyTrust:{}, socialConsequences:[], apologies:[], economyTransactions:[],
  reputation:{ village:0, merchants:0, poorFamilies:0, scholars:0, children:0, guards:0, travelers:0, animals:0, virtues:{} },
  economy:{ grain:6, flour:2, dough:1, bread:2, wood:4, plank:1, wax:2, candle:1, paper:2, ink:1, soup:0, charity:1, water:8, milk:2, honey:2, tea:1, demand:{ bread:5, candle:3, soup:2, water:4, milk:2, tea:3, honey:2 }, prices:{ bread:5, candle:4, soup:3, water:1, milk:3, tea:3, honey:4 } },
  craftedItems:[], servicesVisited:[], ambientEvents:[], villageProjects:{ benchRepair:0, hospitality:0, charityNetwork:1 }, tutorialProgress:{}, villageActivity:null, servicesOpen:{}, worldEventDirector:{ recent:[], events:[], last:null, pulses:0, hasLoop:false }, uiPayloads:{}, eventFeed:[]
}; }
export function normalizeLivingWorldState(state={}){ const base=defaultLivingWorldState(); return { ...base, ...clone(state), familyTrust:{...base.familyTrust,...(state.familyTrust||{})}, socialConsequences:cap(state.socialConsequences||base.socialConsequences,MAX.social), apologies:cap(state.apologies||base.apologies,MAX.apologies), economyTransactions:cap(state.economyTransactions||base.economyTransactions,50), economy:{...base.economy,...(state.economy||{}), demand:{...base.economy.demand,...(state.economy?.demand||{})}, prices:{...base.economy.prices,...(state.economy?.prices||{})}}, reputation:{...base.reputation,...(state.reputation||{}), virtues:{...base.reputation.virtues,...(state.reputation?.virtues||{})}}, servicesOpen:{...base.servicesOpen,...(state.servicesOpen||{})} }; }
export function loadLivingWorldState(){ const box=storage(); if(!memory.value){ try{ memory.value=box ? JSON.parse(box.getItem(KEY)||'null') : null; }catch{ memory.value=null; } } return normalizeLivingWorldState(memory.value || {}); }
export function saveLivingWorldState(state={}){ const next=normalizeLivingWorldState({ ...state, updatedAt:now() }); memory.value=clone(next); try{ storage()?.setItem?.(KEY, JSON.stringify(next)); }catch{} return next; }
export function mutateLivingWorldState(fn){ const state=loadLivingWorldState(); return saveLivingWorldState(fn?.(state) || state); }
export function resetLivingWorldState(seed={}){ return saveLivingWorldState(seed); }
export function findNpc(state, npcId){ return (state.npcs || []).find(n => n.id === npcId) || null; }
export function addMemory(state, npcId, event={}){ const row={ ...event, at:event.at || now() }; state.npcMemories[npcId] = cap([...(state.npcMemories[npcId]||[]), row], MAX.memories); return row; }
export function addRumor(state, rumor={}){ const row={ id:rumor.id || `rumor_${now()}_${state.rumors.length}`, sourceNpc:rumor.sourceNpc||'village', originalText:rumor.originalText||rumor.text||'', currentText:rumor.currentText||rumor.text||rumor.originalText||'', truthValue:rumor.truthValue ?? true, distortionAmount:rumor.distortionAmount||0, spreadCount:rumor.spreadCount||0, heardBy:[...(rumor.heardBy||[])], timestamp:rumor.timestamp||now(), topic:rumor.topic||'kindness', emotionalTone:rumor.emotionalTone||'warm' }; state.rumors=cap([...state.rumors,row],MAX.rumors); return row; }
export function addEventFeed(state, event={}){ const row={ ...event, at:event.at || now() }; state.eventFeed=cap([...(state.eventFeed||[]), row], MAX.events); state.ambientEvents=cap([...(state.ambientEvents||[]), row], MAX.events); return row; }
export function addMovementIntent(state, intent={}){ const row={ urgency:'normal', startedAt:now(), estimatedArrival:now()+45000, ...intent }; state.movementIntents=cap([...(state.movementIntents||[]), row], 24); const npc=findNpc(state,row.npcId); if(npc){ npc.currentPlace=row.to; npc.currentIntent=row; } return row; }
export function adjustReputation(state, scope='village', amount=1, virtue='reliability'){ state.reputation[scope]=(state.reputation[scope]||0)+amount; state.reputation.virtues[virtue]=(state.reputation.virtues[virtue]||0)+amount; return state.reputation; }
export function uiPayloads(state=loadLivingWorldState()){ return { ...(state.uiPayloads||{}), questTrackerRows:Object.values(state.activeMissions||{}).map(m=>({ id:m.id,title:m.title,objectives:m.objectives||[],source:m.source||'world' })), npcGossipPayload:(state.rumors||[]).slice(-5), serviceMenuPayload:{ hearth:state.hearthLocation, visited:state.servicesVisited, economy:state.economy.prices, open:state.servicesOpen||{} }, mapMarkerPayload:[...(state.movementIntents||[]).slice(-8), ...Object.values(state.activeMissions||{}).map(m=>({ missionId:m.id, place:m.place||'market_square', kind:'quest' }))], ambientEventFeedPayload:(state.eventFeed||[]).slice(-MAX.feed), reputationSummaryPayload:state.reputation, scheduleDebugPayload:state.npcSchedules, economySummaryPayload:state.economy, socialConsequencesPayload:(state.socialConsequences||[]).slice(-8), familyTrustPayload:state.familyTrust||{}, economyTransactionsPayload:(state.economyTransactions||[]).slice(-8), villageActivity:state.villageActivity || state.uiPayloads?.villageActivity || null, worldEventDirector:state.uiPayloads?.worldEventDirector || (state.worldEventDirector ? { last:state.worldEventDirector.last || null, recent:(state.worldEventDirector.events||[]).slice(-5), pulse:state.worldEventDirector.pulses || 0, hasLoop:false } : null) }; }
export function commitUiPayloads(state){ state.uiPayloads=uiPayloads(state); return state.uiPayloads; }
export function recordLivingWorldEvent(event={}){ return mutateLivingWorldState(s=>{ addEventFeed(s,event); commitUiPayloads(s); return s; }); }
export function rememberLivingWorld(bucket='world', key='entry', value={}){ return mutateLivingWorldState(s=>{ s[bucket] ||= {}; s[bucket][key]={...(s[bucket][key]||{}),...value,at:now()}; commitUiPayloads(s); return s; }); }
export function appendLivingWorldList(bucket='events', value={}, limit=120){ return mutateLivingWorldState(s=>{ s[bucket]=cap([...(s[bucket]||[]),{...value,at:now()}],limit); commitUiPayloads(s); return s; }); }
export function livingWorldBucket(bucket='world'){ return loadLivingWorldState()[bucket] || {}; }
export function livingWorldEvents(limit=80){ return (loadLivingWorldState().eventFeed||[]).slice(-limit); }
export default { loadLivingWorldState, saveLivingWorldState, mutateLivingWorldState, resetLivingWorldState, recordLivingWorldEvent, rememberLivingWorld, appendLivingWorldList, livingWorldBucket, livingWorldEvents, addMemory, addRumor, addMovementIntent, adjustReputation, uiPayloads, commitUiPayloads, STARTER_NPCS };
