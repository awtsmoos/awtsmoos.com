/* B"H
Visualizer source families: one audio fire can wear many garments without copying the renderer.
*/
export const DEFAULT_VISUALIZER_SOURCE_FAMILY_ID = 'hebrew-orbit';
export const VISUALIZER_SOURCE_FAMILIES = [
  family('hebrew-orbit', 'Hebrew Orbit Visualizer', 'hebrewOrbit', { sensitivity:1.35, bars:48, letters:'#ffd166', wave:'#83ffe7' }),
  family('hebrew-river', 'Hebrew Letters River', 'hebrewRiver', { sensitivity:1.45, bars:54, letters:'#d8fff7', wave:'#83ffe7' }),
  family('hebrew-lightning', 'Hebrew Lightning', 'hebrewLightning', { sensitivity:1.7, bars:40, letters:'#ffffff', particles:'#ffd166' }),
  family('screen-speed', 'Realtime Screen Speed', 'screenSpeed', { sensitivity:1.1, bars:34, wave:'#a8c7ff', particles:'#83ffe7' }),
  family('spectrum-bars', 'Spectrum Bars Visualizer', 'spectrumBars', { sensitivity:1.6, bars:64, barsColor:'#18b7a0', bgB:'#1b2550' }),
  family('circular-wave', 'Circular Wave Visualizer', 'circularWave', { sensitivity:1.2, bars:40, wave:'#ffd166', particles:'#7c5cff' }),
  family('hebrew-rain', 'Hebrew Rain Visualizer', 'hebrewRain', { sensitivity:1.1, bars:36, letters:'#83ffe7', bgA:'#050816' }),
  family('particle-galaxy', 'Particle Galaxy Visualizer', 'particleGalaxy', { sensitivity:1.8, bars:56, particles:'#ffd166', glow:true })
];
export function visualizerSourceFamilyById(id) { return VISUALIZER_SOURCE_FAMILIES.find(f => f.id === id) || VISUALIZER_SOURCE_FAMILIES[0]; }
export function visualizerFamilyOptionsHtml() { return VISUALIZER_SOURCE_FAMILIES.map(f => `<option value="${f.id}">${f.label}</option>`).join(''); }
export function visualizerFamilySummary() { return VISUALIZER_SOURCE_FAMILIES.map(f => ({ id:f.id, label:f.label, preset:f.settings.preset, metadata:f.metadata })); }
function family(id, label, preset, settings) { return { id, label, settings:{ preset, sourceFamily:id, ...settings }, metadata:{ family:id, preset, source:'Nesher realtime visualizer' } }; }
