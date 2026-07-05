// B"H
/** BattleContext.js — tiny village-context and install-state helpers. */
export const INSTALLED_KEY = "__awtsmoosVillageCombatInstalled";
export function baseInfo(context) { return context?.olam?.baseInfo || {}; }
export function isVillageContext(context = {}) {
  const info = context.worldData || baseInfo(context);
  const id = String(info.id || info.shaym || context.source || "");
  return !id || /village\.json|village/i.test(id);
}
export function ensureArray(value) { return Array.isArray(value) ? value : []; }
