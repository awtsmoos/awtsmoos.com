/** B"H * @module SkillDefaults */
import { SkillIds } from '../../data/skills/SkillIndex.js';

export const makeSkill = () => ({ level: 1, exp: 0, nextExp: 25 });

export const baseSkills = () => {
  const skills = {};
  for (const id of SkillIds) skills[id] = makeSkill();
  return skills;
};
