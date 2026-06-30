/* B"H
Preset: Hebrew River, readable glyph streams pushed by bass and beat.
*/
export const hebrewRiverPreset = {
  id:'hebrewRiver', name:'Hebrew River', defaults:{ bars:54, sensitivity:1.45, bgB:'#061f2d' },
  render(ctx, source, frame, helpers) { helpers.drawWave(ctx, source, frame); helpers.drawHebrewRiver(ctx, source, frame); }
};
