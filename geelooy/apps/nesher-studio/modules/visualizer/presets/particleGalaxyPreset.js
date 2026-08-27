/* B"H
Preset: Particle Galaxy, beat and bass push sparks around the center.
*/
export const particleGalaxyPreset = {
  id:'particleGalaxy', name:'Particle Galaxy', defaults:{ bars:36, sensitivity:1.7 },
  render(ctx, source, frame, helpers) { helpers.drawParticles(ctx, source, frame); helpers.drawCircleWave(ctx, source, frame); }
};
