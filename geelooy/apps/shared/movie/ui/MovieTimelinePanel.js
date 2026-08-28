//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file MovieTimelinePanel.js
 * @description The Awtsmoos holds all moments at once while editors travel them in sequence;
 * Awtsmoos.com shows canonical timing cards so every specialized NLE can inherit the same consequence.
 */
/** Mount a semantic mobile timeline without pretending to replace specialized NLE tools. */
export function mountMovieTimelinePanel(orHost, orState) {
	return orState.subscribe(orSnapshot => render(orHost, orSnapshot.movie));
}

function render(orHost, orMovie) {
	if (!orMovie) {
		orHost.innerHTML = `<p class="movie-empty">No canonical timeline yet.</p>`;
		return;
	}
	const yesodDuration = Math.max(0.001, Number(orMovie.duration) || 0.001);
	orHost.innerHTML = `<div class="movie-timeline-ruler">0s <span>${Math.round(yesodDuration / 2)}s</span> ${Math.round(yesodDuration)}s</div><div class="movie-timeline-track">${orMovie.scenes.map(orScene => block(orScene, yesodDuration)).join("")}</div><div class="movie-timeline-list">${orMovie.scenes.map(row).join("")}</div>`;
}

function block(orScene, orDuration) {
	const yesodLeft = Math.max(0, Number(orScene.start || 0) / orDuration * 100);
	const yesodWidth = Math.max(0.8, Number(orScene.duration || 0) / orDuration * 100);
	return `<button type="button" class="movie-timeline-block" style="--movie-left:${yesodLeft}%;--movie-width:${yesodWidth}%" title="${escapeHtml(orScene.name || orScene.id)}"></button>`;
}

function row(orScene, orIndex) {
	return `<div class="movie-timeline-row"><strong>${orIndex + 1}. ${escapeHtml(orScene.name || orScene.id)}</strong><span>${Number(orScene.start || 0).toFixed(1)}s → ${(Number(orScene.start || 0) + Number(orScene.duration || 0)).toFixed(1)}s</span></div>`;
}

function escapeHtml(orValue) {
	return String(orValue).replace(/[&<>"']/g, orCharacter => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[orCharacter]);
}
