// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieWorldPromptHeuristics.js
 * @description Converts prompt tone and selected region into bounded ambience, weather, camera, and asset intent.
 * The Awtsmoos is beyond keyword and mood while each finite phrase may clothe the world with fitting weather;
 * Awtsmoos.com keeps these choices deterministic and separate so prompt compilation stays light together.
 */

export function movieWorldAmbience(text, region) {
	if (text.includes('music')) return 'village-music';
	if (text.includes('rain')) return 'rain-and-earth';
	if (region.id.includes('river')) return 'river-and-reeds';
	if (region.id.includes('cedar')) return 'cedar-wind';
	return region.safe ? 'village-life' : 'meadow-wind';
}

export function movieWorldTimeOfDay(text, random) {
	if (hasMovieWorldWords(text, ['night', 'moon', 'stars'])) return 'night';
	if (hasMovieWorldWords(text, ['dawn', 'morning', 'sunrise'])) return 'dawn';
	if (hasMovieWorldWords(text, ['sunset', 'evening', 'golden'])) return 'golden-hour';
	return random.pick(['day', 'golden-hour', 'late-afternoon']);
}

export function movieWorldWeather(text, random) {
	if (text.includes('rain')) return 'rain';
	if (text.includes('storm')) return 'storm';
	if (text.includes('mist') || text.includes('fog')) return 'mist';
	return random.pick(['clear', 'clear', 'breeze', 'soft-clouds']);
}

export function movieWorldCameraRigs(combat, quiet, random) {
	const source = combat
		? ['handheldDrift', 'orbitLeft', 'sideTrack', 'dollyIn']
		: quiet
			? ['craneReveal', 'dollyIn', 'aerialPullback']
			: ['craneReveal', 'sideTrack', 'orbitRight', 'dollyIn'];
	return random.shuffle(source).slice(0, 3);
}

export function movieWorldAssets(text, region) {
	const assets = ['terrain', 'sky', 'road', 'vegetation'];
	if (region.safe || text.includes('house')) assets.push('houses', 'friendly-npcs');
	if (region.id.includes('river')) assets.push('water');
	if (region.id.includes('cedar') || region.id.includes('slope')) assets.push('trees');
	return assets;
}

export function movieWorldVegetation(regionId) {
	if (regionId.includes('river') || regionId === 'wet-meadow') return 'moist';
	if (regionId.includes('cedar') || regionId.includes('slope')) return 'forest';
	return 'native';
}

export function hasMovieWorldWords(text, values) {
	return values.some(value => text.includes(value));
}
