// B"H
/**
 * @file index.js
 * @description Event listener bundle. The userInput URL is cache-busted so the
 * one-gesture tap law and door-first mobile fallback are actually loaded.
 */
import userInput from "./userInput.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import labels from "./labels.js?compact=true&v=npc-runtime-cachebreak-20260616-bh1";
import minimap from "./minimap.js?compact=true&v=npc-runtime-cachebreak-20260616-bh1";
import resizing from "./resizing.js?compact=true&v=npc-runtime-cachebreak-20260616-bh1";
import destroy from "./destroy.js?compact=true&v=npc-runtime-cachebreak-20260616-bh1";
import chossidReactions from "./chossidRaections.js?compact=true&v=npc-runtime-cachebreak-20260616-bh1";
import shlichus from "./shlichus.js?compact=true&v=npc-runtime-cachebreak-20260616-bh1";
import environment from "./environment.js?compact=true&v=crisp-background-budget-20260621-bh1";
import misc from "./misc.js?compact=true&v=npc-runtime-cachebreak-20260616-bh1";
export default function bindAllListeners(){userInput.bind(this)();labels.bind(this)();minimap.bind(this)();resizing.bind(this)();destroy.bind(this)();chossidReactions.bind(this)();shlichus.bind(this)();environment.bind(this)();misc.bind(this)();}
