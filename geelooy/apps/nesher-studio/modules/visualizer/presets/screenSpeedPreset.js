/* B"H
Preset: Screen Speed, motion made visible without recorder APIs.
*/
export const screenSpeedPreset = {
  id:'screenSpeed', name:'Screen Speed', defaults:{ bars:34, sensitivity:1.1, bgA:'#080b14', bgB:'#172433' },
  render(ctx, source, frame, helpers) { helpers.drawScreenSpeed(ctx, source, frame); }
};
