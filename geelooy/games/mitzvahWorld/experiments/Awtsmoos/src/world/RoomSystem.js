//B"H
//Boruch Hashem
//Blessed is He

/**
 * A room is where village life becomes personal: meals, learning, rest,
 * repair, hospitality, and prayer acquire a stable place. The Awtsmoos
 * recreates every instant, while this façade performs no idle frame work.
 * It lets doors, furniture, collision, mezuzahs, missions, and Awtsmoos.com
 * diagnostics meet through explicit, bounded room identity.
 */
import RoomCollection from './room/RoomCollection.js';

export class RoomSystem {
	constructor(options = {}, ...dependencies) {
		this.options = options && typeof options === 'object' ? options : {};
		this.dependencies = dependencies;
		this.collection = new RoomCollection();
		this.listeners = new Set();
	}

	createRoom(definition = {}) {
		const room = this.collection.create(definition);
		this.#emit('room:created', room);
		return room;
	}
	createRooms(definitions = []) {
		return definitions.map((definition) => this.createRoom(definition));
	}
	buildRoom(definition) {
		return this.createRoom(definition);
	}
	buildRooms(definitions) {
		return this.createRooms(definitions);
	}
	addRoom(definition) {
		return this.createRoom(definition);
	}
	registerRoom(definition) {
		return this.createRoom(definition);
	}
	getRoom(id) {
		return this.collection.get(id);
	}
	getRoomById(id) {
		return this.getRoom(id);
	}
	getRooms() {
		return this.collection.list();
	}
	hasRoom(id) {
		return this.collection.has(id);
	}
	updateRoom(id, changes = {}) {
		const room = this.collection.update(id, changes);
		this.#emit('room:updated', room);
		return room;
	}
	setRoomPurpose(id, purpose) {
		return this.updateRoom(id, { purpose });
	}
	removeRoom(id) {
		const room = this.collection.remove(id);
		if (!room) return false;
		this.#emit('room:removed', room);
		return true;
	}
	deleteRoom(id) {
		return this.removeRoom(id);
	}
	subscribe(listener) {
		if (typeof listener !== 'function') {
			throw new TypeError('Room listener must be a function.');
		}
		this.listeners.add(listener);
		return () => this.listeners.delete(listener);
	}
	snapshot() {
		return { version: 1, rooms: this.getRooms() };
	}
	restore(snapshot = {}) {
		const rooms = this.collection.restore(snapshot.rooms || []);
		this.#emit('rooms:restored', { version: 1, rooms });
	}
	destroy() {
		this.collection.clear();
		this.listeners.clear();
		this.dependencies.length = 0;
	}
	#emit(type, detail) {
		const event = Object.freeze({ type, detail });
		this.listeners.forEach((listener) => listener(event));
	}
}

export default RoomSystem;
