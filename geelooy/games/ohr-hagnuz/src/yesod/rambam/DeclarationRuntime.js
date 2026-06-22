/**
 * B"H
 * @module DeclarationRuntime
 * @description Unlocks final declaration lines from the gift ledger.
 */
import { State } from '../../binah/State.js';
import { DeclarationLines } from '../../data/rambam/DeclarationIndex.js';
import { declarationCounters } from './OrderValidator.js';

const ledger = () => {
  State.Gifts ||= { inventory: {}, given: {}, blessingRemembered: false, joyShared: false, declaration: { unlocked: [], total: DeclarationLines.length }, history: [] };
  State.Gifts.inventory ||= {};
  State.Gifts.given ||= {};
  State.Gifts.history ||= [];
  return State.Gifts;
};

export const refreshDeclaration = () => {
  const gifts = ledger();
  const counters = declarationCounters(gifts);
  const unlocked = DeclarationLines.filter(line => line.requires.every(key => counters[key] > 0));
  gifts.declaration = { unlocked: unlocked.map(line => line.id), total: DeclarationLines.length };
  return { unlocked, locked: DeclarationLines.filter(line => !unlocked.includes(line)) };
};

export const declarationRows = () => {
  const status = refreshDeclaration();
  return DeclarationLines.map(line => [status.unlocked.includes(line) ? '✓' : '•', line.text]);
};
