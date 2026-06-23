/**
 * B"H
 * @module ForgettingRuntime
 * @description Runtime for House of Forgetting room completion.
 *
 * Chapter 314: The dungeon stopped being a label. Each room now knows the
 * missing relationship it protects, and each clearance writes truth back into
 * the ledger, skills, journal, and final declaration.
 */
import { State } from '../../binah/State.js';
import { allForgettingRooms, forgettingRoomById } from '../../data/rambam/ForgettingRoomIndex.js';
import { declarationCounters } from './OrderValidator.js';
import { refreshDeclaration } from './DeclarationRuntime.js';
import { grantSkillExp } from '../skills/SkillRuntime.js';

export const ensureForgettingState = () => {
  State.Forgetting ||= { cleared: {}, opened: true, lastRoom: null };
  return State.Forgetting;
};

export const roomAvailable = id => {
  const room = forgettingRoomById(id);
  if (!room) return false;
  const counters = declarationCounters(State.Gifts || {});
  return Object.entries(room.requires || {}).every(([key, amount]) => (counters[key] || 0) >= amount);
};

export const clearForgettingRoom = id => {
  const room = forgettingRoomById(id);
  if (!room) return { ok: false, message: 'Unknown forgetting room.' };
  ensureForgettingState();
  if (!roomAvailable(id)) {
    State.say(`${room.name} is locked. Restore the matching gift first.`, 520);
    return { ok: false, message: `${room.name} locked.` };
  }
  State.Forgetting.cleared[id] = true;
  State.Forgetting.lastRoom = id;
  State.Gifts ||= { history: [], declaration: { unlocked: [] } };
  State.Gifts[room.reward] = true;
  State.Gifts.history ||= [];
  State.Gifts.history.unshift(`House cleared: ${room.name}. ${room.line}`);
  State.Inventory.journal.notes.unshift(room.line);
  grantSkillExp(room.skill, 14, room.name);
  grantSkillExp('Restoration', 10, room.name);
  refreshDeclaration();
  State.Story.active = 'House of Forgetting';
  State.Story.act = 5;
  State.Story.region = room.name;
  State.Story.objective = nextForgettingObjective();
  State.Story.nextStep = remainingForgettingRooms().length ? 'Clear the next memory room.' : 'Proceed to the Final Declaration.';
  State.say(`${room.name} cleared. ${room.line}`, 720);
  return { ok: true, room };
};

export const remainingForgettingRooms = () => {
  const state = ensureForgettingState();
  return allForgettingRooms().filter(room => !state.cleared[room.id]);
};

export const houseCleared = () => remainingForgettingRooms().length === 0;
export const nextForgettingObjective = () => {
  const next = remainingForgettingRooms()[0];
  return next ? `Clear ${next.name}: ${next.musag.join(', ')}.` : 'The House of Forgetting is clear. Declare truth.';
};
