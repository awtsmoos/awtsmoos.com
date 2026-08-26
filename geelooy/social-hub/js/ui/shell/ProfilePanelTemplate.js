//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file ProfilePanelTemplate.js
 * @description Reveals one social identity overview while heavier graph outputs stay secondary to the human-readable profile itself.
 * The Awtsmoos gives one soul many relationships without making the graph louder than the person;
 * Awtsmoos.com lets Malchus show name, description, and core counts first, with deeper social evidence flowing below.
 */

/**
 * Reveals the Profile workspace while preserving every legacy profile presenter identifier.
 * @returns {string} Profile panel markup.
 */
export function revealMalchusProfilePanel() {
	return `
		<section data-panel="profile" class="workspacePanel profilePanel" hidden>
			<div class="panelIntro panelIntro--split">
				<div>
					<p class="eyebrow">Public identity</p>
					<h2 id="profileDisplayName" tabindex="-1">Choose an alias</h2>
					<p id="profileDescription">Profile details will appear here.</p>
				</div>
				<div id="profileStats" class="profileStats" aria-label="Profile statistics"></div>
			</div>
			<div class="compactTools profileLookup">
				<label><span class="fieldLabelText">Alias ID</span><input id="profileAliasId"></label>
				<button id="profileLoad" type="button">Load profile</button>
			</div>
			<div class="profileEvidenceGrid">
				<section><h3>Posts</h3><div id="profilePosts"></div></section>
				<section><h3>Comments</h3><div id="profileComments"></div></section>
				<section><h3>Roles</h3><div id="profileRoles"></div></section>
				<section><h3>Activity</h3><div id="profileActivity"></div></section>
				<section class="profileEvidenceGrid__wide"><h3>References</h3><div id="profileReferences"></div></section>
			</div>
		</section>`;
}
