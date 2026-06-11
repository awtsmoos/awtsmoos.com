import { executeIntent } from './brain/execute.js';
import { prepareMemory } from './brain/memory.js';
import { senseWorld } from './brain/sense.js';
import { chooseIntent } from './brain/utility.js';
import { chooseTarget } from './brain/threats.js';

/**
 * B"H
 * Modular bot brain entry.
 *
 * Chapter 37: the bot no longer lunges at the nearest shadow by default. It
 * chooses the most meaningful threat, predicts motion, avoids body knots, and
 * then lets smaller organs translate the desire into real inputs.
 */
export function driveBots(state) {
  for (let i = 0; i < state.fighters.length; i++) {
    const bot = state.fighters[i];
    if (bot.human || bot.dead) continue;
    prepareMemory(bot);
    const target = chooseTarget(bot, state.fighters);
    if (!target) continue;
    const world = senseWorld(bot, target, state);
    const intent = chooseIntent(bot, world);
    bot.input = executeIntent(bot, world, intent);
  }
}
