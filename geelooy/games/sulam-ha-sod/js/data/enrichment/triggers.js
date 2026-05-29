// B"H
import { G } from '../levelPrimitives.js';
import { jumpSpikeTriggerData, fallingIronTriggerData } from './builders.js';
import { safeTriggerX } from './geometry.js';

/**
 * Trigger scroll of hidden consequences.
 *
 * The Awtsmoos lets a jump itself become a question. These triggers add ceiling
 * teeth and falling decrees, but spacing is guarded so the chamber speaks in
 * readable sentences rather than noise.
 */
export function addReactiveTriggers(level, index, frame) {
  const { anchor, far, skyY } = frame;
  const first = safeTriggerX(level, 500 + index * 7);
  if (first !== null) level.triggers.push(G(...triggerArgs(jumpSpikeTriggerData(first, 236, index))));
  const second = safeTriggerX(level, anchor + 260);
  if (second !== null) level.triggers.push(G(...triggerArgs(jumpSpikeTriggerData(second, skyY + 116, index + 7))));
  const iron = safeTriggerX(level, far + 80);
  if (iron !== null) level.triggers.push(G(...triggerArgs(fallingIronTriggerData(iron, skyY))));
}

/** @param {object} data trigger data @returns {Array} primitive args */
function triggerArgs(data) {
  const { x, y, w, h, message, ...extra } = data;
  return [x, y, w, h, message, extra];
}

/** @param {object} level mutable clone */
export function addWisdom(level) {
  level.wisdom = [
    ...(level.wisdom || []),
    'Every upper route has a real ascent; impossible sky is forbidden.',
    'Some jumps wake spikes you could not see until the ceiling answered.',
    'Spike balls may roll, orbit, vanish, and return in readable cycles.'
  ];
}
