/**
 * B"H
 * Bot personalities.
 *
 * Chapter 41: not every spark wants the same throne. Some hunt weapons, some
 * crave punishment, some flee toward power-ups, and some guard the edge like
 * appointed angels. The same utility table now bends through different souls.
 */
const TYPES = [
  ['duelist', { punish: 1.25, pressure: 1.18, bait: 1.05 }],
  ['aggressor', { pressure: 1.35, approach: 1.2, retreat: 0.7 }],
  ['opportunist', { powerup: 1.25, weapon: 1.2, punish: 1.15 }],
  ['guardian', { edgeguard: 1.4, recover: 1.15, pressure: 0.9 }],
  ['coward', { retreat: 1.45, bait: 1.25, pressure: 0.75 }]
];

export function ensurePersonality(bot) {
  if (bot.ai.personality) return bot.ai.personality;
  const index = Math.abs(hash(bot.id || bot.name || 'bot')) % TYPES.length;
  const [name, weights] = TYPES[index];
  bot.ai.personality = { name, weights };
  return bot.ai.personality;
}

export function weightIntent(bot, intent, score) {
  const personality = ensurePersonality(bot);
  return score * (personality.weights[intent] || 1);
}

function hash(text) {
  let h = 0;
  for (let i = 0; i < text.length; i++) h = ((h << 5) - h + text.charCodeAt(i)) | 0;
  return h;
}
