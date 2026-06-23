/**
 * B"H
 * @module DeclarationRuntime
 * @description Truth-checking and action-generated Vidui Maaser declaration.
 *
 * Chapter 308: The ending refused to be canned. The Awtsmoos creates every
 * instant from nothing, and the final words now arise from what the player
 * actually restored: gifts, joy, mistakes repaired, Musagim sweetened, skills
 * trained, and memories written into the journal.
 */
import { State } from '../../binah/State.js';
import { DeclarationLines } from '../../data/rambam/DeclarationIndex.js';
import { declarationCounters } from './OrderValidator.js';

const giftNames = { terumah: 'Terumah', maaser_rishon: 'Maaser Rishon', maaser_ani: 'Maaser Ani', maaser_sheni: 'Maaser Sheni', bikkurim: 'Bikkurim' };
const giftIds = Object.keys(giftNames);
const houseRoomIds = ['blessings', 'teachers', 'students', 'gifts', 'joy', 'flavor'];

const ledger = () => {
  State.Gifts ||= { inventory: {}, given: {}, history: [], mistakes: [], declaration: { unlocked: [], total: DeclarationLines.length, blockedBy: [] } };
  State.Gifts.inventory ||= {};
  State.Gifts.given ||= {};
  State.Gifts.history ||= [];
  State.Gifts.mistakes ||= [];
  State.Gifts.declaration ||= { unlocked: [], total: DeclarationLines.length, blockedBy: [] };
  return State.Gifts;
};

export const refreshDeclaration = () => {
  const gifts = ledger();
  const counters = declarationCounters(gifts);
  const unlocked = DeclarationLines.filter(line => line.requires.every(key => counters[key] > 0));
  const missingGifts = giftIds.filter(id => !(gifts.given[id] > 0));
  gifts.declaration = {
    unlocked: unlocked.map(line => line.id),
    total: DeclarationLines.length,
    blockedBy: missingGifts.map(id => giftNames[id]),
    ready: missingGifts.length === 0 && unlocked.length === DeclarationLines.length && houseRoomIds.every(id => State.Forgetting?.cleared?.[id])
  };
  return { unlocked, locked: DeclarationLines.filter(line => !unlocked.includes(line)), missingGifts };
};

export const declarationRows = () => {
  const status = refreshDeclaration();
  return DeclarationLines.map(line => [status.unlocked.includes(line) ? '✓' : '•', line.text]);
};

export const declarationTruthReport = () => {
  const status = refreshDeclaration();
  const houseMissing = houseRoomIds.filter(id => !State.Forgetting?.cleared?.[id]);
  const dex = State.MusagDex || {};
  const skills = Object.values(State.Skills || {});
  const topSkill = skills.sort((a, b) => (b.level || 1) - (a.level || 1))[0];
  return {
    ready: status.missingGifts.length === 0 && status.locked.length === 0 && houseMissing.length === 0,
    missingGifts: status.missingGifts,
    lockedLines: status.locked.map(line => line.text),
    houseMissing,
    giftsRestored: giftIds.length - status.missingGifts.length,
    mistakes: ledger().mistakes.length,
    joyShared: !!ledger().joyShared,
    blessingRemembered: !!ledger().blessingRemembered,
    musagSeen: dex.seenCount || Object.keys(dex.found || {}).length || 0,
    musagSweetened: dex.sweetenedCount || Object.values(dex.found || {}).reduce((n, e) => n + (e.sweetened || 0), 0),
    topSkill: topSkill ? `${topSkill.name || 'Skill'} ${topSkill.level || 1}` : 'Learning 1',
    journalNotes: State.Inventory?.journal?.notes?.length || 0
  };
};

export const generatedDeclarationText = () => {
  const report = declarationTruthReport();
  const history = ledger().history.slice(0, 5).reverse();
  const lines = [
    'B"H. I did not treat the world as loot.',
    `I restored ${report.giftsRestored}/5 entrusted gifts to their rightful receivers.`,
    report.joyShared ? 'I caused joy to reach the poor gate.' : 'Joy still asks to be shared more completely.',
    report.blessingRemembered ? 'I remembered the first blessing.' : 'The first blessing still trembles at the edge of memory.',
    `I sweetened ${report.musagSweetened} Musag moments and trained ${report.topSkill}.`,
    report.mistakes ? `I made ${report.mistakes} mistaken attempts, and the record itself became teshuvah.` : 'I did not force the order of gifts.',
    ...history.map(item => `Witness: ${item}`),
    report.ready ? 'Therefore the hidden light may be spoken into the vessel.' : `Therefore the declaration waits: ${[...report.missingGifts, ...report.lockedLines, ...report.houseMissing.map(id => `House room: ${id}`)].join(' / ')}.`
  ];
  return lines;
};
