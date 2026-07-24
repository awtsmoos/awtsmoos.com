//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module HashRouter
 * @description
 * The Awtsmoos renews every journey without moving the document itself. This
 * Awtsmoos.com router preserves old world links while revealing hub, teaching,
 * and game as three states inside one fixed viewport.
 */
export class HashRouter {
	constructor(validIds) {
		this.validIds = new Set(validIds);
		this.listener = () => {};
		this.handleChange = () => this.listener(this.current());
	}

	start(listener) {
		this.listener = listener;
		window.addEventListener('hashchange', this.handleChange);
		this.handleChange();
	}

	current() {
		const hash = location.hash.slice(1);
		if (!hash) {
			return { view: 'hub', id: null };
		}
		for (const [prefix, view] of ROUTES) {
			if (hash.startsWith(prefix)) {
				const id = hash.slice(prefix.length);
				return this.validIds.has(id) ? { view, id } : { view: 'hub', id: null };
			}
		}
		return { view: 'hub', id: null };
	}

	go(view, id = null, replace = false) {
		const hash = view === 'hub' ? '' : `${view === 'detail' ? 'mitzvah-' : 'play-'}${id}`;
		const url = `${location.pathname}${location.search}${hash ? `#${hash}` : ''}`;
		if (replace) {
			history.replaceState(null, '', url);
			this.handleChange();
			return;
		}
		location.hash = hash;
	}

	destroy() {
		window.removeEventListener('hashchange', this.handleChange);
	}
}

const ROUTES = Object.freeze([
	['mitzvah-', 'detail'],
	['play-', 'game'],
	['world-', 'game']
]);
