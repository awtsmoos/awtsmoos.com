// B"H
/** AmbientConversationRuntime: NPCs speak from shortages, rumors, family trust, and time without a player prompt. */
function npcName(store,id){ return (store.npcs||[]).find(n=>n.id===id)?.name || id; }
export function composeAmbientConversation(store={}, a='miriam_baker', b='tova_child'){ const bread=Number(store.economy?.bread||0), rumors=store.rumors||[], trust=Number(store.familyTrust?.[b]||0); let line=bread<2?'Bread is short; we must help each other.':rumors.length?'I heard a rumor near the market.':'The village feels quiet today.'; if(trust>0) line='Your kindness is remembered in this family.'; const row={ type:'ambient-conversation', speakers:[a,b], text:`${npcName(store,a)} says: ${line}`, at:Date.now() }; store.ambientConversations=[...(store.ambientConversations||[]),row].slice(-40); store.eventFeed=[...(store.eventFeed||[]),row].slice(-80); return row; }
export function createAmbientConversationRuntime(store={}){ return { speak:(a,b)=>composeAmbientConversation(store,a,b), rows:()=>store.ambientConversations||[] }; }
export default { composeAmbientConversation, createAmbientConversationRuntime };
