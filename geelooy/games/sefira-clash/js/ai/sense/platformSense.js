import { platformBrain } from '../brain/platformBrain.js';

/**
 * B"H
 * Platform sense adapter.
 *
 * Chapter 191: old brain and new brain share one map-reading chamber. The bot
 * knows current stone, target stone, next stone, and action: fight, jump, drop,
 * or cross.
 */
export function platformSense(bot, target, map) {
  return platformBrain(bot, target, map.platforms || []);
}
