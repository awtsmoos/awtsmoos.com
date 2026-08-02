// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieStudioWorkspaceModeController.js
 * @description Publishes container-derived desktop, tablet, and mobile workspace modes.
 * The Awtsmoos renews the editor inside its actual bounded vessel; Awtsmoos.com listens to
 * both container and viewport changes so every real browser reveals the correct creative form.
 */

export function classifyMovieStudioWorkspace(width) {
	const value = Number(width) || 0;
	if (value < 640) return 'mobile';
	if (value < 981) return 'tablet';
	return 'desktop';
}

export class MovieStudioWorkspaceModeController {
	constructor(session, view, environment = globalThis) {
		this.session = session;
		this.view = view;
		this.environment = environment;
		this.lastMode = '';
		this.lastWidth = -1;
		this.onWindowResize = () => this.measure();
		environment.addEventListener?.('resize', this.onWindowResize);
		const Observer = environment.ResizeObserver;
		if (typeof Observer === 'function') {
			this.observer = new Observer(entries => {
				const width = entries[0]?.contentRect?.width;
				this.update(width);
			});
			this.observer.observe(view.root);
		}
		this.measure();
	}

	measure() {
		const bounds = this.view.root.getBoundingClientRect?.();
		const rootWidth = Number(bounds?.width) || 0;
		const viewportWidth = Number(this.environment.innerWidth) || rootWidth || 1440;
		this.update(Math.min(rootWidth || viewportWidth, viewportWidth));
	}

	update(width) {
		const roundedWidth = Math.max(0, Math.round(Number(width) || 0));
		const mode = classifyMovieStudioWorkspace(roundedWidth);
		if (mode === this.lastMode && roundedWidth === this.lastWidth) return mode;
		this.lastMode = mode;
		this.lastWidth = roundedWidth;
		this.view.root.dataset.workspaceMode = mode;
		this.view.root.style.setProperty('--movie-workspace-width', `${roundedWidth}px`);
		this.view.root.classList.toggle('is-compact-workspace', mode !== 'desktop');
		this.session.events?.emit?.('ui:workspace-mode', { mode, width: roundedWidth });
		return mode;
	}

	destroy() {
		this.observer?.disconnect?.();
		this.environment.removeEventListener?.('resize', this.onWindowResize);
	}
}
