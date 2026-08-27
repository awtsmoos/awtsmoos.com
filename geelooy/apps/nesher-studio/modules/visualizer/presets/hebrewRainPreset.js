/* B"H
Preset: Hebrew Rain, letters descend like sparks through the livestream night.
*/
export const hebrewRainPreset = {
  id:'hebrewRain', name:'Hebrew Rain', defaults:{ bars:32, sensitivity:1.4 },
  render(ctx, source, frame, helpers) { helpers.drawWave(ctx, source, frame); helpers.drawHebrewRain(ctx, source, frame); }
};
