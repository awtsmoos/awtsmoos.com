// B"H
// Boruch Hashem
// Blessed is He
/** Scheduled emission composes the existing deterministic emitter without hidden state. */

import { emitParticles } from "./emitParticles.js";
import { evaluateParticleEmitterSchedule } from "./createParticleEmitterSchedule.js";

function eventDirection(events) {
	if (!events.length) return null;
	const velocity = events.reduce((total, event) => total.map((value, axis) => (
		value + Number(event.velocity?.[axis] ?? 0)
	)), [0, 0, 0]);
	const length = Math.hypot(...velocity);
	return length > 1e-9 ? velocity.map(value => value / length) : null;
}

function eventPosition(events) {
	if (!events.length) return null;
	return events.reduce((total, event) => total.map((value, axis) => (
		value + Number(event.position?.[axis] ?? 0) / events.length
	)), [0, 0, 0]);
}

/**
 * Emits particles from a pure schedule interval and returns exact birth evidence.
 * @returns {{system:Object,report:Object}} Next particle state and schedule report.
 * @complexity O(events + emitted particles).
 * @deterministic Always for equal state, schedule, context, and emitter.
 * @sideEffects None.
 */
export function emitScheduledParticles(system, schedule, context = {}, emitter = {}) {
	const report = evaluateParticleEmitterSchedule(schedule, context);
	const events = context.events ?? [];
	const position = eventPosition(events) ?? emitter.position;
	const direction = eventDirection(events) ?? emitter.direction;
	const nextSystem = emitParticles(system, {
		...emitter,
		count: report.count,
		position,
		direction,
		attributes: {
			...(emitter.attributes ?? {}),
			scheduleId: report.scheduleId,
			sourceEventIds: report.eventIds
		}
	});
	const emittedCount = nextSystem.particles.length - system.particles.length;
	return Object.freeze({
		system: nextSystem,
		report: Object.freeze({
			...report,
			emittedCount,
			capacityClamped: report.count > emittedCount
		})
	});
}
