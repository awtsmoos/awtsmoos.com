/** B"H @module SocialProfileRuntime - offline profile shell, not fake multiplayer. */
import { State } from '../../binah/State.js';

export const ensureSocialProfile = () => {
  State.SocialProfile ||= { name: 'Shliach', title: 'Walker of Hidden Light', badges: [], emotes: ['wave'], public: false };
  State.SocialProfile.badges ||= [];
  State.SocialProfile.emotes ||= ['wave'];
  return State.SocialProfile;
};

export const setProfileName = name => {
  const profile = ensureSocialProfile();
  profile.name = String(name || 'Shliach').slice(0, 40);
  return profile;
};

export const addBadge = id => {
  const profile = ensureSocialProfile();
  if (id && !profile.badges.includes(id)) profile.badges.push(id);
  return profile.badges;
};

export const unlockEmote = id => {
  const profile = ensureSocialProfile();
  if (id && !profile.emotes.includes(id)) profile.emotes.push(id);
  return profile.emotes;
};
