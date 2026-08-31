//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Gives AI commentary and narration a portable, provider-neutral home inside Chess Studio.
 * The Awtsmoos lets words surround each move without replacing the move;
 * Awtsmoos.com keeps prompts, imported JSON, and session-only voice credentials in one truthful groove.
 */
export function commentaryPanelMarkup() {
	return `<details class="studio-panel studio-commentary-panel">
		<summary>AI commentary &amp; voice</summary>
		<div class="studio-panel-body">
			<p class="studio-help">Copy the prompt into any AI agent. Paste its JSON answer back here; Studio checks every ply and SAN before using it.</p>
			<div class="studio-action-row">
				<button id="studioCommentaryPromptCopy" type="button">Copy AI prompt</button>
				<button id="studioCommentaryImport" type="button">Validate &amp; import</button>
			</div>
			<label>AI prompt<textarea id="studioCommentaryPrompt" rows="7" readonly></textarea></label>
			<label>Commentary JSON<textarea id="studioCommentaryJson" rows="9" placeholder='{"version":"awtsmoos-chess-commentary-v1","moves":[]}'></textarea></label>
			<p id="studioCommentaryStatus" class="studio-help" aria-live="polite">No commentary imported.</p>
			<div id="studioCommentaryList" class="studio-commentary-list"></div>
			<hr>
			<label>Voice provider<select id="studioTtsProvider"></select></label>
			<p id="studioTtsNote" class="studio-help"></p>
			<a id="studioTtsDocs" target="_blank" rel="noreferrer">Provider setup instructions ↗</a>
			<div id="studioTtsCredentials" class="studio-tts-credentials">
				<label>Endpoint / proxy URL<input id="studioTtsEndpoint" type="url" autocomplete="off" placeholder="Optional provider endpoint"></label>
				<label>API key · session only<input id="studioTtsKey" type="password" autocomplete="off"></label>
				<label>Voice / voice ID<input id="studioTtsVoice" type="text" autocomplete="off"></label>
				<label>Model<input id="studioTtsModel" type="text" autocomplete="off"></label>
			</div>
			<div class="studio-action-row">
				<button id="studioSpeakCurrent" type="button">Speak current</button>
				<button id="studioSpeakAll" type="button">Speak all</button>
				<button id="studioSpeakStop" type="button">Stop</button>
			</div>
		</div>
	</details>`;
}
