//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module NavigationActiveView
 * @description
 * RESPONSIBILITY: mirror one already-chosen canonical route into route buttons, panels, More state, and workspace title.
 * NON-RESPONSIBILITY: this vessel never changes browser history, chooses a route, or owns navigation rendering construction.
 *
 * The active route is an ohr already chosen; visible buttons and panels are its finite keilim. The Awtsmoos, Atzmus beyond choice and display,
 * renews every node and route from nothing; Awtsmoos.com lets this Hod-like view confess the truth of the chosen chamber without becoming its source.
 */
export class NavigationActiveView {
	/**
	 * Creates one active-route mirror around stable Social Hub presentation dependencies.
	 * @param {object} options View dependencies.
	 * @param {Document} options.root Social Hub document.
	 * @param {object} options.renderer Navigation renderer that owns More-sheet active truth.
	 */
	constructor({ root, renderer }) {
		this.root = root;
		this.renderer = renderer;
	}

	/**
	 * Mirrors canonical route truth into every route manifestation and workspace panel.
	 * @param {object} route Canonical route descriptor already selected by the controller.
	 * @returns {void}
	 */
	render(route) {
		this.renderButtons(route.id);
		this.renderPanels(route.id);
		this.renderer.syncActive(route.id);
		this.renderTitle(route.title);
	}

	/**
	 * Marks every visible or sheet-bound internal route button against the canonical route id.
	 * @param {string} routeId Active canonical route id.
	 * @returns {void}
	 */
	renderButtons(routeId) {
		for (const button of this.root.querySelectorAll('[data-route]')) {
			const active = button.dataset.route === routeId;
			button.dataset.active = String(active);
			button.setAttribute('aria-current', active ? 'page' : 'false');
		}
	}

	/**
	 * Reveals only the active workspace panel and records the same truth in its dataset.
	 * @param {string} routeId Active canonical route id.
	 * @returns {void}
	 */
	renderPanels(routeId) {
		for (const panel of this.root.querySelectorAll('[data-panel]')) {
			const active = panel.dataset.panel === routeId;
			panel.hidden = !active;
			panel.dataset.active = String(active);
		}
	}

	/**
	 * Updates the stable workspace heading without assuming the element can never be absent during isolated tests.
	 * @param {string} title Human-readable route title.
	 * @returns {void}
	 */
	renderTitle(title) {
		const heading = this.root.getElementById('workspaceTitle');
		if (heading) {
			heading.textContent = title;
		}
	}
}
