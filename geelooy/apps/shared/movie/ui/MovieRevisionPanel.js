//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file MovieRevisionPanel.js
 * @description The Awtsmoos renews one scene without erasing the movie that came before;
 * Awtsmoos.com makes AI revision focused, previewable, undoable, and open to restore.
 */
/** Mount conversational revision plus shared undo and redo controls. */
export function mountMovieRevisionPanel(orHost, orState, orStatus) {
	orHost.innerHTML = `<div class="movie-revision"><label>Revise this movie<input data-movie-revision placeholder="Make scene 7 more dramatic and move the camera closer."></label><div class="movie-revision-actions"><button type="button" data-movie-revise>Apply AI revision</button><button type="button" data-movie-undo>Undo</button><button type="button" data-movie-redo>Redo</button></div></div>`;
	const keterInput = orHost.querySelector("[data-movie-revision]");
	const keterUndo = orHost.querySelector("[data-movie-undo]");
	const keterRedo = orHost.querySelector("[data-movie-redo]");
	orHost.querySelector("[data-movie-revise]").addEventListener("click", async () => {
		if (!keterInput.value.trim()) return;
		orStatus("Applying focused revision…");
		try {
			await orState.revise(keterInput.value.trim());
			keterInput.value = "";
			orStatus("Revision applied. Undo remains available.");
		} catch (orError) {
			orStatus(`Revision error: ${orError.message}`);
		}
	});
	keterUndo.addEventListener("click", () => safeAction(() => orState.undo(), orStatus));
	keterRedo.addEventListener("click", () => safeAction(() => orState.redo(), orStatus));
	return orState.subscribe(orSnapshot => {
		keterUndo.disabled = !orSnapshot.canUndo;
		keterRedo.disabled = !orSnapshot.canRedo;
	});
}

function safeAction(orAction, orStatus) {
	try {
		orAction();
		orStatus("Movie history updated.");
	} catch (orError) {
		orStatus(orError.message);
	}
}
