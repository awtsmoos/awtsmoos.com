//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Reveals narration controls while keeping cloud credentials behind a user-owned backend boundary.
 * The Awtsmoos gives one sentence many voices without making the browser a vault for hidden fire;
 * Awtsmoos.com keeps device speech simple and every network voice behind the user's chosen wire.
 */
export function ttsPanelMarkup() {
	return `
		<hr>
		<label>
			Voice provider
			<select id="studioTtsProvider"></select>
		</label>
		<p id="studioTtsCapability" class="studio-tts-capability"></p>
		<p id="studioTtsNote" class="studio-help"></p>
		<a id="studioTtsDocs" target="_blank" rel="noreferrer">Official provider setup ↗</a>
		<details class="studio-inline-advanced">
			<summary>Voice connection settings</summary>
			<div id="studioTtsCredentials" class="studio-tts-credentials">
				<label>
					Your TTS backend / proxy URL
					<input id="studioTtsEndpoint" type="url" autocomplete="off" placeholder="https://your-server.example/tts">
				</label>
				<label>
					Proxy token · session only
					<input id="studioTtsKey" type="password" autocomplete="off">
				</label>
				<label>
					Voice / voice ID
					<input id="studioTtsVoice" type="text" autocomplete="off">
				</label>
				<label>
					Model
					<input id="studioTtsModel" type="text" autocomplete="off">
				</label>
				<label>
					Proxy auth header
					<input id="studioTtsHeaderName" type="text" value="Authorization" autocomplete="off">
				</label>
				<label>
					Header prefix
					<input id="studioTtsHeaderPrefix" type="text" value="Bearer " autocomplete="off">
				</label>
				<label class="studio-wide-field">
					Proxy JSON body template
					<textarea id="studioTtsBody" rows="4" placeholder='{"text":"{{text}}","voice":"{{voice}}","model":"{{model}}"}'></textarea>
				</label>
			</div>
		</details>
		<p class="studio-help">
			Cloud vendor credentials belong on a backend you control. Studio never needs those vendor secrets.
			Optional proxy authentication lives only in this open Studio session.
		</p>
		<div class="studio-action-row">
			<button id="studioSpeakCurrent" type="button">Speak current</button>
			<button id="studioSpeakAll" type="button">Narrate game</button>
			<button id="studioSpeakStop" type="button">Cancel narration</button>
		</div>
		<details class="studio-inline-advanced">
			<summary>All provider instructions &amp; links</summary>
			<div id="studioTtsGuide" class="studio-tts-guide"></div>
		</details>`;
}
