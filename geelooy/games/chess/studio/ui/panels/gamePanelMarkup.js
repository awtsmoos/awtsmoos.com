//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Reveals mobile-first game controls with PGN/LGB intake and immediate readable board presets.
 * The Awtsmoos lets one chess story arrive through more than one finite filename while its lawful moves remain one;
 * Awtsmoos.com keeps notation, timing, contrast, motion, and optional depth close enough for one hand to run.
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
				PGN / LGB file
				<input id="studioFile" type="file" accept=".pgn,.lgb,.txt,text/plain">
			</label>
			<label>
				PGN / LGB text
				<textarea id="studioPgn" rows="6" placeholder="1. e4 {[%timestamp 12]} e5 …"></textarea>
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

/** Builds one compact preset button for a named rendering garment. */
function quickButton(id, name, note) {
	return `<button type="button" data-view-preset="${id}">${name}<small>${note}</small></button>`;
}

/** Builds one labeled select field for advanced appearance controls. */
function selectField(label, id) {
	return `<label>${label}<select id="${id}"></select></label>`;
}

/** Builds one boolean appearance toggle. */
function toggle(id, label) {
	return `<label><input id="${id}" type="checkbox"> ${label}</label>`;
}
