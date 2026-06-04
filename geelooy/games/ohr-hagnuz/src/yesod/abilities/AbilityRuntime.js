/**
 * B"H
 * @module AbilityRuntime
 * @description Ability unlocks, summaries, and quote-move construction.
 *
 * Chapter 139: The route tree learned to become a weapon. The Awtsmoos has no
 * body and no form, yet finite battle needs a final quote object with power,
 * heal, category, route, chapter, and text. This module flattens the nested
 * Torah tree only when the player reaches the quote.
 */
import { State } from '../../binah/State.js';
import { AbilityIndex, BaseAbilityIds } from '../../data/abilities/AbilityIndex.js';
import { hasGarment } from '../equipment/EquipmentRuntime.js';

/** @param {object} ability @returns {boolean} */
export const isAbilityUnlocked = ability => {
  if (!ability) return false;
  if (ability.unlockLevel && State.Stats.level < ability.unlockLevel) return false;
  if (ability.unlockQuest && !State.Quests.completed[ability.unlockQuest]) return false;
  if (ability.unlockGarment && !hasGarment(ability.unlockGarment)) return false;
  return true;
};

export const abilityList = () => BaseAbilityIds.map(id => AbilityIndex[id]).filter(isAbilityUnlocked);
export const currentMoves = () => abilityList().map(ability => quoteMove(ability, 0, 0, 0));
export const abilitySummary = () => abilityList().map(ability => ability.name);

/** @param {object} ability @param {number} ri @param {number} ci @param {number} qi @returns {object} */
export const quoteMove = (ability, ri = 0, ci = 0, qi = 0) => {
  const route = ability.routes[Math.min(ri, ability.routes.length - 1)];
  const chapter = route.chapters[Math.min(ci, route.chapters.length - 1)];
  const quote = chapter.quotes[Math.min(qi, chapter.quotes.length - 1)];
  return {
    id: ability.id,
    name: ability.name,
    category: ability.category,
    routeTitle: route.title,
    chapterTitle: chapter.title,
    routeQuote: quote.text,
    text: `${ability.text} ${quote.text}`,
    power: (ability.power || 0) + (quote.bonus || 0),
    heal: ability.heal || 0,
    scale: ability.scale || 'chochmah',
    path: { abilityId: ability.id, routeIndex: ri, chapterIndex: ci, quoteIndex: qi }
  };
};

/** @returns {string[]} */
export const routeSummary = () => abilityList().map(ability => {
  const learned = State.LearnedRoutes?.[ability.name] || 1;
  const route = ability.routes[Math.min(learned - 1, ability.routes.length - 1)];
  return `${ability.category}: ${route.title}`;
});

/** @param {object} move @param {boolean} won @returns {string|null} */
export const learnRouteFromMove = (move, won = false) => {
  if (!won || !move?.name) return null;
  State.LearnedRoutes ||= {};
  const ability = AbilityIndex[move.id];
  if (!ability) return null;
  const known = State.LearnedRoutes[move.name] || 1;
  if (known >= ability.routes.length) return null;
  State.LearnedRoutes[move.name] = known + 1;
  return `${move.name} learned route: ${ability.routes[known].title}`;
};
