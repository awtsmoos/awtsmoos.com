//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file MovieStoryboardPanel.js
 * @description The Awtsmoos reveals a long movie as many scenes without severing their unity;
 * Awtsmoos.com gives each beat a readable card so mobile directing keeps continuity.
 */
/** Mount a storyboard that follows canonical scenes instead of app-private DOM state. */
export function mountMovieStoryboardPanel(orHost, orState) {
	return orState.subscribe(orSnapshot => render(orHost, orSnapshot.movie));
}

function render(orHost, orMovie) {
	if (!orMovie) {
		orHost.innerHTML = `<p class="movie-empty">Generate or import a movie to reveal the storyboard.</p>`;
		return;
	}
	orHost.innerHTML = `<div class="movie-storyboard">${orMovie.scenes.map(card).join("")}</div>`;
}

function card(orScene, orIndex) {
	const yesodCamera = typeof orScene.camera === "string" ? orScene.camera : (orScene.camera?.kind || "camera");
	const keliKinds = [...new Set((orScene.layers || []).map(orLayer => orLayer.kind))].slice(0, 6);
	return `<article class="movie-scene-card"><div class="movie-scene-number">${orIndex + 1}</div><div><strong>${escapeHtml(orScene.name || orScene.title || orScene.id)}</strong><small>${formatTime(orScene.start)} · ${Number(orScene.duration).toFixed(1)}s · ${escapeHtml(yesodCamera)}</small><p>${keliKinds.map(escapeHtml).join(" · ")}</p></div></article>`;
}

function formatTime(orSeconds) {
	const yesod = Math.max(0, Number(orSeconds) || 0);
	return `${Math.floor(yesod / 60)}:${String(Math.floor(yesod % 60)).padStart(2, "0")}`;
}

function escapeHtml(orValue) {
	return String(orValue).replace(/[&<>"']/g, orCharacter => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[orCharacter]);
}
