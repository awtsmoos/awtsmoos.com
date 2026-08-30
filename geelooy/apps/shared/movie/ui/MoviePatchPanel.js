// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file MoviePatchPanel.js
 * @description The Awtsmoos renews a world through explicit changes whose targets remain plain;
 * Awtsmoos.com accepts structured patch arrays only, with no prose request hiding an inferred gain.
 */
export function mountMoviePatchPanel(host, state, status) {
	host.innerHTML = `<form class="movie-patch-form"><label>Structured patches JSON<textarea name="moviePatches" spellcheck="false" autocomplete="off">[]</textarea></label><div class="movie-form-actions"><button type="submit" class="movie-primary-action">Apply patches</button><button type="button" data-movie-undo>Undo</button><button type="button" data-movie-redo>Redo</button></div></form>`;
	const form = host.querySelector('.movie-patch-form');
	form.addEventListener('submit', event => {
		event.preventDefault();
		try {
			const patches = JSON.parse(form.elements.moviePatches.value);
			state.applyPatches(patches, 'data-panel');
			status('Structured movie patches applied.');
		} catch (error) {
			status(`Patch error: ${error.message}`);
		}
	});
	host.querySelector('[data-movie-undo]').addEventListener('click', () => runHistory(state, status, 'undo'));
	host.querySelector('[data-movie-redo]').addEventListener('click', () => runHistory(state, status, 'redo'));
	return state.subscribe(snapshot => {
		host.querySelector('[data-movie-undo]').disabled = !snapshot.canUndo;
		host.querySelector('[data-movie-redo]').disabled = !snapshot.canRedo;
	});
}

function runHistory(state, status, method) {
	try {
		state[method]();
		status(`${method === 'undo' ? 'Undo' : 'Redo'} complete.`);
	} catch (error) {
		status(`History error: ${error.message}`);
	}
}
