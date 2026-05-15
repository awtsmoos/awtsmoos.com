/**
 * B"H
 * @module SkillRuntime
 * RuneScape-style advancement for single-player Torah exploration.
 */
import { State } from '../../binah/State.js';
import { SkillIndex, SkillIds } from '../../data/skills/SkillIndex.js';
import { baseSkills } from './SkillDefaults.js';

export const ensureSkills = () => {
  if (!State.Skills || ! Object.keys(State.Skills).length) State.Skills = baseSkills();
  for (const id of SkillIds) {
    State.Skills[id] ||= { level: 1, exp: 0, nextExp: 25 };
  }
  return State.Skills;
};

const formulaNext = (level, oldNext) => Math.floor(Math.max((oldNext || 25) * 1.33, 25 + level * 12));

export const grantSkillExp = (id, amount, reason = 'experience') => {
  const skills = ensureSkills();
  const skill = skills[id];
  if (!skill) return false;
  skill.exp += Math.max(1, Math.floor(amount));
  let leveled = 0;
  while (skill.exp >= skill.nextExp) {
    skill.exp -= skill.nextExp;
    skill.level += 1;
    skill.nextExp = formulaNext(skill.level, skill.nextExp);
    leveled += 1;
  }
  if (leveled) State.say(`${SkillIndex[id]?.name || id} level up! +${skill.level} from ${reason}`, 420);
  return { ...skill, leveled };
};

export const grantBattleSkills = (move, encounter, win) => {
  grantSkillExp('chochmah', 7 + (move?.power || 0) * 0.25, move?.name || 'debate');
  if (move?.heal) grantSkillExp('niggun', 8 + move.heal * 0.5, move.name);
  if (encounter?.name?.includes('Wild Musag')) grantSkillExp('learning', 9, 'wild musag');
  if (win) {
    grantSkillExp('daat', 12, 'victory');
    grantSkillExp('learning', 10, 'victory');
  }
};

export const skillSummary = () => {
  const skills = ensureSkills();
  return SkillIds.map(id => {
    const s = skills[id];
    return { id, name: SkillIndex[id].name, level: s.level, exp: s.exp, nextExp: s.nextExp };
  });
};

export const skillLine = () => skillSummary().slice(0, 4).map(s => `${s.name} ${s.level}`).join(' | ');
