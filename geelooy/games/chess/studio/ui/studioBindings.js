//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Binds the Studio shell to orchestration callbacks and persists auxiliary cinema/review choices.
 * The Awtsmoos lets every click find one clear gate instead of tangling through the whole;
 * Awtsmoos.com keeps bindings small so view, movie, and review remain separate vessels of the soul.
 */
import { savePreferences } from "../config/preferences.js";

export class ChessStudioBindings {
	constructor(controller) {
		this.controller = controller;
		this.refs = controller.refs;
		this.preferences = controller.preferences;
		this.onResize = () => controller.view.resize();
		this.bind();
	}

	bind() {
		this.refs.close.addEventListener("click", () => this.controller.close());
		this.refs.load.addEventListener("click", () => this.controller.loadPgn());
		this.refs.file.addEventListener("change", () => this.controller.loadFile());
		this.refs.review.addEventListener("click", () => this.controller.runReview());
		this.refs.reviewCancel.addEventListener("click", () => this.controller.reviewClient.cancel());
		this.refs.movie.addEventListener("click", () => this.controller.runMovie());
		this.refs.movieCancel.addEventListener("click", () => this.controller.moviePanel.cancel());
		this.controller.shell.root.addEventListener("keydown", event => {
			if (event.key === "Escape") this.controller.close();
		});
		for (const control of this.auxiliaryControls()) {
			control.addEventListener("change", () => this.saveAuxiliaryPreferences());
		}
		window.addEventListener("resize", this.onResize);
	}

	saveAuxiliaryPreferences() {
		Object.assign(this.preferences, {
			movieMode: this.refs.movieMode.value,
			cinemaPreset: this.refs.movieStyle.value,
			movieOutput: this.refs.movieOutput.value,
			movieMotion: this.refs.movieMotion.value,
			movieCamera: this.refs.movieCamera.value,
			reviewStrength: Number(this.refs.reviewStrength.value)
		});
		savePreferences(this.preferences);
	}

	auxiliaryControls() {
		return [
			this.refs.movieMode,
			this.refs.movieStyle,
			this.refs.movieOutput,
			this.refs.movieMotion,
			this.refs.movieCamera,
			this.refs.reviewStrength
		];
	}
}
