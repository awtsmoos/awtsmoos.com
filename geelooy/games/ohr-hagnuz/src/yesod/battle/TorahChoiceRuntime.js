/**
 * B"H
 * @module TorahChoiceRuntime
 * @description Drill-down battle choices: category → route → chapter → quote.
 *
 * Chapter 140: The menu became a staircase. The Awtsmoos has no body and no
 * form, yet each answer now descends through vessels until the exact quote is
 * chosen. Only then does the battle strike leave the mouth of the learner.
 */
import { AbilityIndex, BaseAbilityIds } from '../../data/abilities/AbilityIndex.js';
import { quoteMove } from '../abilities/AbilityRuntime.js';

const labels = { category: 'Choose category', route: 'Choose route', chapter: 'Choose chapter', quote: 'Choose quote' };

/** @returns {object} */
export const freshChoice = () => ({ stage: 'category', abilityId: null, routeIndex: 0, chapterIndex: 0 });

/** @param {object} choice @returns {object[]} */
export const battleOptions = choice => {
  if (!choice || choice.stage === 'category') return categoryOptions();
  const ability = AbilityIndex[choice.abilityId] || AbilityIndex.mishnahClarity;
  if (choice.stage === 'route') return ability.routes.map((r, i) => option('route', i, r.title, ability.category, 'Open chapters'));
  const route = ability.routes[choice.routeIndex] || ability.routes[0];
  if (choice.stage === 'chapter') return route.chapters.map((c, i) => option('chapter', i, c.title, route.title, 'Open quotes'));
  const chapter = route.chapters[choice.chapterIndex] || route.chapters[0];
  return chapter.quotes.map((q, i) => ({ ...option('quote', i, q.text, chapter.title, `Power +${q.bonus || 0}`), move: quoteMove(ability, choice.routeIndex, choice.chapterIndex, i) }));
};

/** @returns {object[]} */
const categoryOptions = () => BaseAbilityIds.map((id, i) => {
  const a = AbilityIndex[id];
  return option('category', i, a.category, a.name, 'Select a Torah path', id);
});

/** @returns {object} */
const option = (kind, index, name, routeTitle, routeQuote, abilityId = null) => ({
  kind, index, name, category: kind, routeTitle, routeQuote, abilityId, power: 0, text: routeQuote
});

/** @param {object} choice @param {number} index @returns {{choice:object,move:object|null}} */
export const chooseOption = (choice, index) => {
  const current = choice || freshChoice();
  const picked = battleOptions(current)[index];
  if (!picked) return { choice: current, move: null };
  if (current.stage === 'category') return { choice: { ...freshChoice(), stage: 'route', abilityId: picked.abilityId }, move: null };
  if (current.stage === 'route') return { choice: { ...current, stage: 'chapter', routeIndex: picked.index, chapterIndex: 0 }, move: null };
  if (current.stage === 'chapter') return { choice: { ...current, stage: 'quote', chapterIndex: picked.index }, move: null };
  return { choice: current, move: picked.move };
};

/** @param {object} choice @returns {object} */
export const backChoice = choice => {
  if (!choice || choice.stage === 'category') return freshChoice();
  if (choice.stage === 'route') return freshChoice();
  if (choice.stage === 'chapter') return { ...choice, stage: 'route' };
  return { ...choice, stage: 'chapter' };
};

/** @param {object} choice @returns {string} */
export const choicePrompt = choice => labels[choice?.stage || 'category'];
