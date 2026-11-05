// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieStudioMediaWorkspaceInteraction.js
 * @description Binds accessible media filtering, source marking, saved searches, and edit actions.
 * The Awtsmoos is beyond click and key while every finite gesture must enter one command gate;
 * Awtsmoos.com removes every listener at destruction and leaves no hidden interaction state.
 */

export class MovieStudioMediaWorkspaceInteraction {
	constructor(controller) {
		this.controller = controller;
		this.view = controller.view;
		this.listeners = [];
		this.bind();
	}

	bind() {
		this.listen(this.view.actions, 'click', event => this.onClick(event));
		this.listen(this.view.query, 'input', () => this.updateFilter());
		this.listen(this.view.folder, 'change', () => this.updateFilter());
		this.listen(this.view.kind, 'change', () => this.updateFilter());
		this.listen(this.view.recursive, 'change', () => this.updateFilter());
		this.listen(this.view.inPoint, 'change', () => this.controller.execute(
			'markSourceIn',
			{ time: Number(this.view.inPoint.value) },
			'Source in point updated.'
		));
		this.listen(this.view.outPoint, 'change', () => this.controller.execute(
			'markSourceOut',
			{ time: Number(this.view.outPoint.value) },
			'Source out point updated.'
		));
	}

	onClick(event) {
		const mediaButton = event.target.closest?.('[data-media-id]');
		if (mediaButton) {
			this.controller.execute(
				'selectSourceMedia',
				{ mediaId: mediaButton.dataset.mediaId },
				`Selected ${mediaButton.textContent.trim()}.`
			);
			return;
		}
		const action = event.target.closest?.('[data-media-workspace-action]')
			?.dataset.mediaWorkspaceAction;
		if (!action) {
			return;
		}
		this.executeAction(action);
	}

	executeAction(action) {
		if (action === 'save-search') {
			this.controller.saveSearch();
		}
		if (action === 'apply-search') {
			this.controller.applySavedSearch();
		}
		if (action === 'remove-search') {
			this.controller.removeSavedSearch();
		}
		if (action === 'mark-in') {
			this.markAtPlayer('markSourceIn', this.view.inPoint.value, 'Source in point updated.');
		}
		if (action === 'mark-out') {
			this.markAtPlayer('markSourceOut', this.view.outPoint.value, 'Source out point updated.');
		}
		if (action === 'clear-marks') {
			this.controller.execute('clearSourceMarks', {}, 'Source marks cleared.');
		}
		if (action === 'insert') {
			this.controller.execute('insertSourceEdit', this.controller.editPayload(), 'Source inserted.');
		}
		if (action === 'overwrite') {
			this.controller.execute(
				'overwriteSourceEdit',
				this.controller.editPayload(),
				'Source overwritten.'
			);
		}
	}

	markAtPlayer(command, fallback, message) {
		this.controller.execute(
			command,
			{ time: this.controller.sourceTime(fallback) },
			message
		);
	}

	updateFilter() {
		this.controller.filter = {
			folder: this.view.folder.value,
			kind: this.view.kind.value,
			query: this.view.query.value,
			recursive: this.view.recursive.checked
		};
		this.controller.refresh();
	}

	listen(target, type, listener) {
		target?.addEventListener?.(type, listener);
		this.listeners.push(() => target?.removeEventListener?.(type, listener));
	}

	destroy() {
		this.listeners.splice(0).forEach(remove => remove());
	}
}
