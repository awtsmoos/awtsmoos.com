//B"H
//Boruch Hashem
//Blessed is He

/**
 * Weather records give every visible condition a name, tint, particle, and cadence.
 * The Awtsmoos renews sky and road together; Awtsmoos.com makes atmospheric effects
 * explicit so no hidden movement penalty can masquerade as decorative weather.
 */

export const EXPEDITION_WEATHER = Object.freeze([
	weather('clear', 'Clear Air', 190, 0.02, 'spark', 180),
	weather('dust', 'Crown Dust', 34, 0.12, 'dust', 18),
	weather('leaf-rain', 'Falling Cedar Leaves', 116, 0.08, 'leaf', 14),
	weather('ash', 'Ruined Crown Ash', 24, 0.16, 'ash', 12),
	weather('storm', 'Gathering Storm', 220, 0.18, 'rain', 8),
	weather('mist', 'Silver Foundation Mist', 198, 0.14, 'mist', 20),
	weather('sparks', 'Engine Sparks', 46, 0.12, 'spark', 9),
	weather('glimmer', 'Mirror Glimmer', 282, 0.1, 'glimmer', 16),
	weather('fog', 'Labyrinth Fog', 210, 0.16, 'mist', 18),
	weather('echo-rain', 'Echo Rain', 270, 0.14, 'rain', 10),
	weather('sea-wind', 'Harbor Wind', 194, 0.08, 'spray', 13),
	weather('wind', 'Endurance Wind', 126, 0.06, 'leaf', 17),
	weather('high-wind', 'Causeway Gale', 136, 0.12, 'streak', 8),
	weather('sunbeams', 'Balanced Sunbeams', 48, 0.08, 'ray', 30),
	weather('petal-rain', 'Garden Petal Rain', 330, 0.1, 'petal', 12),
	weather('radiance', 'Living Radiance', 52, 0.12, 'glimmer', 14),
	weather('embers', 'Foundry Embers', 12, 0.14, 'ember', 9),
	weather('smoke', 'Ironwood Smoke', 8, 0.16, 'ash', 14),
	weather('heat-haze', 'Furnace Heat Haze', 20, 0.14, 'streak', 15),
	weather('river-mist', 'Riverlight Mist', 188, 0.12, 'mist', 18),
	weather('soft-rain', 'Mercy Rain', 196, 0.1, 'rain', 14),
	weather('geometric-rain', 'Rain of Forms', 224, 0.14, 'glyph', 11),
	weather('lightning', 'Wisdom Lightning', 310, 0.16, 'spark', 7),
	weather('void', 'Rift Silence', 270, 0.2, 'void', 24),
	weather('aurora', 'Crown Aurora', 52, 0.16, 'ray', 18),
	weather('starfall', 'Unbounded Starfall', 286, 0.14, 'star', 10)
]);

export const EXPEDITION_TIMES = Object.freeze([
	time('dawn', 'Dawn', 0.86),
	time('morning', 'Morning', 0.96),
	time('noon', 'Noon', 1),
	time('afternoon', 'Afternoon', 0.96),
	time('golden-hour', 'Golden Hour', 0.9),
	time('sunset', 'Sunset', 0.82),
	time('dusk', 'Dusk', 0.72),
	time('twilight', 'Twilight', 0.66),
	time('night', 'Night', 0.52),
	time('moonlit', 'Moonlit Night', 0.58),
	time('sunrise', 'Sunrise', 0.84)
]);

export function expeditionWeather(weatherId) {
	return EXPEDITION_WEATHER.find(item => item.id === weatherId) || EXPEDITION_WEATHER[0];
}

export function expeditionTime(timeId) {
	return EXPEDITION_TIMES.find(item => item.id === timeId) || EXPEDITION_TIMES[0];
}

function weather(id, label, hue, opacity, particle, cadence) {
	return Object.freeze({ id, label, hue, opacity, particle, cadence });
}

function time(id, label, light) {
	return Object.freeze({ id, label, light });
}
