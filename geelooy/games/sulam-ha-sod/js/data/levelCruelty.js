// B"H
import { enrichmentFrame } from './enrichment/geometry.js';
import { addGuaranteedAscent } from './enrichment/ascent.js';
import { addSkyVault } from './enrichment/vault.js';
import { addHarderHazards } from './enrichment/hazards.js';
import { addReactiveTriggers, addWisdom } from './enrichment/triggers.js';
import { addAntiAutopilotLayer } from './enrichment/antiAutopilot.js';
import { addDevilLayer } from './enrichment/devilLayer.js';
import { addDevilDeceptions } from './enrichment/devilDeceptions.js';
import { addLegacyHardening } from './enrichment/legacyHardening.js';
import { applyHumanFairness } from './enrichment/fairness.js';

/**
 * Chapter 16: The Awtsmoos convened every cruelty before the human court.
 *
 * The handmade level speaks first. The ascent, vault, hazards, anti-autopilot,
 * devil layers, legacy hardening, and triggers speak after. But the last voice
 * is human fairness: enough headroom to jump, enough warning to dodge, enough
 * visible law that difficulty remains revelation rather than ambush.
 *
 * @param {object} level Handmade level data.
 * @param {number} index Zero-based campaign index.
 * @returns {object} Enriched handmade level clone.
 */
export function enrichLevel(level, index) {
  const clone = structuredClone(level);
  const frame = enrichmentFrame(clone, index);
  addGuaranteedAscent(clone, index, frame.anchor);
  addSkyVault(clone, index, frame);
  addHarderHazards(clone, index, frame);
  addAntiAutopilotLayer(clone, index, frame);
  addDevilLayer(clone, index, frame);
  addDevilDeceptions(clone, index, frame);
  addLegacyHardening(clone, index);
  addReactiveTriggers(clone, index, frame);
  addWisdom(clone);
  return applyHumanFairness(clone);
}
