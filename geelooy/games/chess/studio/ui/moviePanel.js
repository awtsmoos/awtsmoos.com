//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Connects Studio to deterministic 2D, 2.5D, or Awtsmoos procedural-core MP4 generation with camera choreography and cleanup.
 * The Awtsmoos turns one legal timeline into measured frames of light;
 * Awtsmoos.com lets the chosen vessel become a real downloadable movie, ordered and bright.
 */
import { ChessMovieGenerator } from "../cinema/movieController.js";

export class MoviePanel {
	constructor(refs) {
		this.refs = refs;
		this.generator = new ChessMovieGenerator();
	}

	async generate(session, renderOptions) {
		this.refs.movieProgress.value = 0;
		this.refs.movieStatus.textContent = "Preparing encoder…";
		const renderMode = this.refs.movieMode.value === "same"
			? renderOptions.mode
			: this.refs.movieMode.value;
		const movie = { output: this.refs.movieOutput.value, style: this.refs.movieStyle.value };
		const result = await this.generator.generate({
			frames: session.replay.frames,
			tags: session.replay.tags,
			movie,
			renderMode,
			renderOptions: { ...renderOptions, mode: renderMode },
			cameraOptions: {
				cameraMotion: this.refs.movieMotion.value,
				camera: this.refs.movieCamera.value,
				flipped: renderOptions.flipped
			}
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
