// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieStudioInteractionController.js
 * @description Binds removable non-transport actions, guarded replacement, keyboard flow, history, inspector, and cinema priority.
 * The Awtsmoos renews intention before finger or key can move; Awtsmoos.com lets
 * project replacement, rendering, recovery, and focused viewing travel through one guarded path.
 */

import { createEmptyMovieProject } from './MovieEmptyProject.js';
import { applyMovieInspectorState } from './MovieInspectorState.js';
import { commitMovieProjectWithRecovery } from './MovieProjectReplacementRecovery.js';
import { renderExactMovieStudioSession } from './MovieExactRender.js';
import { handleMovieStudioKey } from './MovieStudioKeyboard.js';

export class MovieStudioInteractionController {
	constructor(session, view) {
		this.session = session;
		this.view = view;
		this.handlers = createHandlers(this);
		this.bind();
	}

	bind() {
		const { handlers, view } = this;
		view.apply.addEventListener('click', handlers.apply);
		view.copy.addEventListener('click', handlers.copy);
		view.render.addEventListener('click', handlers.render);
		view.renderExact.addEventListener('click', handlers.renderExact);
		view.newEmptyProject?.addEventListener('click', handlers.newEmptyProject);
		view.inspectorToggle.addEventListener('click', handlers.toggleInspector);
		view.inspectorClose.addEventListener('click', handlers.closeInspector);
		document.addEventListener('keydown', handlers.keyDown);
		this.toggleInspector(false, false);
	}

	onKeyDown(event) {
		if (this.session.utilityController?.onKeyDown(event)) return true;
		if (this.session.presentationController?.onKeyDown(event)) return true;
		return handleMovieStudioKey(this, event);
	}

	async applyJson() {
		const project = JSON.parse(this.view.json.value);
		await commitMovieProjectWithRecovery(
			this.session, project, 'Apply project JSON'
		);
	}

	async createEmptyProject() {
		this.session.pause();
		return commitMovieProjectWithRecovery(
			this.session, createEmptyMovieProject(), 'Create empty movie project'
		);
	}

	toggleInspector(open = !this.view.root.classList.contains('is-inspector-open'), restoreFocus = true) {
		return applyMovieInspectorState(this.view, open, {
			compact: innerWidth <= 980, restoreFocus
		});
	}

	run(action) {
		Promise.resolve().then(action).catch(error => {
			this.view.status.textContent = `Operation failed: ${error.message}`;
		});
	}

	destroy() {
		const { handlers, view } = this;
		view.apply.removeEventListener('click', handlers.apply);
		view.copy.removeEventListener('click', handlers.copy);
		view.render.removeEventListener('click', handlers.render);
		view.renderExact.removeEventListener('click', handlers.renderExact);
		view.newEmptyProject?.removeEventListener('click', handlers.newEmptyProject);
		view.inspectorToggle.removeEventListener('click', handlers.toggleInspector);
		view.inspectorClose.removeEventListener('click', handlers.closeInspector);
		document.removeEventListener('keydown', handlers.keyDown);
	}
}

function createHandlers(controller) {
	return {
		apply: () => controller.run(() => controller.applyJson()),
		closeInspector: () => controller.toggleInspector(false),
		copy: () => controller.run(() => controller.session.copyUrl()),
		keyDown: event => controller.onKeyDown(event),
		newEmptyProject: () => controller.run(() => controller.createEmptyProject()),
		render: () => controller.run(() => controller.session.render()),
		renderExact: () => controller.run(() => renderExactMovieStudioSession(controller.session)),
		toggleInspector: () => controller.toggleInspector()
	};
}
