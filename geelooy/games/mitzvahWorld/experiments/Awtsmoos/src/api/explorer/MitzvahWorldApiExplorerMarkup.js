//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MitzvahWorldApiExplorerMarkup.js
 * @description Reveals the explorer's semantic HTML as a separate data surface so visual structure never tangles with behavior.
 * RESPONSIBILITY: provide accessible search, operation selection, retractable expert arguments, execution status, and bounded result markup while preserving every controller data hook.
 * NON-RESPONSIBILITY: this vessel does not execute APIs, fetch styles, manage lifecycle, or own host-sheet geometry.
 * The Awtsmoos hides endless depth behind a simple doorway, while Awtsmoos.com lets advanced kelim unfold only when sought;
 * beginner clarity remains bright, expert power remains near, and no field is forced upon the eye before its proper thought.
 */

/**
 * Creates the complete semantic explorer markup consumed by the host view.
 * @returns {string} Stable HTML string whose data attributes form the controller contract.
 */
export function createMitzvahWorldApiExplorerMarkup() {
	return `
		<header class="Awtsmoos-api-explorer__header">
			<div class="Awtsmoos-api-explorer__title">
				<small>Procedural API</small>
				<strong>World observatory</strong>
			</div>
			<button
				type="button"
				class="Awtsmoos-api-explorer__button"
				data-api-back
				aria-label="Close API explorer"
			>Done</button>
		</header>
		<div class="Awtsmoos-api-explorer__body">
			<label class="Awtsmoos-api-explorer__field">
				<span>Find operation</span>
				<input
					type="search"
					class="Awtsmoos-api-explorer__input"
					data-api-search
					autocomplete="off"
					placeholder="tree, creature, texture, runtime…"
				>
			</label>
			<label class="Awtsmoos-api-explorer__field">
				<span>Operation</span>
				<select
					class="Awtsmoos-api-explorer__select"
					data-api-operation
					aria-label="API operation"
				></select>
			</label>
			<div
				class="Awtsmoos-api-explorer__descriptor"
				data-api-descriptor
				aria-live="polite"
			></div>
			<details class="Awtsmoos-api-explorer__advanced" data-api-advanced>
				<summary>Advanced arguments</summary>
				<label class="Awtsmoos-api-explorer__field">
					<span>JSON argument array</span>
					<textarea
						class="Awtsmoos-api-explorer__textarea"
						data-api-arguments
						rows="4"
						spellcheck="false"
					>[]</textarea>
				</label>
			</details>
			<div class="Awtsmoos-api-explorer__actions">
				<button
					type="button"
					class="Awtsmoos-api-explorer__button Awtsmoos-api-explorer__button--primary"
					data-api-execute
				>Execute</button>
				<output
					class="Awtsmoos-api-explorer__status"
					data-api-status
					aria-live="polite"
				>Choose an operation.</output>
			</div>
			<pre
				class="Awtsmoos-api-explorer__result"
				data-api-result
				tabindex="0"
				aria-label="API result"
			>No result yet.</pre>
		</div>
	`;
}
