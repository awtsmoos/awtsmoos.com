// B"H
/**
 * Chapter 2: The Awtsmoos forbade surprise murder from hiding in helpers.
 *
 * Moving spikes may still bite, roll, fall, and orbit, but their first language
 * must be warning. The player must see danger before judgment becomes damage.
 *
 * @param {number} x Left coordinate.
 * @param {number} y Top coordinate.
 * @param {number} w Width.
 * @param {number} h Height.
 * @param {object} extra Authored motion and timing data.
 * @returns {object} Complete spike data with humane defaults.
 */
export function movingSpike(x, y, w, h, extra = {}) {
  return {
    x, y, w, h,
    warning: 1.05,
    duration: 1.15,
    min: 1.6,
    max: 3.2,
    showDormant: true,
    ...extra
  };
}

/**
 * Hidden jump-line trap, rewritten as a readable ceiling warning.
 *
 * @param {number} x Trigger x.
 * @param {number} y Trigger y.
 * @param {number} seed Variation seed.
 * @returns {object} Trigger data with dodgeable falling spikes.
 */
export function jumpSpikeTriggerData(x, y, seed) {
  const drift = seed % 2 ? -40 : 40;
  return {
    x, y, w: 120, h: 110,
    message: 'The ceiling trembled before the spike descended.',
    spikes: [
      { x: x + drift, y: y - 112, w: 62, h: 22, warning: 1.1, duration: 0.95, fallSpeed: 230, safe: 150, showDormant: true },
      { x: x + drift + 88, y: y - 142, w: 58, h: 22, warning: 1.3, duration: 0.95, fallSpeed: 250, safe: 150, showDormant: true }
    ]
  };
}

/**
 * Falling iron trigger, visible before it bites.
 *
 * @param {number} x Trigger x.
 * @param {number} y Sky baseline.
 * @returns {object} Trigger with delayed falling iron teeth.
 */
export function fallingIronTriggerData(x, y) {
  return {
    x, y: y - 142, w: 190, h: 126,
    message: 'Iron flashed, shook, then fell: dodge now.',
    spikes: [
      { x: x - 38, y: y - 250, w: 70, h: 24, warning: 1.15, duration: 1.0, fallSpeed: 260, safe: 160, showDormant: true },
      { x: x + 68, y: y - 208, w: 76, h: 24, warning: 1.32, duration: 1.0, fallSpeed: 280, safe: 160, showDormant: true },
      { x: x + 188, y: y - 164, w: 84, h: 24, warning: 1.5, duration: 1.05, fallSpeed: 300, safe: 160, showDormant: true }
    ]
  };
}
