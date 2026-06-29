// B"H
/**
 * @file index.js
 * @description
 * Event listener bundle imports the fresh door/world-state combat input bridge.
 * Chapter: the old listener URL carried a poisoned browser module record, so
 * every listener now receives a new seal and the road stops boxing itself.
 */
import userInput from "./userInput.js?v=starter-contracts-20260628-bh9";
import labels from "./labels.js?v=npc-runtime-cachebreak-20260616-bh1";
import minimap from "./minimap.js?v=npc-runtime-cachebreak-20260616-bh1";
import resizing from "./resizing.js?v=npc-runtime-cachebreak-20260616-bh1";
import destroy from "./destroy.js?v=npc-runtime-cachebreak-20260616-bh1";
import chossidReactions from "./chossidRaections.js?v=npc-runtime-cachebreak-20260616-bh1";
import shlichus from "./shlichus.js?v=npc-runtime-cachebreak-20260616-bh1";
import environment from "./environment.js?v=crisp-background-budget-20260621-bh1";
import misc from "./misc.js?v=npc-runtime-cachebreak-20260616-bh1";

export default function bindAllListeners() {
  userInput.bind(this)();
  labels.bind(this)();
  minimap.bind(this)();
  resizing.bind(this)();
  destroy.bind(this)();
  chossidReactions.bind(this)();
  shlichus.bind(this)();
  environment.bind(this)();
  misc.bind(this)();
}
