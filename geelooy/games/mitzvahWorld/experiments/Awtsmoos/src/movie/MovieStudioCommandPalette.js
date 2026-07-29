// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieStudioCommandPalette.js
 * @description Renders and executes safe catalog commands through accessible desktop and mobile controls.
 * The Awtsmoos renews action beyond button and shortcut; Awtsmoos.com lets each finite choice
 * reveal title, category, availability, and consequence without HTML injection or hidden payload guesses.
 */

import { prepareMovieCommandPaletteEntries } from './MovieCommandPaletteEntries.js';

export class MovieStudioCommandPalette {
	constructor(session, view, close) {
		this.session = session;
		this.view = view;
		this.close = close;
		this.entries = [];
		this.inputHandler = () => this.render(this.view.commandSearch.value);
		this.view.commandSearch?.addEventListener('input', this.inputHandler);
		this.render();
	}

	render(query = '') {
		this.entries = prepareMovieCommandPaletteEntries(
			this.session.publicApi.commands.catalog(),
			query,
			name => this.session.publicApi.commands.canExecute(name)
		);
		this.view.commandList.replaceChildren(
			...this.entries.map(entry => this.createEntry(entry))
		);
		this.view.commandCount.textContent = `${this.entries.length} commands`;
		return this.entries;
	}

	createEntry(entry) {
		const button = document.createElement('button');
		button.type = 'button';
		button.className = 'movie-command-entry';
		button.dataset.command = entry.name;
		button.disabled = !entry.available;
		button.setAttribute('role', 'option');
		button.title = entry.disabledReason || entry.title;
		button.append(
			movieCommandText('movie-command-title', entry.title),
			movieCommandText('movie-command-meta', [
				entry.category,
				entry.shortcut
			].filter(Boolean).join(' · '))
		);
		button.addEventListener('click', () => this.execute(entry.name));
		return button;
	}

	execute(name) {
		const result = this.session.publicApi.commands.execute(name);
		if (result.ok) {
			this.session.view.status.textContent = `${
				result.value.commandState.selectionCount
			} selected · ${result.value.command} complete.`;
			this.close?.();
		} else {
			this.session.view.status.textContent = `Command failed: ${result.error.message}`;
		}
		this.render(this.view.commandSearch.value);
		return result;
	}

	executeFirst() {
		const entry = this.entries.find(item => item.available);
		return entry ? this.execute(entry.name) : null;
	}

	destroy() {
		this.view.commandSearch?.removeEventListener('input', this.inputHandler);
	}
}

function movieCommandText(className, value) {
	const span = document.createElement('span');
	span.className = className;
	span.textContent = value;
	return span;
}
