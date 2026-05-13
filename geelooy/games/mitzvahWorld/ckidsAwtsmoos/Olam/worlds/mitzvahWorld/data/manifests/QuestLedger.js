/**
 * B"H
 * ════════════════════════════════════════════════════════════════════════
 *   THE LEDGER OF SHLICHUS — QuestLedger.js
 *   ──────────────────────────────────────────
 *   Point 9 of the 32 Emanations.
 *   The mission-tracking manifest for spiritual growth.
 * ════════════════════════════════════════════════════════════════════════
 */

export const QUEST_LEDGER = {
  first_steps: {
    title: "First Steps in the Village",
    description: "Connect with the community and find your place.",
    steps: [
      {
        id: 'greet_npc',
        type: 'dialogue',
        target: 'welcome_chossid',
        status: 'PENDING'
      },
      {
        id: 'enter_sanctuary',
        type: 'trigger',
        target: 'beis_ha_knesses_interior',
        status: 'LOCKED'
      }
    ],
    rewards: {
      spiritualExperience: 100,
      items: ['siddur_basic']
    }
  }
};
