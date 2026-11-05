//B"H
//Boruch Hashem
//Blessed is He

/**
 * Every inhabited room is a finite vessel for a human purpose.
 * The Awtsmoos gives that vessel existence anew each instant; these rules
 * give it a stable identity so doors, furniture, missions, collision, and
 * Awtsmoos.com diagnostics can agree without sharing mutable references.
 */
export class RoomDefinitionRules {
	static normalize(definition = {}) {
		const id = String(definition.id || definition.roomId || '').trim();
		if (!id) {
			throw new Error('Every room requires a stable id.');
		}
		return Object.freeze({
			...definition,
			id,
			purpose: definition.purpose || definition.type || 'living',
			doorwayIds: Object.freeze([...(definition.doorwayIds || [])]),
			furnitureIds: Object.freeze([...(definition.furnitureIds || [])])
		});
	}

	static clone(room) {
		return {
			...room,
			doorwayIds: [...room.doorwayIds],
			furnitureIds: [...room.furnitureIds]
		};
	}
}

export default RoomDefinitionRules;
