// B"H
/**
 * @file InteractiveNpcOptions.js
 * @description
 * Constructor option purification. The Awtsmoos separates raw user intention
 * from the clean values required to birth an interactive villager.
 */
import { GUIDE_MODEL, numberOr } from "./InteractiveNpcConstants.js?v=npc-split-20260628-bh1";
import { guideCarrierGolem } from "./InteractiveNpcGeometry.js?v=npc-split-20260628-bh1";

export function cleanInteractiveNpcOptions(options = {}) {
  const realModelRequested = options.useRealNpcModel === true;
  const proximity = numberOr(options.proximity, 18);
  const talkDistance = numberOr(options.talkDistance, proximity);

  return {
    ...options,
    dialogue: null,
    dialogues: null,
    messageTree: null,
    proximity,
    talkDistance,
    interactable: true,
    heesHawveh: true,
    visualHeight: numberOr(options.visualHeight, 1.8),
    height: numberOr(options.height, 1.8),
    radius: numberOr(options.radius, 0.52),
    path: realModelRequested ? (options.path || GUIDE_MODEL) : null,
    golem: realModelRequested ? options.golem : guideCarrierGolem(),
    chaweeyoosMap: options.chaweeyoosMap || {
      idle: "stand",
      run: "walk",
      walk: "walk",
      stand: "stand"
    }
  };
}
