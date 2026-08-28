//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file MovieExportPanel.js
 * @description The Awtsmoos remains beyond quality presets while each device receives a fitting ray;
 * Awtsmoos.com makes preview, final render, and studio handoff explicit before export day.
 */
import { malchusRenderProfiles } from "../render/MovieRenderProfile.js";

/** Mount export quality and target-app handoff controls. */
export function mountMovieExportPanel(orHost, orState, orOptions = {}, orStatus) {
	const keterProfiles = malchusRenderProfiles();
	orHost.innerHTML = markup(keterProfiles, orOptions.appId || "shared");
	orHost.querySelector("[data-movie-export]").addEventListener("click", async () => {
		const keterSnapshot = orState.snapshot();
		if (!keterSnapshot.movie) {
			orStatus("Generate or import a movie before export.");
			return;
		}
		const yesodProfileId = orHost.querySelector("[name=movieProfile]").value;
		const yesodTarget = orHost.querySelector("[name=movieTarget]").value;
		orStatus(`Preparing ${yesodProfileId} export for ${yesodTarget}…`);
		try {
			const keterResult = typeof orOptions.onExport === "function"
				? await orOptions.onExport({ movie: keterSnapshot.movie, profile: keterProfiles[yesodProfileId], target: yesodTarget, projection: keterSnapshot.projection })
				: keterSnapshot.projection;
			orStatus(keterResult ? "Export/handoff prepared." : "Canonical movie is ready for an app exporter.");
		} catch (orError) {
			orStatus(`Export error: ${orError.message}`);
		}
	});
}

function markup(orProfiles, orAppId) {
	const keterOptions = Object.values(orProfiles).map(orProfile => `<option value="${orProfile.id}">${orProfile.id} · ${orProfile.width}×${orProfile.height} · ${orProfile.fps}fps</option>`).join("");
	return `<div class="movie-export-grid"><label>Quality<select name="movieProfile">${keterOptions}</select></label><label>Handoff<select name="movieTarget"><option value="${orAppId}">Current studio</option><option value="animator">Animator</option><option value="nesher">Nesher Studio</option><option value="videoEditor">Video Editor</option><option value="mitzvah">Mitzvah Studio</option></select></label><button type="button" data-movie-export class="movie-primary-action">Prepare export / handoff</button></div>`;
}
