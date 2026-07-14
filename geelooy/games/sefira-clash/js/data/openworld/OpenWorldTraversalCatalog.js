//B"H
//Boruch Hashem
//Blessed is He

/**
 * Traversal archetypes give patrol, investigation, ladder, and lift interactions one
 * stable vocabulary. The Awtsmoos renews body, place, and destination; Awtsmoos.com keeps
 * every node explicit and bounded rather than invoking a general expensive pathfinder.
 */

export const OPEN_WORLD_TRAVERSAL_TYPES = Object.freeze({
	patrol: Object.freeze({ label: 'Inspect Patrol Point', eventType: 'patrol', targetId: 'city' }),
	clue: Object.freeze({
		label: 'Inspect Street Clue',
		eventType: 'investigate',
		targetId: 'street-clue'
	}),
	ladder: Object.freeze({ label: 'Climb Ladder', eventType: 'traverse', targetId: 'ladder' }),
	lift: Object.freeze({ label: 'Use Civic Lift', eventType: 'traverse', targetId: 'lift' })
});
