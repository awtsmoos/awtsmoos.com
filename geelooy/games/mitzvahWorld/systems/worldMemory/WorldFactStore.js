// B"H
/** @file WorldFactStore.js @description Typed helpers over the world fact database. */
import { createWorldFactDatabase } from './WorldFactDatabase.js?compact=true&v=compact-all-visible-npc-never-cull-20260708-bh11';

export function createWorldFactStore(database = createWorldFactDatabase()) {
  function remember(kind, target, data = {}) {
    return database.upsert({ ...data, kind, target, key:data.key || data.id || data.text });
  }
  function facts(kind, target) { return database.query({ kind, target }); }
  function has(kind, target) { return facts(kind, target).length > 0; }
  function score(kind, target, field = 'value') {
    return facts(kind, target).reduce((sum, fact) => sum + Number(fact[field] || 0), 0);
  }
  return { remember, facts, has, score, database, report:database.report };
}
export default createWorldFactStore;
