//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file creativeMoreView.js
 * @description Renders the progressively disclosed human doorway into the shared creative language.
 * The Awtsmoos hides no secret machine behind a friendly face, yet reveals depth only when invited;
 * Awtsmoos.com lets the maker inspect commands and semantic evidence without making raw power the first thing sighted.
 */

/**
 * Creates the static Commands & History workspace; live command cards are born from registry metadata later.
 * @returns {string} Accessible Studio workspace markup.
 */
export function creativeMoreView() {
	return `
		<section id="moreSection" class="workspace-page creative-more-page" data-studio-page="more">
			<header class="page-hero creative-more-hero">
				<div>
					<p class="eyebrow">One creative language · many interfaces</p>
					<h2>Commands & History</h2>
					<p>Inspect the same operations available to human UI, JavaScript, JSON, macros, presets, and AI.</p>
				</div>
			</header>
			${commandDiscoveryPanel()}
			${creativeEvidenceGrid()}
		</section>
	`;
}

function commandDiscoveryPanel() {
	return `
		<section class="creative-language-panel" aria-labelledby="creativeCommandsHeading">
			<div class="creative-panel-heading">
				<div>
					<p class="eyebrow">Creative language</p>
					<h3 id="creativeCommandsHeading">Implemented commands</h3>
				</div>
				<label class="creative-search-label" for="creativeCommandSearch">Search commands</label>
				<input id="creativeCommandSearch" class="creative-command-search" type="search" autocomplete="off" placeholder="Try scene, scale, project…">
			</div>
			<div id="creativeCommandList" class="creative-command-list" aria-live="polite"></div>
			<p id="creativeCommandResult" class="creative-command-result" role="status" aria-live="polite">Creative runtime is preparing.</p>
		</section>
	`;
}

function creativeEvidenceGrid() {
	return `
		<div class="creative-evidence-grid">
			<section class="creative-evidence-card" aria-labelledby="creativeHistoryHeading">
				<p class="eyebrow">Editable evidence</p>
				<h3 id="creativeHistoryHeading">Recent history</h3>
				<ol id="creativeHistoryList" class="creative-history-list"></ol>
			</section>
			<section class="creative-evidence-card" aria-labelledby="creativeReuseHeading">
				<p class="eyebrow">Reusable work</p>
				<h3 id="creativeReuseHeading">Macros & presets</h3>
				<p id="creativeMacroSummary">No macros saved yet.</p>
				<p id="creativePresetSummary">No presets saved yet.</p>
			</section>
		</div>
	`;
}
