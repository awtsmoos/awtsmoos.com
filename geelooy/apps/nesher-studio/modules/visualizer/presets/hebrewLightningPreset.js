/* B"H
Preset: Hebrew Lightning, where bass forks and treble becomes sparks.
*/
export const hebrewLightningPreset = {
  id:'hebrewLightning', name:'Hebrew Lightning', defaults:{ bars:40, sensitivity:1.7, bgA:'#050611', bgB:'#150927' },
  render(ctx, source, frame, helpers) { helpers.drawHebrewLightning(ctx, source, frame); }
};
