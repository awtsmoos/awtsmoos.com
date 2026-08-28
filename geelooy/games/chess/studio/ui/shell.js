//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Builds an accessible Chess Studio dialog for instant play, native procedural cinema, and engine review.
 * The Awtsmoos opens one spacious vessel for board, camera, cinema, and review;
 * Awtsmoos.com keeps every control named so keyboard, pointer, and touch may enter too.
 */
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
	return `
		<div class="chess-studio-shell">
			<header class="chess-studio-header">
				<div><p class="chess-studio-kicker">B&quot;H · Awtsmoos Chess Cinema</p><h2 id="chessStudioTitle">Chess Studio</h2><p>Instant PGN playback, 2D / 2.5D / Awtsmoos procedural 3D, real MP4 cinema, and deep engine review.</p></div>
				<button id="studioClose" class="studio-icon-button" aria-label="Close Chess Studio">×</button>
			</header>
			<div class="chess-studio-layout">
				<main class="chess-studio-stage"><div id="studioPreview" class="chess-studio-preview" aria-label="Chess preview"></div>${playbackMarkup()}<div id="studioStatus" class="studio-status" role="status" aria-live="polite">Drop a PGN or paste one below.</div></main>
				<aside class="chess-studio-controls">${gamePanel()}${moviePanel()}${reviewPanel()}</aside>
			</div>
		</div>`;
}

function playbackMarkup() {
	return `<div class="studio-playback"><button id="studioPrev" aria-label="Previous move">‹</button><button id="studioPlay">Play</button><button id="studioNext" aria-label="Next move">›</button><input id="studioTimeline" type="range" min="0" max="0" value="0" aria-label="Game timeline"><output id="studioMoveLabel">Starting position</output></div>`;
}

function gamePanel() {
	return `<details open><summary>Game & appearance</summary><div class="studio-panel-body"><label>PGN file<input id="studioFile" type="file" accept=".pgn,.txt"></label><label>PGN text<textarea id="studioPgn" rows="7" placeholder="1. e4 e5 2. Nf3 …"></textarea></label><button id="studioLoad" class="studio-primary">Load instantly</button><div class="studio-grid"><label>View<select id="studioMode"></select></label><label>Theme<select id="studioTheme"></select></label><label>Pieces<select id="studioCharacters"></select></label></div><div class="studio-checks"><label><input id="studioFlip" type="checkbox"> Flip board</label><label><input id="studioCoords" type="checkbox" checked> Coordinates</label><label><input id="studioArrow" type="checkbox" checked> Move arrow</label></div><div id="studioProceduralOptions" hidden></div></div></details>`;
}

function moviePanel() {
	return `<details><summary>Movie generator</summary><div class="studio-panel-body"><div class="studio-grid"><label>Render<select id="studioMovieMode"></select></label><label>Style<select id="studioMovieStyle"></select></label><label>Output<select id="studioMovieOutput"></select></label><label>Camera motion<select id="studioMovieMotion"></select></label><label>Camera angle<select id="studioMovieCamera"></select></label></div><p class="studio-hint">Choose flat, top-down, or native procedural 3D. Highlights, theme, pieces, and camera choreography are preserved.</p><div class="studio-actions"><button id="studioMovie" class="studio-primary">Generate real MP4</button><button id="studioMovieCancel">Cancel</button></div><progress id="studioMovieProgress" max="100" value="0"></progress><div id="studioMovieStatus" class="studio-status">Ready.</div></div></details>`;
}

function reviewPanel() {
	return `<details><summary>Deep Review · real engine + book</summary><div class="studio-panel-body"><label>Strength<select id="studioReviewStrength"></select></label><p class="studio-hint">Starts the production engine only when requested. Score loss, best move, PV, nodes, and book context are measured.</p><div class="studio-actions"><button id="studioReview" class="studio-primary">Run Deep Review</button><button id="studioReviewCancel">Cancel</button></div><div id="studioReviewStatus" class="studio-status">Engine asleep for fast loading.</div><div id="studioReviewResults"></div></div></details>`;
}

function collectRefs(root) {
	const ids = ["Close","Preview","Prev","Play","Next","Timeline","MoveLabel","Status","File","Pgn","Load","Mode","Theme","Characters","Flip","Coords","Arrow","ProceduralOptions","MovieMode","MovieStyle","MovieOutput","MovieMotion","MovieCamera","Movie","MovieCancel","MovieProgress","MovieStatus","ReviewStrength","Review","ReviewCancel","ReviewStatus","ReviewResults"];
	return Object.fromEntries(ids.map(id => [id[0].toLowerCase() + id.slice(1), root.querySelector(`#studio${id}`)]));
}
