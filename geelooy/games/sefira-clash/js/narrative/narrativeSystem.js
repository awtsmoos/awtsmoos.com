import { stepStageStory } from '../stage/narrative/stageStoryEvents.js';

/**
 * B"H
 * Match narrative system.
 *
 * Chapter 172: the old whisper becomes a bard. It no longer merely marks danger
 * and crowding; it reads the event stream of the frame and lets the battlefield
 * announce relics, hazards, revenge, heavy hits, objectives, danger, and places
 * where the war has become hot.
 */
export function stepNarrative(state) {
  stepStageStory(state);
}
