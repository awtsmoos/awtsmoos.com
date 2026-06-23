// B"H
/**
 * @file LivingStoryPolicy.js
 * Story must feel alive without scanning the universe each frame: memories,
 * rumors, mitzvah chains, weather consequences, and village needs awaken by event.
 */
export function livingStoryPolicy(budget = globalThis.__MITZVAH_WORLD_PERFORMANCE_BUDGET__) {
  const tier = budget?.tier || 'high';
  return {
    tier,
    law: 'event-driven-story-no-per-frame-quest-spam',
    maxActiveThreads: tier === 'survival' ? 3 : tier === 'balanced' ? 6 : 10,
    threadFamilies: ['mitzvah-chain','village-need','lost-animal','weather-consequence','teaching-moment','traveler-rumor','relationship-memory','repair-and-growth'],
    memoryTypes: ['met-npc','helped-family','saved-animal','learned-teaching','repaired-place','heard-rumor','weather-survived','village-reputation'],
    beats: ['seed','hint','choice','consequence','memory','reward','rumor-spread','world-change'],
    persistence: 'compact-facts-not-heavy-transcripts',
    updateMode: 'on-event-plus-low-frequency-summary'
  };
}
export default livingStoryPolicy;
