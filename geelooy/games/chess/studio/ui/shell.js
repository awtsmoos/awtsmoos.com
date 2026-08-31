//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Composes the mobile-first Chess Studio from small game, cinema, commentary, and review panels.
 * The Awtsmoos opens one spacious vessel where board and voice remain separate yet meet;
 * Awtsmoos.com lets each panel fold away so the phone can keep the living position near the player's feet.
 */
import { commentaryPanelMarkup } from "./panels/commentaryPanelMarkup.js";
import { gamePanelMarkup } from "./panels/gamePanelMarkup.js";
import { moviePanelMarkup } from "./panels/moviePanelMarkup.js";

export class ChessStudioShell {
	constructor() {
		this.root = document.createElement("section");
		Object.assign(this.root, { id: "chessStudioOverlay", className: "chess-studio-overlay", hidden: true });
		this.root.setAttribute("role", "dialog");
		this.root.setAttribute("aria-modal", "true");
		this.root.setAttribute("aria-labelledby", "chessStudioTitle");
		this.root.innerHTML = shellMarkup();
		document.body.append(this.root);
		this.refs = collectRefs(this.root);
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
	return `<div class="chess-studio-shell"><header class="chess-studio-header"><div><p class="chess-studio-kicker">B&quot;H · Awtsmoos Chess Cinema</p><h2 id="chessStudioTitle">Chess Studio</h2><p class="studio-desktop-description">Replay, readable 3D, animated movies, Deep Review, AI commentary, and voice.</p></div><button id="studioClose" class="studio-icon-button" aria-label="Close Chess Studio">×</button></header>
		<div class="chess-studio-layout"><main class="chess-studio-stage"><div id="studioPreview" class="chess-studio-preview" aria-label="Chess preview"></div>${playbackMarkup()}<div id="studioStatus" class="studio-status" role="status" aria-live="polite">Drop a PGN or paste one below.</div></main>
		<aside class="chess-studio-controls">${gamePanelMarkup()}${moviePanelMarkup()}${commentaryPanelMarkup()}${reviewPanelMarkup()}</aside></div></div>`;
}

function playbackMarkup() {
	return `<div class="studio-playback"><button id="studioPrev" aria-label="Previous move">‹</button><button id="studioPlay">Play</button><button id="studioNext" aria-label="Next move">›</button><input id="studioTimeline" type="range" min="0" max="0" value="0" aria-label="Game timeline"><output id="studioMoveLabel">Starting position</output></div>`;
}

function reviewPanelMarkup() {
	return `<details class="studio-panel"><summary>Deep Review · engine + book</summary><div class="studio-panel-body"><label>Strength<select id="studioReviewStrength"></select></label><p class="studio-help">The production engine wakes only when requested and reports measured loss, best move, PV, nodes, and book context.</p><div class="studio-action-row"><button id="studioReview" class="studio-primary" type="button">Run Deep Review</button><button id="studioReviewCancel" type="button">Cancel</button></div><div id="studioReviewStatus" class="studio-status">Engine asleep for fast loading.</div><div id="studioReviewResults"></div></div></details>`;
}

function collectRefs(root) {
	const ids = ["Close","Preview","Prev","Play","Next","Timeline","MoveLabel","Status","File","Pgn","Load","ViewQuick","Mode","CanvasStyle","Theme","Characters","Flip","Coords","Arrow","ProceduralOptions","MovieMode","MovieStyle","MovieOutput","MovieMotion","MovieCamera","Movie","MovieCancel","MovieProgress","MovieStatus","ReviewStrength","Review","ReviewCancel","ReviewStatus","ReviewResults","CommentaryPromptCopy","CommentaryImport","CommentaryPrompt","CommentaryJson","CommentaryStatus","CommentaryList","TtsProvider","TtsNote","TtsDocs","TtsCredentials","TtsEndpoint","TtsKey","TtsVoice","TtsModel","SpeakCurrent","SpeakAll","SpeakStop"];
	return Object.fromEntries(ids.map(id => [id[0].toLowerCase() + id.slice(1), root.querySelector(`#studio${id}`)]));
}
