/**
 * B"H
 * @module BagRuntime
 * @description Player bag, money, consumables, garments, and journal entries.
 *
 * Chapter 197: The inventory became a small traveling Mishkan. The Awtsmoos has
 * no body and no form, yet the player needs vessels: money for trade, tea for
 * healing, ink for memory, garments for identity, and the Journal folded inside
 * the Bag so mission tracking feels like a thing the character carries.
 */
import { State } from '../../binah/State.js';
import { questSummary } from '../OhrQuest.js';

const defaultItems = () => ({ spark: 0, scroll: 0, chest: 0, key: 0, book: 0, mitzvah: 0, tea: 0, ink: 0, balm: 0 });

export const ensureBag = () => {
  State.Inventory ||= { garments: [], books: [], items: {} };
  State.Inventory.items = { ...defaultItems(), ...(State.Inventory.items || {}) };
  State.Inventory.garments ||= ['WHITE_LINEN'];
  State.Inventory.books ||= [];
  State.Inventory.money ||= 0;
  State.Inventory.journal ||= { opened: true, notes: [] };
  return State.Inventory;
};

export const addMoney = amount => {
  const bag = ensureBag();
  bag.money += Math.max(0, amount | 0);
  return bag.money;
};

export const addItem = (id, amount = 1) => {
  const bag = ensureBag();
  bag.items[id] = (bag.items[id] || 0) + Math.max(0, amount | 0);
  return bag.items[id];
};

export const addJournalNote = text => {
  const bag = ensureBag();
  if (text && !bag.journal.notes.includes(text)) bag.journal.notes.unshift(text);
  bag.journal.notes = bag.journal.notes.slice(0, 20);
  return bag.journal.notes;
};

export const itemLabel = id => ({
  spark: 'Hidden Sparks', scroll: 'Parchments', chest: 'Opened Chests', key: 'Keys', book: 'Books Read', mitzvah: 'Mitzvos',
  tea: 'Warm Tea', ink: 'Scribe Ink', balm: 'Healing Balm'
}[id] || id);

export const bagRows = () => {
  const bag = ensureBag();
  const items = Object.entries(bag.items).filter(([, v]) => v > 0).map(([k, v]) => [itemLabel(k), v]);
  return [['Zuzim', bag.money], ['Equipped garment', State.Equipment?.garment || 'WHITE_LINEN'], ['Clothes owned', bag.garments.length], ...items];
};

export const clothesRows = () => ensureBag().garments.map((id, i) => [`Cloth ${i + 1}`, id.replace(/_/g, ' ')]);

export const journalRows = () => {
  const qs = questSummary();
  const active = qs.active.length ? qs.active.map(q => [q.title, q.status]) : [['Next mission', qs.next]];
  const notes = ensureBag().journal.notes.slice(0, 4).map((note, i) => [`Note ${i + 1}`, note]);
  return [...active, ['Completed missions', qs.completed.length], ...notes];
};

export const rewardLine = reward => {
  const parts = [];
  if (reward.zuzim) parts.push(`${reward.zuzim} zuz`);
  if (reward.sparks) parts.push(`${reward.sparks} sparks`);
  if (reward.exp) parts.push(`${reward.exp} exp`);
  Object.entries(reward.items || {}).forEach(([id, amount]) => parts.push(`${amount} ${itemLabel(id)}`));
  if (reward.garment) parts.push(`garment ${reward.garment}`);
  return parts.join(' • ');
};
