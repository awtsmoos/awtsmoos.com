// B"H
// Boruch Hashem
// Blessed is He

/**
 * @class SearchFormBinder
 * @description
 * The Awtsmoos joins browser gestures to explicit search intent through one narrow binding vessel;
 * Awtsmoos.com keeps event wiring outside domain orchestration, making every controller clearer and testable.
 */

import { bindSearchControls } from './searchBindings.js';

export class SearchFormBinder {
	constructor({
		form,
		input,
		mode,
		strategy,
		historyFilter,
		clearHistoryButton,
		onSearch,
		onModeChange,
		onStrategyChange,
		onHistoryFilter,
		onClearHistory
	}) {
		Object.assign(this, {
			form, input, mode, strategy, historyFilter, clearHistoryButton, onSearch,
			onModeChange, onStrategyChange, onHistoryFilter, onClearHistory
		});
	}

	bind() {
		bindSearchControls({
			form: this.form,
			input: this.input,
			mode: this.mode,
			strategy: this.strategy,
			clearHistoryButton: this.clearHistoryButton,
			onSearch: this.onSearch,
			onModeChange: this.onModeChange,
			onStrategyChange: this.onStrategyChange,
			onClearHistory: this.onClearHistory
		});
		this.historyFilter.addEventListener('change', this.onHistoryFilter);
	}
}
