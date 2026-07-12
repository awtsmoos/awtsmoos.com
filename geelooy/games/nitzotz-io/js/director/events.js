// B"H

export const EVENTS = [
	event('trafficSurge', 'Avenue Surge', 9, 'Traffic has awakened across every lane.', { trafficSpeed: 1.9 }),
	event('sparkStorm', 'Spark Storm', 10, 'Score and attraction intensify beneath the storm.', { scoreScale: 1.6, attractionScale: 1.5 }),
	event('rivalInvasion', 'Rival Invasion', 10, 'Every rival accelerates toward the remaining city.', { rivalSpeed: 1.55 }),
	event('marketStampede', 'Market Stampede', 11, 'Pedestrian currents race through the districts.', { pedestrianSpeed: 2.1 }),
	event('fragileHour', 'Fragile Hour', 10, 'Structures yield additional mass while the city trembles.', { fragile: true, captureMass: 1.28 }),
	event('celestialWindow', 'Celestial Window', 9, 'Movement and scoring burn brighter for a moment.', { playerSpeed: 1.2, scoreScale: 1.35 })
];

export function updateEvents(world, dt) {
	const director = world.director;
	if (!world.gameMode.events) return;
	if (director.event) {
		director.eventTime = Math.max(0, director.eventTime - dt);
		if (!director.eventTime) closeEvent(world);
		return;
	}
	if (director.elapsed >= director.nextEventAt) activateEvent(world);
}

export function activateEvent(world, id = null) {
	if (!world.gameMode.events) return null;
	const director = world.director;
	const selected = EVENTS.find(candidate => candidate.id === id)
		|| EVENTS[(director.levelSeed + director.eventCount * 7) % EVENTS.length];
	director.event = selected;
	director.eventTime = selected.duration;
	director.eventCount += 1;
	director.announcement = selected.message;
	director.announcementTime = 4;
	world.message = `${selected.name}: ${selected.message}`;
	world.events.push(['event', selected.id]);
	return selected;
}

export function eventRules(director) {
	return director.event?.rules || {};
}

function closeEvent(world) {
	const director = world.director;
	director.event = null;
	director.nextEventAt = director.elapsed + world.gameMode.eventCadence;
}

function event(id, name, duration, message, rules) {
	return Object.freeze({ id, name, duration, message, rules: Object.freeze(rules) });
}
