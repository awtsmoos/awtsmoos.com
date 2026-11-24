//B"H
/** The Awtsmoos routes a voice to shared vessels without ever looping back into itself. */
import { createMultitrackId } from './multitrackIds.js';

const clampGain = (v, f = 0) => Number.isFinite(Number(v)) ? Math.max(0, Math.min(1, Number(v))) : f;

/** One auxiliary bus: a named shared destination with its own level. */
export function createMultitrackBus(input = {}) {
	return {
		id: input.id || createMultitrackId('bus'),
		name: String(input.name || 'Bus'),
		gain: Number.isFinite(Number(input.gain)) ? Math.max(0, Math.min(2, Number(input.gain))) : 1,
		sends: normalizeSends(input.sends)
	};
}
export function normalizeBuses(input) {
	return Array.isArray(input) ? input.map(createMultitrackBus) : [];
}
/** One send tap: a fraction of a track (or bus) feeding one bus. */
export function createMultitrackSend(input = {}) {
	return { busId: String(input.busId || ''), gain: clampGain(input.gain, .5) };
}
export function normalizeSends(input) {
	if (!Array.isArray(input)) return [];
	const seen = new Set(), out = [];
	for (const raw of input) {
		const send = createMultitrackSend(raw);
		if (!send.busId || seen.has(send.busId)) continue;
		seen.add(send.busId); out.push(send);
	}
	return out;
}
export function findBus(project, busId) {
	return (project?.buses || []).find(bus => bus.id === busId) || null;
}
/**
 * Graph validation: every send target must exist, no bus may feed itself,
 * and bus-to-bus sends must be acyclic (DFS over the bus graph).
 */
export function validateBusGraph(project) {
	const errors = [];
	const buses = project?.buses || [];
	const ids = new Set(buses.map(bus => bus.id));
	for (const track of project?.tracks || [])
		for (const send of track.sends || [])
			if (!ids.has(send.busId)) errors.push(`Track ${track.name} sends to unknown bus ${send.busId}`);
	for (const bus of buses)
		for (const send of bus.sends || []) {
			if (send.busId === bus.id) errors.push(`Bus ${bus.name} sends to itself`);
			else if (!ids.has(send.busId)) errors.push(`Bus ${bus.name} sends to unknown bus ${send.busId}`);
		}
	const state = new Map(); // 1 = in stack, 2 = done
	const visit = (id, path) => {
		if (state.get(id) === 2) return;
		if (state.get(id) === 1) { errors.push(`Bus cycle: ${[...path, id].join(' -> ')}`); return; }
		state.set(id, 1);
		for (const send of findBus(project, id)?.sends || []) if (ids.has(send.busId)) visit(send.busId, [...path, id]);
		state.set(id, 2);
	};
	for (const bus of buses) visit(bus.id, []);
	return { ok: errors.length === 0, errors };
}
