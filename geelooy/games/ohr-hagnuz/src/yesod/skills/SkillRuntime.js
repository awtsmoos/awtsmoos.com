/**
 * B"H
 * @module SkillRuntime
 * @description RuneScape-like skill advancement for learning, giving, debate, memory, song, pilgrimage, agriculture, kindness, observation, prayer, declaration, and restoration.
 *
 * Chapter 306: Effort became a ladder. The Awtsmoos creates the player anew
 * every instant, but the vessel remembers practice: each sefer read, gift
 * given, Musag sweetened, song sung, field tended, and declaration line earned
 * becomes XP in a skill that unlocks the next piece of the world.
 */
import { State } from '../../binah/State.js';

export const SkillIds = ['Learning', 'Debate', 'Giving', 'Memory', 'Song', 'Pilgrimage', 'Agriculture', 'Kindness', 'Observation', 'Prayer', 'Declaration', 'Restoration'];

export const SkillIndex = {
  Learning: { name: 'Learning', unlocks: { 3: 'deeper sefarim', 7: 'Gemara answers', 12: 'House teacher rooms' } },
  Debate: { name: 'Debate', unlocks: { 3: 'enemy intent preview', 8: 'counter-arguments', 15: 'Merchant weakness read' } },
  Giving: { name: 'Giving', unlocks: { 2: 'gift tracker', 6: 'Kohen blessing', 12: 'wrong-order repair' } },
  Memory: { name: 'Memory', unlocks: { 3: 'hidden notes', 9: 'forgotten NPCs', 18: 'Hidden Orchard paths' } },
  Song: { name: 'Song', unlocks: { 2: 'Levi Road', 7: 'Niggun healing', 14: 'noise cancellation' } },
  Pilgrimage: { name: 'Pilgrimage', unlocks: { 3: 'Jerusalem Ascent', 8: 'Court shortcuts', 16: 'Sea of Fire crossing' } },
  Agriculture: { name: 'Agriculture', unlocks: { 2: 'Seven Species care', 8: 'Bikkurim quality', 15: 'flavor restoration' } },
  Kindness: { name: 'Kindness', unlocks: { 2: 'Poor Gate trust', 6: 'joyShared', 13: 'orphan/widow ending lines' } },
  Observation: { name: 'Observation', unlocks: { 3: 'Musag hints', 9: 'hidden object shimmer', 17: 'false merchant offers reveal' } },
  Prayer: { name: 'Prayer', unlocks: { 3: 'light recovery', 10: 'Sea of Fire mercy', 20: 'Ohr realm entry' } },
  Declaration: { name: 'Declaration', unlocks: { 2: 'line preview', 6: 'truth check', 12: 'action-shaped ending' } },
  Restoration: { name: 'Restoration', unlocks: { 3: 'repair mistakes', 9: 'House of Forgetting rooms', 18: 'postgame restoration board' } }
};

const aliases = { chochmah: 'Learning', binah: 'Memory', daat: 'Debate', niggun: 'Song', learning: 'Learning', debate: 'Debate', giving: 'Giving', memory: 'Memory', song: 'Song', pilgrimage: 'Pilgrimage', agriculture: 'Agriculture', kindness: 'Kindness', observation: 'Observation', prayer: 'Prayer', declaration: 'Declaration', restoration: 'Restoration' };

const blank = id => ({ name: SkillIndex[id]?.name || id, level: 1, xp: 0, exp: 0, next: 25, nextExp: 25, unlocks: [] });
const nextCost = level => Math.floor(25 + Math.pow(level, 1.65) * 18);
const canonical = id => aliases[id] || id;

export const ensureSkills = () => {
  State.Skills ||= {};
  for (const id of SkillIds) State.Skills[id] ||= blank(id);
  return State.Skills;
};

export const grantSkillExp = (id, amount, reason = 'practice') => {
  const skills = ensureSkills();
  const key = canonical(id);
  const skill = skills[key] ||= blank(key);
  const gain = Math.max(1, Math.floor(Number(amount) || 1));
  skill.xp = (skill.xp ?? skill.exp ?? 0) + gain;
  skill.exp = skill.xp;
  skill.next = skill.next || skill.nextExp || nextCost(skill.level || 1);
  let leveled = 0;
  while (skill.xp >= skill.next && skill.level < 99) {
    skill.xp -= skill.next; skill.exp = skill.xp; skill.level += 1; leveled += 1;
    skill.next = nextCost(skill.level); skill.nextExp = skill.next;
    addUnlock(skill, key);
  }
  if (leveled) State.say(`${skill.name} reached level ${skill.level}: ${reason}.`, 480);
  return { id: key, ...skill, leveled, gained: gain };
};

const addUnlock = (skill, key) => {
  const text = SkillIndex[key]?.unlocks?.[skill.level];
  if (text && !skill.unlocks.includes(text)) skill.unlocks.push(text);
};

export const grantActionSkill = (action, amount = 5) => {
  const map = { read: 'Learning', debate: 'Debate', give: 'Giving', remember: 'Memory', sing: 'Song', travel: 'Pilgrimage', grow: 'Agriculture', help: 'Kindness', inspect: 'Observation', pray: 'Prayer', declare: 'Declaration', restore: 'Restoration' };
  return grantSkillExp(map[action] || 'Learning', amount, action);
};

export const grantBattleSkills = (move, encounter, win) => {
  grantSkillExp('Debate', 6 + (move?.power || 0) * 0.25, move?.name || 'debate');
  if (move?.category === 'Rambam') grantSkillExp('Declaration', 7, 'Rambam order');
  if (move?.category === 'Niggun' || move?.heal) grantSkillExp('Song', 8, move?.name || 'niggun');
  if (encounter?.name?.includes('Wild Musag')) grantSkillExp('Observation', 7, 'wild Musag seen');
  if (win) { grantSkillExp('Learning', 10, 'victory'); grantSkillExp('Restoration', 8, 'sweetening'); }
};

export const grantGiftSkills = giftId => {
  const byGift = { terumah: ['Giving', 'Learning'], maaser_rishon: ['Song', 'Pilgrimage'], maaser_ani: ['Kindness', 'Giving'], maaser_sheni: ['Pilgrimage', 'Prayer'], bikkurim: ['Agriculture', 'Declaration'] };
  for (const id of byGift[giftId] || ['Restoration']) grantSkillExp(id, 12, `${giftId} restored`);
};

export const skillSummary = () => SkillIds.map(id => {
  const s = ensureSkills()[id];
  return { id, name: s.name || id, level: s.level || 1, xp: s.xp ?? s.exp ?? 0, next: s.next || s.nextExp || 25, unlocks: s.unlocks || [] };
});

export const skillLine = () => skillSummary().sort((a, b) => b.level - a.level).slice(0, 4).map(s => `${s.name} ${s.level}`).join(' | ');
