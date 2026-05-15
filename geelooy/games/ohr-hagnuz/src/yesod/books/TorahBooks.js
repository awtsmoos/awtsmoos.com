/** 
 * B"H
 * @module TorahBooks
 * Collectible sefarim grant knowledge, skill XP, and permanent attack power.
 */
import { State } from '../../binah/State.js';
import { bookByGlyph, bookById } from '../../data/books/BookIndex.js';
import { grantSkillExp } from '../skills/SkillRuntime.js';

export const ensureBookState = () => {
  State.Inventory ||= { garments: [], items: {} };
  State.Inventory.books ||= [];
  State.TorahKnowledge ||= { booksRead: 0, power: 0, stats: { chochmah: 0, binah: 0, daat: 0 } };
  return { inventory: State.Inventory, knowledge: State.TorahKnowledge };
};

export const hasBook = (id) => ensureBookState().inventory.books.includes(id);

export const learnBook = (bookOrGlyph) => {
  const book = typeof bookOrGlyph === 'string' ? (bookByGlyph(bookOrGlyph) || bookById(bookOrGlyph)) : bookOrGlyph;
  if (!book) return false;
  const { inventory, knowledge } = ensureBookState();
  const first = !inventory.books.includes(book.id);
  if (first) {
    inventory.books.push(book.id);
    State.Quests.counters.book = (State.Quests.counters.book || 0) + 1;
  }
  knowledge.booksRead += 1;
  knowledge.power += book.power;
  knowledge.stats[book.stat] = (knowledge.stats[book.stat] || 0) + book.power;
  grantSkillExp(book.skill, first ? book.exp : Math.max(4, Math.floor(book.exp / 4)), book.title);
  State.say(`${book.title}: ${book.text} Torah power +${book.power}.`, 420);
  return true;
};

export const torahPower = () => ensureBookState().knowledge.power || 0;
export const torahStats = () => ensureBookState().knowledge.stats || {};
export const bookLine = () => {
  const { inventory, knowledge } = ensureBookState();
  return `Books ${inventory.books.length} | Torah Power ${knowledge.power}`;
};
