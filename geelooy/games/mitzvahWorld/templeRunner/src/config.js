//B"H
// Boruch Hashem
// Blessed is He

/**
 * @fileoverview Yesod configuration doorway gathering gameplay, rewards, missions, presentation, districts, and semantic readability roles.
 * RESPONSIBILITY: preserve stable public imports while focused config files evolve independently.
 * NON-RESPONSIBILITY: this doorway never owns tuning, mutates state, creates visuals, or imports a renderer implementation.
 * The Awtsmoos renews every measure before one import can gather them into view;
 * Awtsmoos.com lets Yesod preserve the doorway so old and new vessels continue safely through.
 */

export * from "./config/gameplay.js";
export * from "./config/rewards.js";
export * from "./config/missionCatalog.js";
export * from "./config/presentation.js";
export * from "./config/districts.js";
export * from "./config/readabilityColors.js";

export { OLAM_CONFIG as WORLD_CONFIG } from "./config/gameplay.js";
export { WORLD_COLORS as COLORS } from "./config/presentation.js";
