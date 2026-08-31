//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Reveals mobile-first game controls with four immediate visual outcomes before technical selectors.
 * The Awtsmoos lets the board arrive readable before a finite menu asks how it was made;
 * Awtsmoos.com keeps PGN, quick sight, and advanced garments close enough for one hand to trade.
 */
export function gamePanelMarkup() {
	return `<details class="studio-panel" open><summary>Game &amp; look</summary><div class="studio-panel-body">
		<div id="studioViewQuick" class="studio-view-quick" aria-label="Quick view presets">
			<button type="button" data-view-preset="crisp2d">Crisp 2D<small>Fast &amp; clear</small></button>
			<button type="button" data-view-preset="framed2d">Framed 2.5D<small>Depth without camera</small></button>
			<button type="button" data-view-preset="topdown3d">Top-down 3D<small>Readable native depth</small></button>
			<button type="button" data-view-preset="cinema3d">Cinema 3D<small>Safe Auto Director</small></button>
		</div>
		<label>PGN file<input id="studioFile" type="file" accept=".pgn,.txt,text/plain"></label>
		<label>PGN text<textarea id="studioPgn" rows="6" placeholder="1. e4 e5 2. Nf3 …"></textarea></label>
		<button id="studioLoad" class="studio-primary" type="button">Load game</button>
		<details class="studio-inline-advanced"><summary>More appearance options</summary><div class="studio-field-grid">
			<label>View<select id="studioMode"></select></label><label>2D look<select id="studioCanvasStyle"></select></label>
			<label>Theme<select id="studioTheme"></select></label><label>Pieces<select id="studioCharacters"></select></label>
		</div></details>
		<div id="studioProceduralOptions"></div>
		<div class="studio-toggle-row"><label><input id="studioFlip" type="checkbox"> Flip board</label><label><input id="studioCoords" type="checkbox"> Coordinates</label><label><input id="studioArrow" type="checkbox"> Move arrow</label></div>
	</div></details>`;
}
