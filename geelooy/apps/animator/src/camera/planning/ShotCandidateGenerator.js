// B"H
import { DialogueShotPlanner } from './DialogueShotPlanner.js';
import { ObjectShotPlanner } from './ObjectShotPlanner.js';
import { ActionShotPlanner } from './ActionShotPlanner.js';
import { EmotionShotPlanner } from './EmotionShotPlanner.js';
import { GroupShotPlanner } from './GroupShotPlanner.js';
import { RevealShotPlanner } from './RevealShotPlanner.js';
import { ComedyShotPlanner } from './ComedyShotPlanner.js';

export class ShotCandidateGenerator {
  static generate(intent, targets = [], event = {}) {
    if (event.shotType) return [event.shotType];
    if (/dialogue/i.test(intent)) return DialogueShotPlanner.candidates(targets, event);
    if (/food|object|insert/i.test(intent)) return ObjectShotPlanner.candidates(targets, event);
    if (/reaction|emotion/i.test(intent)) return EmotionShotPlanner.candidates(event);
    if (/reveal/i.test(intent)) return RevealShotPlanner.candidates();
    if (/comedy/i.test(intent)) return ComedyShotPlanner.candidates();
    if (/action|walk|track/i.test(intent)) return ActionShotPlanner.candidates(targets, event);
    return GroupShotPlanner.candidates(targets, event);
  }
}
