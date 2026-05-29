// B"H
import { C, T, F } from '../levelPrimitives.js';

/**
 * Anti-autopilot reward scroll.
 *
 * The Awtsmoos adds one more deliberate hesitation to every chamber: a reward
 * above the bridge, a false reward still higher, and a surface that punishes
 * holding one direction forever. The coins hover clear of every guaranteed
 * ladder stone, so deception never becomes broken collision.
 */
export function addAntiAutopilotLayer(level, index, frame) {
  const { anchor, skyY: y } = frame;
  level.trickPlatforms.push(T(anchor - 235, y + 52, 88, 16, index % 2 ? 'antiJump' : 'antiSpeed'));
  level.coins.push(C(anchor - 205, y - 70, index > 20 ? 'sela' : 'dinar'));
  level.fakeCoins.push(F(anchor - 96, y - 110, index % 2 ? 'sela' : 'dinar', 'The reverse-side reward was a mask of teeth.'));
  level.lore = [
    ...(level.lore || []),
    `Enrichment ${index + 1}: the upper route now punishes holding one direction forever.`
  ];
}
