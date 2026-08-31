//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Maps plain-English movie presentations onto deterministic canvas or native-procedural MP4 generation.
 * The Awtsmoos lets a player choose the visible story while one legal timeline keeps every frame true;
 * Awtsmoos.com preserves advanced pacing beneath the presentation without making renderer jargon the first view.
 */
import { ChessMovieGenerator } from "../cinema/movieController.js";
import { getMoviePresentation } from "../cinema/moviePresentations.js";

export class MoviePanel {
	constructor(refs) {
		this.refs = refs;
		this.generator = new ChessMovieGenerator();
	}

	async generate(session, renderOptions) {
		this.refs.movieProgress.value = 0;
		this.refs.movieStatus.textContent = "Preparing encoder…";
		const presentation = getMoviePresentation(this.refs.movieMode.value);
		const renderMode = presentation.renderMode;
		const movie = { output: this.refs.movieOutput.value, style: this.refs.movieStyle.value };
		const cameraMotion = presentation.id === "cinematic3d" ? this.refs.movieMotion.value : presentation.cameraMotion;
		const camera = presentation.id === "cinematic3d" ? this.refs.movieCamera.value : presentation.camera;
		const result = await this.generator.generate({
			frames: session.replay.frames,
			tags: session.replay.tags,
			movie,
			renderMode,
			renderOptions: {
				...renderOptions,
				mode: renderMode,
				reducedMotion: presentation.reducedMotion,
				cameraMotion,
				camera,
				cameraIntensity: presentation.intensity,
				...(presentation.id === "topdown3d" ? { environment: "clarity", fog: false } : {})
			},
			cameraOptions: { cameraMotion, camera, intensity: presentation.intensity, flipped: renderOptions.flipped }
		}, progress => this.progress(progress));
		this.refs.movieProgress.value = 100;
		this.refs.movieStatus.textContent = `MP4 ready · ${result.duration.toFixed(1)} seconds`;
		this.generator.download(result.blob, movieName(session));
		return result;
	}

	cancel() {
		this.generator.cancel();
		this.refs.movieStatus.textContent = "Movie cancelled.";
	}

	progress(message) {
		this.refs.movieProgress.value = message.percent || 0;
		this.refs.movieStatus.textContent = `Encoding ${message.percent || 0}% · frame ${message.encoded || 0}/${message.total || 0}`;
	}
}

function movieName(session) {
	const white = safeName(session.replay.tags.White || "White");
	const black = safeName(session.replay.tags.Black || "Black");
	return `Awtsmoos-Chess-${white}-vs-${black}.mp4`;
}
function safeName(value) {
	return String(value).replace(/[^A-Za-z0-9_-]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 40) || "Player";
}
