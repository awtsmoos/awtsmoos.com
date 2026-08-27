//B"H
//Boruch Hashem
//Blessed is He

/**
 * The rooms of a home are many vessels held by one quiet collection.
 * The Awtsmoos recreates each vessel every instant, yet the collection
 * performs no frame-loop labor: it accepts explicit changes, returns safe
 * copies, and lets Awtsmoos.com diagnostics observe bounded truthful state.
 */
import RoomDefinitionRules from './RoomDefinitionRules.js';

export class RoomCollection {
	constructor() {
		this.rooms = new Map();
	}

	create(definition) {
		const room = RoomDefinitionRules.normalize(definition);
		if (this.rooms.has(room.id)) {
			throw new Error(`Room already exists: ${room.id}`);
		}
		this.rooms.set(room.id, room);
		return RoomDefinitionRules.clone(room);
	}

	get(id) {
		const room = this.rooms.get(id);
		return room ? RoomDefinitionRules.clone(room) : null;
	}

	list() {
		return [...this.rooms.values()].map(RoomDefinitionRules.clone);
	}

	has(id) {
		return this.rooms.has(id);
	}

	update(id, changes = {}) {
		const current = this.rooms.get(id);
		if (!current) {
			throw new Error(`Unknown room: ${id}`);
		}
		const room = RoomDefinitionRules.normalize({ ...current, ...changes, id });
		this.rooms.set(id, room);
		return RoomDefinitionRules.clone(room);
	}

	remove(id) {
		const room = this.rooms.get(id);
		if (!room) return null;
		this.rooms.delete(id);
		return RoomDefinitionRules.clone(room);
	}

	restore(definitions = []) {
		this.rooms.clear();
		for (const definition of definitions) {
			const room = RoomDefinitionRules.normalize(definition);
			this.rooms.set(room.id, room);
		}
		return this.list();
	}

	clear() {
		this.rooms.clear();
	}
}

export default RoomCollection;
