// B"H
import { FoodActionPresets } from './FoodActionPresets.js';

/** Turns story verbs into concrete timeline events. */
export class InteractionCompiler {
  static compile(beat = {}) {
    const action = beat.foodAction;
    if (!action) return [];
    if (action.verb === 'hop') return [FoodActionPresets.hop(action.id, action.from, action.to, beat.start, beat.end)];
    if (action.verb === 'roll') return [FoodActionPresets.roll(action.id, action.from, action.to, beat.start, beat.end)];
    if (action.verb === 'bite') return [FoodActionPresets.bite(action.actor, action.food, beat.start, beat.end), FoodActionPresets.sparkle('bite_sparkles', action.at || { x: -40, y: 70 }, beat.start, beat.end)];
    return [];
  }
}
