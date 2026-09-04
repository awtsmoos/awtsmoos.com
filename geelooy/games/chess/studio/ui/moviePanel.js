//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Maps plain-English movie presentations onto deterministic canvas or native-procedural MP4 generation with useful ETA.
 * The Awtsmoos lets a game wear many cinematic garments while one legal timeline keeps every exported move true;
 * Awtsmoos.com keeps renderer jargon below the surface and gives the waiting player honest progress through the view.
 */
import { ChessMovieGenerator } from "../cinema/movieController.js";
import { getMoviePresentation } from "../cinema/moviePresentations.js";
import { estimateMovieEta, formatMovieEta } from "./movieProgress.js";

export class MoviePanel {
	constructor(refs) {
		this.refs = refs;
		this.generator = new ChessMovieGenerator();
		this.startedAt = NaN;
	}

	async generate(session, renderOptions) {
		this.startedAt = performance.now();
		this.refs.movieProgress.value = 0;
		this.refs.movieStatus.textContent = "Preparing encoder…";
		const presentation = getMoviePresentation(this.refs.movieMode.value);
		const renderMode = presentation.renderMode;
		const movie = { output: this.refs.movieOutput.value, style: this.refs.movieStyle.value };
		const customizable = presentation.id === "cinematic3d";
		const cameraMotion = customizable ? this.refs.movieMotion.value : presentation.cameraMotion;
		const camera = customizable ? this.refs.movieCamera.value : presentation.camera;
		const aspectRatio = movieAspect(this.refs.movieOutput);
		const result = await this.generator.generate({
			frames: session.replay.frames,
			tags: session.replay.tags,
			movie,
			renderMode,
			renderOptions: presentationRenderOptions(presentation, renderMode, cameraMotion, camera, renderOptions),
			cameraOptions: { cameraMotion, camera, intensity: presentation.intensity, flipped: renderOptions.flipped, aspectRatio }
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
		const percent = message.percent || 0;
		this.refs.movieProgress.value = percent;
		const eta = formatMovieEta(estimateMovieEta(this.startedAt, percent));
		this.refs.movieStatus.textContent = `Encoding ${percent}% · frame ${message.encoded || 0}/${message.total || 0} · ${eta}`;
	}
}

function presentationRenderOptions(presentation, renderMode, cameraMotion, camera, renderOptions) {
	const clarity3d = ["topdown3d", "broadcast3d"].includes(presentation.id);
	return {
		...renderOptions,
		mode: renderMode,
		reducedMotion: presentation.reducedMotion,
		cameraMotion,
		camera,
		cameraIntensity: presentation.intensity,
		...(clarity3d ? { environment: "clarity", fog: false } : {})
	};
}

function movieAspect(select) {
	const text = select.selectedOptions?.[0]?.textContent || "";
	if (/Vertical/i.test(text)) return 9 / 16;
	if (/Square/i.test(text)) return 1;
	return 16 / 9;
}

function movieName(session) {
	const white = safeName(session.replay.tags.White || "White");
	const black = safeName(session.replay.tags.Black || "Black");
	return `Awtsmoos-Chess-${white}-vs-${black}.mp4`;
}

function safeName(value) {
	return String(value).replace(/[^A-Za-z0-9_-]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 40) || "Player";
}
