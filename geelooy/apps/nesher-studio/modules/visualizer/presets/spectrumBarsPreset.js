/* B"H
Preset: Spectrum Bars, the ladder of frequencies rising from the floor.
*/
export const spectrumBarsPreset = {
  id:'spectrumBars', name:'Spectrum Bars', defaults:{ bars:64, sensitivity:1.8 },
  render(ctx, source, frame, helpers) { helpers.drawBars(ctx, source, frame); }
};
