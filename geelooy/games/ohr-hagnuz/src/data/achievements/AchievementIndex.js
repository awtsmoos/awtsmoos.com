/**
 * B"H
 * @module AchievementIndex
 * @description Data-driven retention milestones for Ohr HaGnuz.
 */
export const AchievementIndex = {
  first_save: { title: 'Memory Vessel', desc: 'Persist the journey once.', points: 5 },
  first_storage: { title: 'Vault Opened', desc: 'Place value into storage.', points: 10 },
  first_instance: { title: 'Named Spark', desc: 'Own a unique item instance.', points: 10 },
  musag_bronze: { title: 'Musag Witness', desc: 'Reveal at least one Musag.', points: 10 },
  quest_first: { title: 'First Shlichus', desc: 'Complete one quest.', points: 10 },
  ten_debates: { title: 'Debate Flame', desc: 'Win ten debates.', points: 20 },
  declaration: { title: 'Final Declaration', desc: 'Reveal Ohr HaGnuz.', points: 50 }
};

export const allAchievements = () => Object.entries(AchievementIndex).map(([id, achievement]) => ({ id, ...achievement }));
