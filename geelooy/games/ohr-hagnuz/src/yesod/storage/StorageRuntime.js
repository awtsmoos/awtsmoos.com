/**
 * B"H
 * @module StorageRuntime
 * @description Bank, storage, and vault runtime for counter items, garments, and money.
 *
 * Chapter 404: The bag found a house. The Awtsmoos needs no container, yet the
 * player does: a vault where sparks rest, robes wait, and future collections
 * can become a reason to return after the declaration.
 */
import { State } from '../../binah/State.js';
import { ensureBag } from '../bag/BagRuntime.js';
import { storageDefaults, storageEvent } from './StorageDefaults.js';

const count = amount => Math.max(0, amount | 0);

export const ensureStorage = () => {
  State.Storage ||= storageDefaults();
  State.Storage.items ||= {};
  State.Storage.garments ||= [];
  State.Storage.money ||= 0;
  State.Storage.history ||= [];
  return State.Storage;
};

const remember = (type, id, amount) => {
  const storage = ensureStorage();
  storage.history.unshift(storageEvent(type, id, amount));
  storage.history = storage.history.slice(0, 30);
};

export const depositMoney = amount => {
  const bag = ensureBag();
  const n = Math.min(count(amount), bag.money || 0);
  if (!n) return { ok: false, reason: 'no-money' };
  bag.money -= n;
  ensureStorage().money += n;
  remember('deposit-money', 'zuz', n);
  return { ok: true, amount: n, bag: bag.money, storage: State.Storage.money };
};

export const withdrawMoney = amount => {
  const storage = ensureStorage();
  const n = Math.min(count(amount), storage.money || 0);
  if (!n) return { ok: false, reason: 'no-stored-money' };
  storage.money -= n;
  ensureBag().money += n;
  remember('withdraw-money', 'zuz', n);
  return { ok: true, amount: n, bag: State.Inventory.money, storage: storage.money };
};

export const depositItem = (id, amount = 1) => {
  const bag = ensureBag();
  const n = Math.min(count(amount), bag.items?.[id] || 0);
  if (!id || !n) return { ok: false, reason: 'no-item' };
  bag.items[id] -= n;
  const storage = ensureStorage();
  storage.items[id] = (storage.items[id] || 0) + n;
  remember('deposit-item', id, n);
  return { ok: true, id, amount: n, bag: bag.items[id], storage: storage.items[id] };
};

export const withdrawItem = (id, amount = 1) => {
  const storage = ensureStorage();
  const n = Math.min(count(amount), storage.items?.[id] || 0);
  if (!id || !n) return { ok: false, reason: 'no-stored-item' };
  storage.items[id] -= n;
  ensureBag().items[id] = (State.Inventory.items[id] || 0) + n;
  remember('withdraw-item', id, n);
  return { ok: true, id, amount: n, bag: State.Inventory.items[id], storage: storage.items[id] };
};

export const depositGarment = id => {
  const bag = ensureBag();
  if (!id || State.Equipment?.garment === id) return { ok: false, reason: 'equipped-garment' };
  if (!bag.garments.includes(id)) return { ok: false, reason: 'missing-garment' };
  bag.garments = bag.garments.filter(g => g !== id);
  const storage = ensureStorage();
  if (!storage.garments.includes(id)) storage.garments.push(id);
  remember('deposit-garment', id, 1);
  return { ok: true, id };
};

export const withdrawGarment = id => {
  const storage = ensureStorage();
  if (!id || !storage.garments.includes(id)) return { ok: false, reason: 'no-stored-garment' };
  storage.garments = storage.garments.filter(g => g !== id);
  const bag = ensureBag();
  if (!bag.garments.includes(id)) bag.garments.push(id);
  remember('withdraw-garment', id, 1);
  return { ok: true, id };
};

export const storageRows = () => {
  const storage = ensureStorage();
  const itemRows = Object.entries(storage.items).filter(([, v]) => v > 0).map(([id, v]) => [id, v]);
  return [['Stored Zuzim', storage.money], ['Stored garments', storage.garments.length], ...itemRows];
};
