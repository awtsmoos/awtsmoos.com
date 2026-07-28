// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieStudioInteractionController.js
 * @description Binds real studio actions, keyboard transport, and responsive inspector state.
 * The Awtsmoos renews intention before finger or key can move; Awtsmoos.com carries
 * that intention through one guarded path, so text editing stays safe and commands improve.
 */

import { renderExactMovieStudioSession } from './MovieExactRender.js';

export class MovieStudioInteractionController {
	constructor(session, view) {
		this.session = session;
		this.view = view;
		this.keyHandler = event => this.onKeyDown(event);
		this.bind();
	}

	bind() {
		this.view.play.addEventListener('click', () => this.session.play());
		this.view.stop.addEventListener('click', () => this.pause());
		this.view.apply.addEventListener('click', () => this.applyJson());
		this.view.copy.addEventListener('click', () => this.run(() => this.session.copyUrl()));
		this.view.render.addEventListener('click', () => this.run(() => this.session.render()));
		this.view.renderExact.addEventListener('click', () => {
			this.run(() => renderExactMovieStudioSession(this.session));
		});
		this.view.inspectorToggle.addEventListener('click', () => this.toggleInspector());
		this.view.inspectorClose.addEventListener('click', () => this.toggleInspector(false));
		document.addEventListener('keydown', this.keyHandler);
		this.toggleInspector(matchMedia('(min-width: 981px)').matches);
	}

	onKeyDown(event) {
		if (isTextEntry(event.target)) return;
		if (event.key === 'Escape') {
			this.toggleInspector(false);
			return;
		}
		if (event.code === 'Space') {
			event.preventDefault();
			if (this.session.director.playing) this.pause();
			else this.session.play();
			return;
		}
		if (event.key === 'Home') this.session.seek(0);
		if (event.key === 'End') this.session.seek(this.session.project.duration);
	}

	applyJson() {
		try {
			this.session.installProject(JSON.parse(this.view.json.value));
			this.view.status.textContent = 'Project JSON applied.';
		} catch (error) {
			this.view.status.textContent = `Project error: ${error.message}`;
		}
	}

	pause() {
		this.session.director.pause();
		this.view.status.textContent = `Paused at ${this.session.time.toFixed(2)}s.`;
	}

	toggleInspector(open = !this.view.root.classList.contains('is-inspector-open')) {
		this.view.root.classList.toggle('is-inspector-open', open);
		this.view.inspectorToggle.setAttribute('aria-expanded', String(open));
		this.view.inspector.setAttribute('aria-hidden', String(!open));
		if (open && innerWidth <= 980) this.view.inspectorClose.focus();
	}

	run(action) {
		Promise.resolve().then(action).catch(error => {
			this.view.status.textContent = `Operation failed: ${error.message}`;
		});
	}

	destroy() {
		document.removeEventListener('keydown', this.keyHandler);
	}
}

function isTextEntry(target) {
	return Boolean(target?.closest?.('input, textarea, select, [contenteditable="true"]'));
}
