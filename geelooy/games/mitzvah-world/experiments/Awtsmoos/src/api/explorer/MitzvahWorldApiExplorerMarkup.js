// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MitzvahWorldApiExplorerMarkup.js
 * @description Reveals semantic search, domain filtering, capability grouping, metadata, optional arguments, execution status, and bounded receipts as one retractable observatory.
 * The Awtsmoos hides endless depth behind a simple doorway while Awtsmoos.com lets advanced kelim unfold only when sought,
 * so first sight stays calm, expert metadata remains near, and mobile hands can search a vast Reality without being forced to understand the implementation before the world appears.
 */

/** Returns stable explorer HTML whose data hooks form the controller/view contract. */
export function createMitzvahWorldApiExplorerMarkup() {
	return `
		<header class="Awtsmoos-api-explorer__header">
			<div class="Awtsmoos-api-explorer__title">
				<small>Reality + World API</small>
				<strong>World observatory</strong>
			</div>
			<button type="button" class="Awtsmoos-api-explorer__button" data-api-back aria-label="Close API explorer">Done</button>
		</header>
		<div class="Awtsmoos-api-explorer__body">
			<div class="Awtsmoos-api-explorer__filters">
				<label class="Awtsmoos-api-explorer__field">
					<span>Find capability</span>
					<input type="search" class="Awtsmoos-api-explorer__input" data-api-search autocomplete="off" placeholder="forest, fire, architecture, JSON…">
				</label>
				<label class="Awtsmoos-api-explorer__field">
					<span>Domain</span>
					<select class="Awtsmoos-api-explorer__select" data-api-domain aria-label="API domain"></select>
				</label>
			</div>
			<div class="Awtsmoos-api-explorer__catalog-head">
				<label class="Awtsmoos-api-explorer__field Awtsmoos-api-explorer__field--grow">
					<span>Capability</span>
					<select class="Awtsmoos-api-explorer__select" data-api-operation aria-label="API capability"></select>
				</label>
				<output class="Awtsmoos-api-explorer__count" data-api-count aria-live="polite"></output>
			</div>
			<div class="Awtsmoos-api-explorer__descriptor" data-api-descriptor aria-live="polite"></div>
			<details class="Awtsmoos-api-explorer__advanced" data-api-advanced>
				<summary>Advanced arguments</summary>
				<label class="Awtsmoos-api-explorer__field">
					<span>JSON argument array</span>
					<textarea class="Awtsmoos-api-explorer__textarea" data-api-arguments rows="4" spellcheck="false">[]</textarea>
				</label>
			</details>
			<div class="Awtsmoos-api-explorer__actions">
				<button type="button" class="Awtsmoos-api-explorer__button Awtsmoos-api-explorer__button--primary" data-api-execute>Execute</button>
				<output class="Awtsmoos-api-explorer__status" data-api-status aria-live="polite">Choose a capability.</output>
			</div>
			<pre class="Awtsmoos-api-explorer__result" data-api-result tabindex="0" aria-label="API result">No result yet.</pre>
		</div>
	`;
}
