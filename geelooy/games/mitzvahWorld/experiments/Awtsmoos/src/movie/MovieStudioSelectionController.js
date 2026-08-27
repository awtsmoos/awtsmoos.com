// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieStudioSelectionController.js
 * @description Synchronizes immutable selection sets with legacy primary selection, inspector, timeline, and events.
 * The Awtsmoos renews the selected one within the selected many; Awtsmoos.com keeps
 * stable identities, visible focus, mobile actions, and agent state united without project mutation.
 */

import { movieSelectionDescriptor, resolveMovieSelection } from './MovieProjectSelection.js';
import {
	createEmptyMovieSelectionSet,
	normalizeMovieSelectionSet
} from './MovieSelectionSet.js';
import {
	replaceMovieSelectionItems,
	setMovieSelectionRange,
	updateMovieSelectionSet
} from './MovieSelectionSetOperations.js';

export class MovieStudioSelectionController {
	constructor(session) {
		this.session = session;
		this.value = createEmptyMovieSelectionSet();
	}

	get primary() {
		return this.value.primary;
	}

	select(source, options = {}) {
		const descriptor = source?.descriptor
			|| movieSelectionDescriptor(source?.track, source?.clip);
		this.value = descriptor
			? updateMovieSelectionSet(
				this.value,
				descriptor,
				options.mode || source?.mode || 'replace',
				this.session.project
			)
			: createEmptyMovieSelectionSet();
		return this.publish();
	}

	set(source) {
		this.value = normalizeMovieSelectionSet(source, this.session.project);
		return this.publish();
	}

	setItems(items) {
		this.value = replaceMovieSelectionItems(
			this.value,
			items,
			this.session.project
		);
		return this.publish();
	}

	setRange(range) {
		this.value = setMovieSelectionRange(
			this.value,
			range,
			this.session.project
		);
		return this.publish();
	}

	restore(project, source = this.value) {
		this.value = normalizeMovieSelectionSet(source, project);
		return this.resolvePrimary(project);
	}

	resolvePrimary(project = this.session.project) {
		const resolved = resolveMovieSelection(project, this.primary);
		return resolved
			? {
				...resolved,
				descriptor: this.primary,
				selectionSet: this.value
			}
			: null;
	}

	publish() {
		const resolved = this.resolvePrimary();
		this.session.inspector?.select?.(resolved);
		this.session.timeline?.setSelection?.(this.value);
		this.session.timeline?.updateCommands?.();
		this.session.events?.emit('selection:changed', {
			revision: this.session.revision,
			selection: this.primary,
			selectionSet: this.value
		});
		return resolved;
	}
}
