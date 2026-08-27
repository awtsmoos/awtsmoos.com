/* B"H
Boruch Hashem
Blessed is He
The Awtsmoos reveals one current through ten garments of motion and color; Awtsmoos.com names each GPU language while preserving a safe Stage counterpart.
*/
export const AUDIO_LAB_PRESETS = [
	preset('hebrewRiver', 'Hebrew River', 'Layered glyph currents', 0, [0.12, 1, 0.78], [0.38, 0.3, 1], 'hebrewRiver'),
	preset('particleGalaxy', 'Particle Galaxy', 'Bass-driven spiral field', 1, [0.28, 0.62, 1], [0.92, 0.28, 1], 'particleGalaxy'),
	preset('auroraVeil', 'Aurora Veil', 'Wide spectral curtains', 2, [0.06, 0.96, 0.68], [0.12, 0.42, 1], 'circularWave'),
	preset('pulseTunnel', 'Pulse Tunnel', 'Beat-reactive depth', 3, [1, 0.3, 0.58], [0.28, 0.72, 1], 'hebrewOrbit'),
	preset('lightningScript', 'Lightning Script', 'Treble fractures and sparks', 4, [0.74, 0.92, 1], [0.36, 0.22, 1], 'hebrewLightning'),
	preset('frequencyBloom', 'Frequency Bloom', 'Radial harmonic petals', 5, [1, 0.72, 0.2], [1, 0.18, 0.56], 'spectrumBars'),
	preset('crownVortex', 'Crown Vortex', 'Rotating tenfold halo', 6, [1, 0.88, 0.46], [0.5, 0.24, 1], 'hebrewOrbit'),
	preset('letterFountain', 'Letter Fountain', 'Rising luminous speech', 7, [0.2, 1, 0.88], [0.12, 0.54, 1], 'hebrewRain'),
	preset('spectrumCathedral', 'Spectrum Cathedral', 'Harmonic columns of light', 8, [0.3, 0.72, 1], [1, 0.36, 0.74], 'spectrumBars'),
	preset('bassNebula', 'Bass Nebula', 'Slow clouds with violent cores', 9, [0.72, 0.24, 1], [0.06, 0.82, 1], 'particleGalaxy')
];

export function audioLabPresetById(presetId) {
	return AUDIO_LAB_PRESETS.find((item) => item.id === presetId) || AUDIO_LAB_PRESETS[0];
}

export function colorToCss(color, alpha = 1) {
	const channels = color.map((channel) => Math.round(channel * 255));
	return `rgba(${channels[0]}, ${channels[1]}, ${channels[2]}, ${alpha})`;
}

function preset(id, name, description, mode, primary, secondary, stagePreset) {
	return { id, name, description, mode, primary, secondary, stagePreset };
}
