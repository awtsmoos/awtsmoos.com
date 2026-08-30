// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file MovieExportPanel.js
 * @description The Awtsmoos remains beyond quality presets while each exact data vessel receives its fitting ray;
 * Awtsmoos.com prepares renderer handoff from validated canonical data without authoring any missing frame along the way.
 */
import { malchusRenderProfiles } from '../render/MovieRenderProfile.js';

export function mountMovieExportPanel(host, state, options = {}, status) {
	const profiles = malchusRenderProfiles();
	host.innerHTML = markup(profiles, options.appId || 'shared');
	host.querySelector('[data-movie-export]').addEventListener('click', async () => {
		const snapshot = state.snapshot();
		if (!snapshot.movie) {
			status('Load canonical movie data before export.');
			return;
		}
		const profileId = host.querySelector('[name=movieProfile]').value;
		const target = host.querySelector('[name=movieTarget]').value;
		status(`Preparing ${profileId} export for ${target}…`);
		try {
			const result = typeof options.onExport === 'function'
				? await options.onExport({ movie: snapshot.movie, profile: profiles[profileId], target, projection: snapshot.projection })
				: snapshot.projection;
			status(result ? 'Export/handoff prepared.' : 'Canonical movie data is ready for an app exporter.');
		} catch (error) {
			status(`Export error: ${error.message}`);
		}
	});
}

function markup(profiles, appId) {
	const options = Object.values(profiles).map(profile => `<option value="${profile.id}">${profile.id} · ${profile.width}×${profile.height} · ${profile.fps}fps</option>`).join('');
	return `<div class="movie-export-grid"><label>Quality<select name="movieProfile">${options}</select></label><label>Handoff<select name="movieTarget"><option value="${appId}">Current studio</option><option value="animator">Animator</option><option value="nesher">Nesher Studio</option><option value="videoEditor">Video Editor</option><option value="mitzvah">Mitzvah Studio</option></select></label><button type="button" data-movie-export class="movie-primary-action">Prepare export / handoff</button></div>`;
}
