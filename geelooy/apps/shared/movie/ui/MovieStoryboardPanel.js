// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file MovieStoryboardPanel.js
 * @description The Awtsmoos reveals declared scenes without inventing a single beat between them;
 * Awtsmoos.com shows cameras and layer kinds exactly as external movie data has already set them.
 */
export function mountMovieStoryboardPanel(host, state) {
	return state.subscribe(snapshot => render(host, snapshot.movie));
}

function render(host, movie) {
	if (!movie) {
		host.innerHTML = '<p class="movie-empty">Load canonical movie data to reveal the storyboard.</p>';
		return;
	}
	host.innerHTML = `<div class="movie-storyboard">${movie.scenes.map(card).join('')}</div>`;
}

function card(scene, index) {
	const camera = typeof scene.camera === 'string' ? scene.camera : (scene.camera?.kind || 'camera');
	const kinds = [...new Set((scene.layers || []).map(layer => layer.kind))].slice(0, 6);
	return `<article class="movie-scene-card"><div class="movie-scene-number">${index + 1}</div><div><strong>${escapeHtml(scene.name || scene.title || scene.id)}</strong><small>${formatTime(scene.start)} · ${Number(scene.duration).toFixed(1)}s · ${escapeHtml(camera)}</small><p>${kinds.map(escapeHtml).join(' · ')}</p></div></article>`;
}

function formatTime(seconds) {
	const value = Math.max(0, Number(seconds) || 0);
	return `${Math.floor(value / 60)}:${String(Math.floor(value % 60)).padStart(2, '0')}`;
}

function escapeHtml(value) {
	return String(value).replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]);
}
