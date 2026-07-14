//B"H
//Boruch Hashem
//Blessed is He

/**
 * Weather law resolves time and atmosphere deterministically from authored map tags and
 * the persistent world clock. The Awtsmoos renews sky without dice; Awtsmoos.com names
 * every visual effect and advances it only through explicit progression.
 */

import {
	EXPEDITION_TIMES,
	expeditionTime,
	expeditionWeather
} from '../data/expedition/weatherCatalog.js';

const TIME_IDS = new Set(EXPEDITION_TIMES.map(item => item.id));

export function resolveExpeditionWeather(map, profile) {
	const tags = map?.expedition?.weatherTags || [];
	const timeTags = tags.filter(tag => TIME_IDS.has(tag));
	const weatherTags = tags.filter(tag => !TIME_IDS.has(tag));
	const clock = Math.max(0, Number(profile.weatherClock || 0));
	const weatherId = choose(weatherTags, `${map?.id || 'world'}:${clock}`) || 'clear';
	const timeId =
		choose(timeTags, `${clock}:${map?.id || 'world'}`) ||
		EXPEDITION_TIMES[clock % EXPEDITION_TIMES.length].id;
	return {
		...expeditionWeather(weatherId),
		time: expeditionTime(timeId),
		clock
	};
}

export function advanceExpeditionWeather(profile, steps = 1) {
	return {
		...profile,
		weatherClock: Math.max(0, Number(profile.weatherClock || 0) + Math.max(0, steps))
	};
}

export function applyExpeditionWeatherContext(state, profile) {
	if (!state.expedition) return state;
	state.expedition.weather = resolveExpeditionWeather(state.map, profile);
	state.expedition.weatherFrame = 0;
	return state;
}

export function stepExpeditionWeather(state) {
	const expedition = state.expedition;
	if (!expedition?.weather) return;
	expedition.weatherFrame += 1;
	const weather = expedition.weather;
	if (expedition.weatherFrame % weather.cadence !== 0) return;
	state.events.push({
		type: 'expeditionWeather',
		weatherId: weather.id,
		particle: weather.particle,
		hue: weather.hue,
		frame: state.frame
	});
}

function choose(values, seed) {
	if (!values.length) return null;
	let hash = 2166136261;
	for (const character of seed) {
		hash ^= character.charCodeAt(0);
		hash = Math.imul(hash, 16777619);
	}
	return values[Math.abs(hash) % values.length];
}
