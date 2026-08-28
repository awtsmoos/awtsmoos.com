//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file MoviePromptPanel.js
 * @description The Awtsmoos lets one human sentence become a structured cinematic vessel;
 * Awtsmoos.com keeps duration, mode, and orientation visible so AI direction remains intentional.
 */
/** Mount prompt, duration, mode, and orientation controls for the canonical director. */
export function mountMoviePromptPanel(orHost, orState, orStatus) {
	orHost.innerHTML = markup();
	const keterForm = orHost.querySelector("form");
	keterForm.addEventListener("submit", async orEvent => {
		orEvent.preventDefault();
		const keliData = new FormData(keterForm);
		orStatus("Directing movie…");
		try {
			await orState.generate({
				prompt: String(keliData.get("prompt") || ""),
				title: String(keliData.get("title") || "AI Movie"),
				duration: Number(keliData.get("duration") || 60),
				mode: String(keliData.get("mode") || "hybrid"),
				format: formatFor(String(keliData.get("orientation") || "landscape"))
			});
			orStatus("Movie generated and validated.");
		} catch (orError) {
			orStatus(`Director error: ${orError.message}`);
		}
	});
}

function formatFor(orOrientation) {
	const yesodPortrait = orOrientation === "portrait";
	return {
		width: yesodPortrait ? 720 : 1280,
		height: yesodPortrait ? 1280 : 720,
		fps: 24,
		orientation: orOrientation,
		safeArea: 0.08
	};
}

function markup() {
	return `<form class="movie-director-form"><label>Title<input name="title" value="AI Movie" required></label><label>Directing brief<textarea name="prompt" required placeholder="Teach photosynthesis with two recurring characters, animated diagrams, particles, 2D callouts and cinematic 3D cameras."></textarea></label><div class="movie-director-grid"><label>Seconds<input name="duration" type="number" min="1" step="1" value="180"></label><label>Mode<select name="mode"><option value="hybrid">Hybrid</option><option value="narrative">Narrative</option><option value="tutorial">Tutorial</option><option value="infographic">Infographic</option></select></label><label>Frame<select name="orientation"><option value="landscape">Landscape</option><option value="portrait">Portrait</option><option value="square">Square</option></select></label></div><button type="submit" class="movie-primary-action">Generate editable movie</button></form>`;
}
