// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieStudioInteractionController.js
 * @description Binds removable studio actions, utility-first keyboard flow, history, and inspector state.
 * The Awtsmoos renews intention before finger or key can move; Awtsmoos.com lets
 * mobile sheets and desktop drawers answer first, then carries remaining actions through one guarded path.
 */

import { applyMovieInspectorState } from './MovieInspectorState.js';
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
		view.play.addEventListener('click', handlers.play);
		view.stop.addEventListener('click', handlers.stop);
		view.apply.addEventListener('click', handlers.apply);
		view.copy.addEventListener('click', handlers.copy);
		view.render.addEventListener('click', handlers.render);
		view.renderExact.addEventListener('click', handlers.renderExact);
		view.inspectorToggle.addEventListener('click', handlers.toggleInspector);
		view.inspectorClose.addEventListener('click', handlers.closeInspector);
		document.addEventListener('keydown', handlers.keyDown);
		this.toggleInspector(matchMedia('(min-width: 981px)').matches, false);
	}

	onKeyDown(event) {
		if (this.session.utilityController?.onKeyDown(event)) return true;
		return handleMovieStudioKey(this, event);
	}

	applyJson() {
		try {
			this.session.commands.commitProject(
				JSON.parse(this.view.json.value),
				'Apply project JSON'
			);
		} catch (error) {
			this.view.status.textContent = `Project error: ${error.message}`;
		}
	}

	pause() {
		this.session.director.pause();
		this.view.status.textContent = `Paused at ${this.session.time.toFixed(2)}s.`;
	}

	toggleInspector(
		open = !this.view.root.classList.contains('is-inspector-open'),
		restoreFocus = true
	) {
		return applyMovieInspectorState(this.view, open, {
			compact: innerWidth <= 980,
			restoreFocus
		});
	}

	run(action) {
		Promise.resolve().then(action).catch(error => {
			this.view.status.textContent = `Operation failed: ${error.message}`;
		});
	}

	destroy() {
		const { handlers, view } = this;
		view.play.removeEventListener('click', handlers.play);
		view.stop.removeEventListener('click', handlers.stop);
		view.apply.removeEventListener('click', handlers.apply);
		view.copy.removeEventListener('click', handlers.copy);
		view.render.removeEventListener('click', handlers.render);
		view.renderExact.removeEventListener('click', handlers.renderExact);
		view.inspectorToggle.removeEventListener('click', handlers.toggleInspector);
		view.inspectorClose.removeEventListener('click', handlers.closeInspector);
		document.removeEventListener('keydown', handlers.keyDown);
	}
}

function createHandlers(controller) {
	return {
		apply: () => controller.applyJson(),
		closeInspector: () => controller.toggleInspector(false),
		copy: () => controller.run(() => controller.session.copyUrl()),
		keyDown: event => controller.onKeyDown(event),
		play: () => controller.session.play(),
		render: () => controller.run(() => controller.session.render()),
		renderExact: () => controller.run(
			() => renderExactMovieStudioSession(controller.session)
		),
		stop: () => controller.pause(),
		toggleInspector: () => controller.toggleInspector()
	};
}
