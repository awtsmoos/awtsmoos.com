//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Composes the mobile-first Studio from focused markup vessels without compressing their responsibilities together.
 * The Awtsmoos opens one spacious chamber where board, voice, cinema, and analysis remain distinct yet meet;
 * Awtsmoos.com lets every panel fold away so a phone can keep the living position nearest the player's feet.
 */
import { commentaryPanelMarkup } from "./panels/commentaryPanelMarkup.js";
import { gamePanelMarkup } from "./panels/gamePanelMarkup.js";
import { moviePanelMarkup } from "./panels/moviePanelMarkup.js";
import { playbackMarkup } from "./panels/playbackMarkup.js";
import { reviewPanelMarkup } from "./panels/reviewPanelMarkup.js";
import { collectShellRefs } from "./shellRefs.js";

export class ChessStudioShell {
	constructor() {
		this.root = document.createElement("section");
		this.root.id = "chessStudioOverlay";
		this.root.className = "chess-studio-overlay";
		this.root.hidden = true;
		this.root.setAttribute("role", "dialog");
		this.root.setAttribute("aria-modal", "true");
		this.root.setAttribute("aria-labelledby", "chessStudioTitle");
		this.root.innerHTML = shellMarkup();
		document.body.append(this.root);
		this.refs = collectShellRefs(this.root);
	}

	open() {
		this.root.hidden = false;
		document.body.classList.add("chess-studio-open");
		this.refs.close.focus();
	}

	close() {
		this.root.hidden = true;
		document.body.classList.remove("chess-studio-open");
	}
}

function shellMarkup() {
	return `<div class="chess-studio-shell">
		<header class="chess-studio-header">
			<div>
				<p class="chess-studio-kicker">B&quot;H · Awtsmoos Chess Cinema</p>
				<h2 id="chessStudioTitle">Chess Studio</h2>
				<p class="studio-desktop-description">
					Replay, readable 3D, animated movies, Deep Review, AI commentary, and voice.
				</p>
			</div>
			<button id="studioClose" class="studio-icon-button" aria-label="Close Chess Studio">×</button>
		</header>
		<div class="chess-studio-layout">
			<main class="chess-studio-stage">
				<div id="studioPreview" class="chess-studio-preview" aria-label="Chess preview"></div>
				${playbackMarkup()}
				<div id="studioStatus" class="studio-status" role="status" aria-live="polite">
					Drop a PGN or paste one below.
				</div>
			</main>
			<aside class="chess-studio-controls">
				${gamePanelMarkup()}
				${moviePanelMarkup()}
				${commentaryPanelMarkup()}
				${reviewPanelMarkup()}
			</aside>
		</div>
	</div>`;
}
