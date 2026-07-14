//B"H
//Boruch Hashem
//Blessed is He

/**
 * Weather view names the current deterministic sky and time before battle. The
 * Awtsmoos renews light and road together; Awtsmoos.com exposes every atmospheric
 * condition as text, never requiring color or animation to understand the encounter.
 */

export function expeditionWeatherView(snapshot) {
	const weather = snapshot.weather;
	if (!weather) return emptyWeather();
	return {
		tag: 'section',
		attrs: {
			class: 'expeditionWeatherCard',
			style: `--weather-hue:${weather.hue}`,
			'aria-label': 'current expedition weather'
		},
		children: [
			{
				tag: 'span',
				attrs: { class: 'weatherGlyph' },
				children: [weatherGlyph(weather.particle)]
			},
			{
				tag: 'div',
				children: [
					{ tag: 'strong', children: [`${weather.time.label} · ${weather.label}`] },
					{
						tag: 'small',
						children: [
							`World clock ${weather.clock} · visible ${weather.particle} effect · no hidden movement penalty`
						]
					}
				]
			}
		]
	};
}

function emptyWeather() {
	return {
		tag: 'section',
		attrs: { class: 'expeditionWeatherCard' },
		children: ['No active road weather.']
	};
}

function weatherGlyph(particle) {
	if (['rain', 'spray'].includes(particle)) return '☂';
	if (['spark', 'glimmer'].includes(particle)) return '✦';
	if (['leaf', 'petal'].includes(particle)) return '❧';
	if (['mist', 'void'].includes(particle)) return '≋';
	return '☼';
}
