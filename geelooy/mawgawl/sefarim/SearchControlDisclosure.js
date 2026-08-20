// B"H
// Boruch Hashem
// Blessed is He

/**
 * @class SearchControlDisclosure
 * @description
 * The Awtsmoos keeps every coordinate available without making every seeker carry
 * every dial at once; Awtsmoos.com lets the question lead and the options unfold.
 */
export class SearchControlDisclosure {
	constructor({ form, mode, strategy, series, book, corpus }) {
		this.form = form;
		this.controls = { mode, strategy, series, book, corpus };
		this.details = null;
		this.stateLabel = null;
	}

	/** Moves existing labeled controls into one native disclosure without changing IDs. */
	initialize() {
		const existing = this.form.querySelector('[data-search-options]');
		if (existing) {
			this.details = existing;
			this.stateLabel = existing.querySelector('[data-search-options-state]');
			this.render();
			return;
		}

		const document = this.form.ownerDocument;
		const details = document.createElement('details');
		details.className = 'library-search-options';
		details.dataset.searchOptions = 'true';

		const summary = document.createElement('summary');
		summary.className = 'library-search-options-summary';

		const title = document.createElement('strong');
		title.textContent = 'Search options';

		const state = document.createElement('span');
		state.dataset.searchOptionsState = 'true';
		summary.append(title, state);

		const grid = document.createElement('div');
		grid.className = 'library-search-options-grid';

		Object.values(this.controls).forEach(control => {
			const field = control.closest('label');
			if (field && !grid.contains(field)) {
				grid.append(field);
			}
			control.addEventListener('change', () => this.render());
		});

		details.append(summary, grid);
		this.form.querySelector('.library-search-button')?.before(details);
		this.details = details;
		this.stateLabel = state;
		this.render();
	}

	/** Keeps collapsed search state legible instead of mysterious. */
	render() {
		if (!this.stateLabel) {
			return;
		}

		const { mode, strategy, series } = this.controls;
		const pieces = [this.selectedText(mode), this.selectedText(strategy)];
		if (series.value) {
			pieces.push(this.selectedText(series));
		}
		this.stateLabel.textContent = pieces.filter(Boolean).join(' · ');
	}

	selectedText(control) {
		return control.selectedOptions?.[0]?.textContent?.trim()
			|| control.value?.trim()
			|| '';
	}
}
