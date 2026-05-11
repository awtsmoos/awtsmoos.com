
/**
 * B"H
 * @module InitializationHub
 * @chapter The Gatherer of the Sparks
 * @description
 * Just as all speech is rooted in the single, indivisible Will of the Awtsmoos,
 * this hub unites the disparate modules of initialization into a single point 
 * of reference for the application.
 * 
 * It exports the Boot Sequence, the Tab Forgery, and the Auto-Inline Awakener, 
 * perfectly compartmentalizing the Seder Histalshelus of the application load.
 */

// B"H - Exporting the absolute origin of the manifestation process
export { bootApplication } from "./initialization/boot.js";

// B"H - Exporting the Tab creation rituals
export { setupTabs } from "./initialization/tabs.js";

// B"H - Exporting the Oracle reader for automatic marginal manifestation
export { awakenInlineSparks } from "./initialization/autoInline.js";

console.log(`%c B"H - [Initialization Hub] All origin conduits are aligned and ready to manifest.`, "color: #ff00ff; font-weight: bold;");
