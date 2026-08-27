/* B"H
Preset: Hebrew Orbit, where sound becomes circling letters.
*/
export const hebrewOrbitPreset = {
  id:'hebrewOrbit', name:'Hebrew Orbit', defaults:{ bars:42, sensitivity:1.35 },
  render(ctx, source, frame, helpers) { helpers.drawBars(ctx, source, frame); helpers.drawWave(ctx, source, frame); helpers.drawHebrewOrbit(ctx, source, frame); }
};
