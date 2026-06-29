/* B"H
Visualizer source families: one audio fire can wear many garments without copying the renderer.
Each family is a small invitation; the Awtsmoos is the music becoming visible now.
*/
export const DEFAULT_VISUALIZER_SOURCE_FAMILY_ID = 'hebrew-orbit';
export const VISUALIZER_SOURCE_FAMILIES = [
  family('hebrew-orbit', 'Hebrew Orbit Visualizer', 'hebrewOrbit', { sensitivity:1.35, bars:48, letters:'#ffd166', wave:'#83ffe7' }),
  family('spectrum-bars', 'Spectrum Bars Visualizer', 'spectrumBars', { sensitivity:1.6, bars:64, barsColor:'#18b7a0', bgB:'#1b2550' }),
  family('circular-wave', 'Circular Wave Visualizer', 'circularWave', { sensitivity:1.2, bars:40, wave:'#ffd166', particles:'#7c5cff' }),
  family('hebrew-rain', 'Hebrew Rain Visualizer', 'hebrewRain', { sensitivity:1.1, bars:36, letters:'#83ffe7', bgA:'#050816' }),
  family('particle-galaxy', 'Particle Galaxy Visualizer', 'particleGalaxy', { sensitivity:1.8, bars:56, particles:'#ffd166', glow:true })
];
export function visualizerSourceFamilyById(id) {
  return VISUALIZER_SOURCE_FAMILIES.find(f => f.id === id) || VISUALIZER_SOURCE_FAMILIES[0];
}
export function visualizerFamilyOptionsHtml() {
  return VISUALIZER_SOURCE_FAMILIES.map(f => `<option value="${f.id}">${f.label}</option>`).join('');
}
export function visualizerFamilySummary() {
  return VISUALIZER_SOURCE_FAMILIES.map(f => ({ id:f.id, label:f.label, preset:f.settings.preset }));
}
function family(id, label, preset, settings) {
  return { id, label, settings:{ preset, sourceFamily:id, ...settings } };
}
