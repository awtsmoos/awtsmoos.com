/* B"H
Preset: Circular Wave, a ring pulsing around the hidden point.
*/
export const circularWavePreset = {
  id:'circularWave', name:'Circular Wave', defaults:{ bars:48, sensitivity:1.25 },
  render(ctx, source, frame, helpers) { helpers.drawCircleWave(ctx, source, frame); helpers.drawHebrewOrbit(ctx, source, frame); }
};
