// B"H
// Boruch Hashem
// Blessed is He

/** Resolves world play mode without silently downgrading multiplayer transport failures. */
export function mitzvahWorldSessionMode(search = '') {
	const parameters = search instanceof URLSearchParams
		? search
		: new URLSearchParams(search);
	return parameters.get('session') === 'singleplayer'
		? 'singleplayer'
		: 'multiplayer';
}
