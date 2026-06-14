/** B"H — Hero torso aggregator: neck, chest, shoulders, belt, rim. */
import { drawChestPlate } from './ChestPlate.js';
import { drawWaistBelt } from './WaistBelt.js';
import { drawShoulderCaps } from './ShoulderCaps.js';
import { drawRimHighlights } from './RimHighlights.js';
export function drawHeroTorso(ctx, p, mat) {
  drawChestPlate(ctx, p, mat);
  drawShoulderCaps(ctx, p, mat);
  drawWaistBelt(ctx, p, mat);
  drawRimHighlights(ctx, p, mat);
}
