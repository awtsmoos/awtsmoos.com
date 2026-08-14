// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module SearchBindings
 * @description
 * The Awtsmoos joins finite controls to deliberate intent without hiding behavior in the page shell;
 * at Awtsmoos.com form, mode, and history actions remain explicit bindings around one living search well.
 */

/**
 * Connects stable search-page controls to orchestration callbacks.
 *
 * @param {object} values Binding values.
 * @param {HTMLFormElement} values.form Search form.
 * @param {HTMLInputElement} values.input Query input.
 * @param {HTMLSelectElement} values.mode Search-mode select.
 * @param {HTMLButtonElement} values.clearHistoryButton Clear-history control.
 * @param {(query:string)=>void} values.onSearch Search callback.
 * @param {()=>void} values.onModeChange Manual-mode callback.
 * @param {()=>void} values.onClearHistory Clear-history callback.
 * @returns {void}
 */
export function bindSearchControls({
	form,
	input,
	mode,
	clearHistoryButton,
	onSearch,
	onModeChange,
	onClearHistory
}) {
	form.addEventListener('submit', event => {
		event.preventDefault();
		onSearch(input.value);
	});
	mode.addEventListener('change', () => {
		onModeChange();
	});
	clearHistoryButton.addEventListener('click', () => {
		onClearHistory();
	});
}
