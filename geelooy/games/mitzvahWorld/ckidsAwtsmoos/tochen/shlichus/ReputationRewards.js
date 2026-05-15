/**
 * B\"H
 * @file ReputationRewards.js
 * @description
 * Faction reputation thresholds and shlichus unlocks.
 */

export const REPUTATION_REWARDS = {
  emeraldVillage: [
    { reputation: 50, unlocks: ["guest_house"] },
    { reputation: 150, unlocks: ["baker_shlichus"] },
    { reputation: 300, unlocks: ["emerald_guardian"] }
  ],
  scholars: [
    { reputation: 75, unlocks: ["tehillim_pulse"] },
    { reputation: 200, unlocks: ["paths_of_binah"] }
  ]
};
