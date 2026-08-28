//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Orchestrates Chess Studio while playback, rendering, cinema, review, and bindings remain separate vessels.
 * The Awtsmoos joins timeline, sight, cinema, and wisdom without making them one tangled thing;
 * Awtsmoos.com lets each vessel wake only when the player's present purpose calls it to sing.
 */
import { loadPreferences } from "./config/preferences.js";
import { ChessReviewClient } from "./engine/reviewClient.js";
import { ChessStudioSession } from "./session.js";
import { populateStudioCatalogs } from "./ui/catalogs.js";
import { MoviePanel } from "./ui/moviePanel.js";
import { ChessPlaybackController } from "./ui/playbackController.js";
import { ReviewPanel } from "./ui/reviewPanel.js";
import { ChessStudioBindings } from "./ui/studioBindings.js";
import { ChessStudioShell } from "./ui/shell.js";
import { ChessViewController } from "./ui/viewController.js";

export class ChessStudioController {
	constructor() {
		this.shell = new ChessStudioShell();
		this.refs = this.shell.refs;
		this.preferences = loadPreferences();
		this.session = new ChessStudioSession();
		populateStudioCatalogs(this.refs, this.preferences);
		this.reviewClient = new ChessReviewClient();
		this.reviewPanel = new ReviewPanel(this.refs.reviewStatus, this.refs.reviewResults);
		this.moviePanel = new MoviePanel(this.refs);
		this.view = new ChessViewController(this.refs, this.preferences, message => this.setStatus(message));
		this.playback = new ChessPlaybackController(this.session, this.refs, {
			onFrame: frame => this.view.render(frame),
			onTransition: (before, after, duration) => this.view.renderTransition(before, after, duration),
			onCancel: () => this.view.cancelTransition(),
			onError: error => this.setStatus(`Playback error: ${error.message}`)
		});
		this.bindings = new ChessStudioBindings(this);
	}

	async open() {
		this.shell.open();
		this.view.resize();
		await this.view.render(this.session.currentFrame);
	}

	close() {
		this.playback.stop();
		this.shell.close();
	}

	loadPgn() {
		const started = performance.now();
		try {
			this.session.load(this.refs.pgn.value);
			this.playback.reset().catch(error => this.setStatus(`Playback error: ${error.message}`));
			this.reviewPanel.clear("Engine asleep for fast loading.");
			this.setStatus(`Loaded ${this.session.totalPlies} plies in ${Math.round(performance.now() - started)}ms.`);
		} catch (error) {
			this.setStatus(`PGN error: ${error.message}`);
		}
	}

	async runReview() {
		if (!this.refs.pgn.value.trim()) {
			this.setStatus("Load a PGN before Deep Review.");
			return;
		}
		this.reviewPanel.clear("Waking production engine…");
		try {
			const review = await this.reviewClient.review(
				this.refs.pgn.value,
				Number(this.refs.reviewStrength.value),
				message => this.reviewPanel.progress(message)
			);
			this.reviewPanel.render(review);
		} catch (error) {
			this.reviewPanel.clear(error.message);
		}
	}

	async runMovie() {
		if (!this.session.totalPlies) {
			this.setStatus("Load a PGN before generating a movie.");
			return;
		}
		try {
			await this.moviePanel.generate(this.session, this.view.renderOptions());
		} catch (error) {
			this.refs.movieStatus.textContent = error.message;
		}
	}

	async loadFile() {
		const file = this.refs.file.files?.[0];
		if (!file) return;
		this.refs.pgn.value = await file.text();
		this.loadPgn();
	}

	setStatus(message) {
		this.refs.status.textContent = message;
	}
}
