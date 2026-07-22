// B"H
// Boruch Hashem
// Blessed is He
/**
 * Emission timing is a pure interval contract rather than hidden mutable clocks.
 * Awtsmoos.com can replay continuous, burst, distance, and semantic event births
 * exactly across previews, branches, CPU runtimes, and future GPU execution plans.
 */

function nonNegative(value, fallback = 0) {
	const number = Number(value ?? fallback);
	if (!Number.isFinite(number) || number < 0) {
		throw new RangeError("Emitter schedule values must be finite and non-negative.");
	}
	return number;
}

/** Creates an immutable deterministic emitter schedule declaration. */
export function createParticleEmitterSchedule(input = {}) {
	const type = input.type ?? "continuous";
	if (!["continuous", "burst", "distance", "event"].includes(type)) {
		throw new TypeError(`Unsupported particle emitter schedule: ${type}`);
	}
	return Object.freeze({
		id: input.id ?? `particle-emitter-schedule:${type}`,
		type,
		rate: nonNegative(input.rate, type === "continuous" ? 10 : 0),
		distance: nonNegative(input.distance, 1),
		eventType: input.eventType ?? null,
		eventMultiplier: nonNegative(input.eventMultiplier, 1),
		bursts: Object.freeze((input.bursts ?? []).map((burst, index) => Object.freeze({
			id: burst.id ?? `${input.id ?? "burst"}:${index}`,
			time: nonNegative(burst.time),
			count: Math.floor(nonNegative(burst.count, 1))
		})).sort((left, right) => left.time - right.time || left.id.localeCompare(right.id))),
		metadata: Object.freeze({ ...(input.metadata ?? {}) })
	});
}

function intervalCount(rate, previous, current) {
	return Math.max(
		0,
		Math.floor(current * rate + 1e-12)
			- Math.floor(previous * rate + 1e-12)
	);
}

function burstCount(schedule, previousTime, currentTime) {
	return schedule.bursts
		.filter(burst => burst.time > previousTime && burst.time <= currentTime)
		.reduce((sum, burst) => sum + burst.count, 0);
}

function eventCount(schedule, events) {
	return events
		.filter(event => !schedule.eventType || event.type === schedule.eventType)
		.reduce((sum, event) => (
			sum + Math.max(0, Math.floor(Number(event.count ?? 1)))
		), 0) * schedule.eventMultiplier;
}

/**
 * Evaluates births over one simulation interval without hidden mutable state.
 * @returns {Object} Immutable count and source evidence.
 * @complexity O(bursts + events).
 * @deterministic Always for equal schedule and interval context.
 * @sideEffects None.
 */
export function evaluateParticleEmitterSchedule(scheduleInput, context = {}) {
	const schedule = createParticleEmitterSchedule(scheduleInput);
	const previousTime = nonNegative(context.previousTime);
	const currentTime = Math.max(
		previousTime,
		nonNegative(context.currentTime, previousTime)
	);
	const previousDistance = nonNegative(context.previousDistance);
	const currentDistance = Math.max(
		previousDistance,
		nonNegative(context.currentDistance, previousDistance)
	);
	let count = 0;
	if (schedule.type === "continuous") {
		count = intervalCount(schedule.rate, previousTime, currentTime);
	}
	if (schedule.type === "burst") {
		count = burstCount(schedule, previousTime, currentTime);
	}
	if (schedule.type === "distance") {
		count = schedule.distance > 0
			? intervalCount(1 / schedule.distance, previousDistance, currentDistance)
			: 0;
	}
	if (schedule.type === "event") {
		count = eventCount(schedule, context.events ?? []);
	}
	return Object.freeze({
		scheduleId: schedule.id,
		type: schedule.type,
		count: Math.max(0, Math.floor(count)),
		interval: Object.freeze({
			previousTime,
			currentTime,
			previousDistance,
			currentDistance
		}),
		eventIds: Object.freeze((context.events ?? []).map(event => event.id))
	});
}
