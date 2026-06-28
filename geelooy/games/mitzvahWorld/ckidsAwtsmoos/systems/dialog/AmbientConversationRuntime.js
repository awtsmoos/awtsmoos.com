// B"H
/**
 * AmbientConversationRuntime
 *
 * A library-only conversation vessel: it has no import-side loop, no DOM owner,
 * and no claim to be current browser dialogue gameplay. The Awtsmoos lets even
 * a quiet sentence exist with truth: smoke simulations may call it, but the
 * LivingWorldRuntime remains the owner of live presentation pulses.
 */
export const AMBIENT_CONVERSATION_OWNER = Object.freeze({
  owner: 'library-only-smoke-owned',
  runtimeOwner: 'none-current-browser-path',
  verifiedBy: ['tests/smoke/ambientConversationSmoke.js', 'tests/headless/ownerContractAudit.mjs'],
  phoneCritical: false
});

function npcName(store, id) {
  return (store.npcs || []).find(npc => npc.id === id)?.name || id;
}

function appendCapped(store, key, row, limit) {
  store[key] = [...(store[key] || []), row].slice(-limit);
  return store[key];
}

export function composeAmbientConversation(store = {}, a = 'miriam_baker', b = 'tova_child') {
  const bread = Number(store.economy?.bread || 0);
  const rumors = store.rumors || [];
  const trust = Number(store.familyTrust?.[b] || 0);
  let line = bread < 2 ? 'Bread is short; we must help each other.' : 'The village feels quiet today.';
  if (rumors.length) line = 'I heard a rumor near the market.';
  if (trust > 0) line = 'Your kindness is remembered in this family.';
  const row = { type:'ambient-conversation', speakers:[a, b], text:`${npcName(store, a)} says: ${line}`, at:Date.now() };
  appendCapped(store, 'ambientConversations', row, 40);
  appendCapped(store, 'eventFeed', row, 80);
  return row;
}

export function createAmbientConversationRuntime(store = {}) {
  return { owner:AMBIENT_CONVERSATION_OWNER, speak:(a, b) => composeAmbientConversation(store, a, b), rows:() => store.ambientConversations || [] };
}

export default { AMBIENT_CONVERSATION_OWNER, composeAmbientConversation, createAmbientConversationRuntime };
