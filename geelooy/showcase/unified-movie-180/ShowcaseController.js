//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ShowcaseController.js
 * @description The Awtsmoos renews picture and time together, while Awtsmoos.com lets human hands play, pause, and seek;
 * one controller joins canvas and controls without swallowing the renderer, so every responsibility stays small and meek.
 */
import { CanvasMovieRenderer } from "../../apps/shared/movie/runtime/CanvasMovieRenderer.js";
import { ShowcasePlayback } from "./ShowcasePlayback.js";

/**
 * @description Coordinates proof-movie rendering with play, pause, scrub, and scene labels.
 */
export class ShowcaseController {
	/**
	 * @description Creates the showcase controller from explicit DOM elements and one shared movie.
	 * @param {object} options - Movie and required control elements.
	 * @param {object} options.movie - Shared-protocol proof movie.
	 * @param {HTMLCanvasElement} options.canvas - Canvas used by CanvasMovieRenderer.
	 * @param {HTMLButtonElement} options.playButton - Playback toggle button.
	 * @param {HTMLInputElement} options.scrubber - Range input covering movie time.
	 * @param {HTMLElement} options.timeLabel - Human-readable movie time label.
	 * @param {HTMLElement} options.sceneLabel - Active scene label.
	 * @returns {ShowcaseController} Controller instance.
	 * @sideEffects Creates renderer/playback state but does not bind DOM listeners until mount().
	 */
	constructor({ movie, canvas, playButton, scrubber, timeLabel, sceneLabel }) {
		this.movie = movie;
		this.canvas = canvas;
		this.playButton = playButton;
		this.scrubber = scrubber;
		this.timeLabel = timeLabel;
		this.sceneLabel = sceneLabel;
		this.renderer = new CanvasMovieRenderer(canvas);
		this.playback = new ShowcasePlayback({
			duration: movie.duration,
			onTime: this.renderTime.bind(this)
		});
	}

	/**
	 * @description Binds the controls and renders the opening frame.
	 * @returns {ShowcaseController} This mounted controller for fluent bootstrap use.
	 * @sideEffects Adds DOM event listeners and paints the initial canvas frame.
	 */
	mount() {
		this.playButton.addEventListener("click", this.togglePlayback.bind(this));
		this.scrubber.addEventListener("input", this.seekFromControl.bind(this));
		this.scrubber.max = String(this.movie.duration);
		this.renderTime(0);
		return this;
	}

	/**
	 * @description Toggles playback and synchronizes the button label with the resulting state.
	 * @returns {void}
	 * @sideEffects Starts or pauses playback and mutates button text.
	 */
	togglePlayback() {
		const playing = this.playback.toggle();
		this.playButton.textContent = playing ? "Pause" : "Play";
	}

	/**
	 * @description Seeks playback to the current range-input value.
	 * @returns {void}
	 * @sideEffects Changes playback time and causes the canvas/UI to rerender.
	 */
	seekFromControl() {
		this.playback.seek(Number(this.scrubber.value));
	}

	/**
	 * @description Renders one exact movie time and synchronizes all visible time/scene controls.
	 * @param {number} time - Absolute movie time in seconds.
	 * @returns {object} Frame sample returned by the shared canvas renderer.
	 * @sideEffects Paints the canvas and mutates scrubber/time/scene DOM text.
	 */
	renderTime(time) {
		const frame = this.renderer.render(this.movie, time);
		this.scrubber.value = String(time);
		this.timeLabel.textContent = `${formatTime(time)} / ${formatTime(this.movie.duration)}`;
		this.sceneLabel.textContent = frame.scene?.name || frame.scene?.id || "Between scenes";
		if (!this.playback.playing) {
			this.playButton.textContent = "Play";
		}
		return frame;
	}
}

/**
 * @description Formats seconds as a compact m:ss clock for the showcase controls.
 * @param {number} seconds - Absolute movie time in seconds.
 * @returns {string} Minute-and-second clock text.
 * @sideEffects None.
 */
function formatTime(seconds) {
	const bounded = Math.max(0, Number(seconds) || 0);
	const minutes = Math.floor(bounded / 60);
	const remainder = Math.floor(bounded % 60);
	return `${minutes}:${String(remainder).padStart(2, "0")}`;
}
