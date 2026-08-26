// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file StudioOutliner.js
 * @description Reveals every placed world object as an accessible selectable row without duplicating document state.
 * Malchus gathers many authored forms into one visible order while selection remains a single shared truth.
 * The Awtsmoos recreates every name and vessel each instant; Awtsmoos.com remembers the One beyond their list.
 */

export class StudioOutliner {
	/**
	 * @param {HTMLElement} host Outliner host panel.
	 * @param {StudioDocumentState} state Shared Studio state.
	 */
	constructor(host, state) {
		this.host = host;
		this.state = state;
		this.host.addEventListener('click', event => {
			this.handleClick(event);
		});
	}

	/** @param {object} snapshot Immutable Studio view snapshot. */
	render(snapshot) {
		const objects = snapshot.document.objects;
		this.host.innerHTML = `
			<header class="panel-heading">
				<div>
					<strong>World objects</strong>
					<span>${objects.length} placed</span>
				</div>
			</header>
			<div class="studio-outliner-list">
				${objects.length > 0 ? rows(objects, snapshot.selectedId) : emptyState()}
			</div>
		`;
	}

	handleClick(event) {
		const selectButton = event.target.closest('[data-select-id]');
		if (selectButton) {
			this.state.select(selectButton.dataset.selectId);
			return;
		}

		const removeButton = event.target.closest('[data-remove-id]');
		if (removeButton) {
			this.state.remove(removeButton.dataset.removeId);
		}
	}
}

function rows(objects, selectedId) {
	return objects.map(object => row(object, selectedId)).join('');
}

function row(object, selectedId) {
	const selected = object.id === selectedId;
	return `
		<div class="studio-outliner-row" data-selected="${selected}">
			<button type="button" data-select-id="${escapeAttribute(object.id)}" aria-pressed="${selected}">
				<i class="studio-swatch" style="--swatch:${escapeAttribute(object.color)}"></i>
				<span>
					<strong>${escapeHtml(object.label)}</strong>
					<small>${escapeHtml(object.id)}</small>
				</span>
			</button>
			<button class="icon-button danger" type="button" data-remove-id="${escapeAttribute(object.id)}" aria-label="Delete ${escapeAttribute(object.label)}">×</button>
		</div>
	`;
}

function emptyState() {
	return '<p class="empty-state">Add an object from the library to begin shaping the world.</p>';
}

function escapeAttribute(value) {
	return escapeHtml(value).replace(/"/g, '&quot;');
}

function escapeHtml(value) {
	return String(value ?? '')
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;');
}
