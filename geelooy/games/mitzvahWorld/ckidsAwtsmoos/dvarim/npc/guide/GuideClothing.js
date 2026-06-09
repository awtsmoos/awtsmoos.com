// B"H
/** @file GuideClothing.js @description Chapter 430: Clothing descriptors for the central guide. */
import { GUIDE_HUMAN_MANIFEST } from './GuideHumanManifest.js';
export function guideClothingPayload() {
  const c = GUIDE_HUMAN_MANIFEST.clothing;
  return [{ meshName: ['shirt', 'robe'], color: c.robe }, { meshName: ['vest', 'outer-shirt'], color: c.vest }, { meshName: ['belt'], color: c.belt }];
}
