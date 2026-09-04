//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Reveals mobile-first game controls with immediate 2D, readable native 3D, broadcast, and cinema first.
 * The Awtsmoos lets the board arrive clear before a finite menu asks how its garment was made;
 * Awtsmoos.com keeps PGN, contrast, motion, and optional depth close enough for one hand to trade.
 */
export function gamePanelMarkup() {
	return `<details class="studio-panel" open>
		<summary>Game &amp; look</summary>
		<div class="studio-panel-body">
			<div id="studioViewQuick" class="studio-view-quick" aria-label="Quick view presets">
				${quickButton("instant2d", "Instant 2D", "Fastest · no tween")}
				${quickButton("animated2d", "Animated 2D", "Pieces really move")}
				${quickButton("crisp2d", "Crisp 2D", "Highest contrast")}
				${quickButton("royal2d", "Royal 2D", "Characters · parchment")}
				${quickButton("framed2d", "Framed 2.5D", "Depth without camera")}
				${quickButton("topdown3d", "Top-down 3D", "Readable native depth")}
				${quickButton("readable3d", "Readable 3D", "Safe semantic camera")}
				${quickButton("broadcast3d", "Broadcast 3D", "Elevated sideline view")}
				${quickButton("cinema3d", "Cinema 3D", "Auto Director")}
			</div>
			<label>
				PGN file
				<input id="studioFile" type="file" accept=".pgn,.txt,text/plain">
			</label>
			<label>
				PGN text
				<textarea id="studioPgn" rows="6" placeholder="1. e4 e5 2. Nf3 …"></textarea>
			</label>
			<button id="studioLoad" class="studio-primary" type="button">Load game</button>
			<details class="studio-inline-advanced">
				<summary>More appearance options</summary>
				<div class="studio-field-grid">
					${selectField("View", "studioMode")}
					${selectField("Move preview", "studioPreviewMotion")}
					${selectField("2D board", "studioCanvasStyle")}
					${selectField("2D piece style", "studioCanvasPieceStyle")}
					${selectField("Theme", "studioTheme")}
					${selectField("Piece family", "studioCharacters")}
				</div>
			</details>
			<div id="studioProceduralOptions"></div>
			<div class="studio-toggle-row">
				${toggle("studioFlip", "Flip board")}
				${toggle("studioCoords", "Coordinates")}
				${toggle("studioArrow", "Move arrow")}
			</div>
		</div>
	</details>`;
}

function quickButton(id, name, note) {
	return `<button type="button" data-view-preset="${id}">${name}<small>${note}</small></button>`;
}

function selectField(label, id) {
	return `<label>${label}<select id="${id}"></select></label>`;
}

function toggle(id, label) {
	return `<label><input id="${id}" type="checkbox"> ${label}</label>`;
}
