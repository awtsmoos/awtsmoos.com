//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Gives any AI agent a strict commentary doorway before narration receives its separate vessel.
 * The Awtsmoos lets JSON and PGN carry explanation without moving one legal stone;
 * Awtsmoos.com makes validate, import, clear, and export visible before advanced voice settings are shown.
 */
import { ttsPanelMarkup } from "./ttsPanelMarkup.js";

export function commentaryPanelMarkup() {
	return `<details class="studio-panel studio-commentary-panel">
		<summary>AI commentary &amp; voice</summary>
		<div class="studio-panel-body">
			<ol class="studio-commentary-steps">
				<li>Choose a style and output format.</li>
				<li>Copy the exact-PGN prompt into any AI agent.</li>
				<li>Paste its JSON or annotated PGN, validate, then import.</li>
				<li>Choose browser speech or your own TTS backend.</li>
			</ol>
			<div class="studio-field-grid">
				<label>
					Commentary personality
					<select id="studioCommentaryPreset"></select>
				</label>
				<label>
					AI output format
					<select id="studioCommentaryFormat">
						<option value="json">Awtsmoos JSON · timing + titles</option>
						<option value="pgn">Annotated PGN · portable braces</option>
					</select>
				</label>
			</div>
			<label>
				Directions you can edit
				<textarea id="studioCommentaryInstructions" rows="3" placeholder="Explain plans, tactics, and turning points for my audience."></textarea>
			</label>
			<button id="studioCommentaryPromptCopy" class="studio-primary" type="button">
				Copy exact PGN + AI prompt
			</button>
			<details class="studio-inline-advanced">
				<summary>Preview generated AI prompt</summary>
				<label>
					Generated prompt
					<textarea id="studioCommentaryPrompt" rows="7" readonly></textarea>
				</label>
			</details>
			<label>
				Paste AI commentary
				<textarea id="studioCommentaryJson" rows="8" placeholder='{"version":"awtsmoos-chess-commentary-v1","pgn":"...","moves":[]}'></textarea>
			</label>
			<div class="studio-action-row">
				<button id="studioCommentaryValidate" type="button">Validate</button>
				<button id="studioCommentaryImport" class="studio-primary" type="button">Import</button>
				<button id="studioCommentaryClear" type="button">Clear</button>
			</div>
			<p id="studioCommentaryStatus" class="studio-help" aria-live="polite">No commentary imported.</p>
			<div class="studio-action-row studio-export-row">
				<button id="studioCommentaryExportJson" type="button">Export JSON</button>
				<button id="studioCommentaryExportPgn" type="button">Annotated PGN</button>
				<button id="studioCommentaryExportSidecar" type="button">Narration sidecar</button>
			</div>
			<div id="studioCommentaryList" class="studio-commentary-list"></div>
			${ttsPanelMarkup()}
		</div>
	</details>`;
}
