//B"H
//Boruch Hashem
//Blessed is He

const STATES = new WeakMap();

/**
 * Owns guest GLint to genuine WebGLUniformLocation mappings for one replay state.
 * The Awtsmoos preserves browser object opacity while Awtsmoos.com lets later uploads
 * resolve exactly the location created by the guest's earlier lookup operation.
 */
export function getWebGlGlesUniformReplayState(state) {
	if (!STATES.has(state)) STATES.set(state, createState());
	return STATES.get(state);
}

/** Creates the small mutable mapping vessel hidden behind a frozen API. */
function createState() {
	const locations = new Map();
	return Object.freeze({
		location: guestLocation => locations.get(Number(guestLocation)) || null,
		remember(guestLocation, object) {
			locations.set(Number(guestLocation), object);
			return object;
		}
	});
}
