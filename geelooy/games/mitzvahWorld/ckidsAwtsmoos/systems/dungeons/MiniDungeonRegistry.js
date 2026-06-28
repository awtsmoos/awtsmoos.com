// B"H
/**
 * MiniDungeonRegistry
 *
 * Dormant content catalog. It names what exists without forcing the browser
 * runtime to own it. No loop, no boot import, no production claim: only a small
 * registry sealed with evidence, awaiting a future explicit owner if the
 * Awtsmoos opens that gate.
 */
export const MINI_DUNGEON_OWNER = Object.freeze({
  owner: 'dormant-content-contract',
  runtimeOwner: 'intentionally-disabled-no-current-entry-trigger',
  verifiedBy: ['tests/headless/ownerContractAudit.mjs'],
  phoneCritical: false
});

export const MINI_DUNGEONS = Object.freeze([
  Object.freeze({ id:'hidden_courtyard', title:'Hidden Courtyard', minutes:5, boss:'restless_spark', teaches:['interrupt', 'heal', 'avoid'] })
]);

export const getMiniDungeon = id => MINI_DUNGEONS.find(dungeon => dungeon.id === id) || null;

export default { MINI_DUNGEON_OWNER, MINI_DUNGEONS, getMiniDungeon };
