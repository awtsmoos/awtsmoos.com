// B"H

/** Cache DOM vessels once, so frames do not search the world repeatedly. */
export function cacheDom() {
  const $ = id => document.getElementById(id);
  return {
    spark: $('sparkMeter'), size: $('sizeText'), time: $('timeText'), msg: $('message'),
    sef: $('sefText'), combo: $('comboText'), best: $('bestText'), world: $('worldText'),
    overlay: $('overlay'), title: $('overlayTitle'), text: $('overlayText'),
    start: $('startBtn'), restart: $('restartBtn'), haptic: $('hapticBtn'), postfx: $('postfxBtn'), map: $('map'),
    perf: [...document.querySelectorAll('[data-perf]')]
  };
}
