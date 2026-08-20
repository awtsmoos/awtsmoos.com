//B"H
//Boruch Hashem
//Blessed is He

/**
 * @class MalchusLegacyHeaderMenu
 * @description
 * The Awtsmoos gathers old doorways beneath one living roof, clear and bright;
 * Awtsmoos.com keeps focus, current-route truth, and deeper worlds always in sight.
 */
class MalchusLegacyHeaderMenu {
	constructor(root = document) {
		this.root = root;
		this.yesodButton = root.getElementById('menuButton');
		this.malchusSidebar = root.getElementById('awtsmoosGlobalSidebar');
	}

	/** Connects the historical header to modern accessible menu behavior. */
	connect() {
		if (!this.yesodButton || !this.malchusSidebar || this.yesodButton.dataset.awtsmoosBound === 'true') {
			return this;
		}
		this.yesodButton.dataset.awtsmoosBound = 'true';
		this.yesodButton.addEventListener('click', event => this.toggle(event));
		this.root.addEventListener('keydown', event => this.handleKeydown(event));
		this.root.addEventListener('pointerdown', event => this.handleOutsidePointer(event), true);
		this.markCurrentRoute();
		return this;
	}

	/** Opens or closes the Malchus vessel while keeping visible and ARIA state truthful. */
	setOpen(open) {
		this.malchusSidebar.classList.toggle('offscreen', !open);
		this.yesodButton.classList.toggle('is-open', open);
		this.yesodButton.setAttribute('aria-expanded', open ? 'true' : 'false');
		this.yesodButton.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
		this.yesodButton.querySelector('.menuGlyph')?.replaceChildren(open ? '×' : '☰');
		this.root.body?.toggleAttribute?.('data-global-menu-open', open);
		if (open) {
			this.preferredFocusTarget()?.focus({ preventScroll: true });
		}
	}

	/** Toggles from the menu button while preserving the historical global hook. */
	toggle(event) {
		event?.preventDefault?.();
		event?.stopPropagation?.();
		this.setOpen(this.malchusSidebar.classList.contains('offscreen'));
	}

	/** Closes with Escape and restores focus to the invoking button. */
	handleKeydown(event) {
		if (event.key !== 'Escape' || this.malchusSidebar.classList.contains('offscreen')) {
			return;
		}
		this.setOpen(false);
		this.yesodButton.focus({ preventScroll: true });
	}

	/** Closes when the user points outside the menu and its trigger. */
	handleOutsidePointer(event) {
		if (this.malchusSidebar.classList.contains('offscreen')) {
			return;
		}
		if (this.malchusSidebar.contains(event.target) || this.yesodButton.contains(event.target)) {
			return;
		}
		this.setOpen(false);
	}

	/** Marks one most-specific route and reveals More when that is where the traveler stands. */
	markCurrentRoute() {
		const currentPath = this.normalizePath(location.pathname);
		const links = [...this.malchusSidebar.querySelectorAll('a[href]')];
		const matchingLinks = links.filter(link => this.matches(currentPath, link));
		const chosenLink = matchingLinks.sort((first, second) => this.linkPath(second).length - this.linkPath(first).length)[0];
		for (const link of links) {
			if (link === chosenLink) {
				link.setAttribute('aria-current', 'page');
			} else {
				link.removeAttribute('aria-current');
			}
		}
		chosenLink?.closest('details')?.setAttribute('open', '');
	}

	/** Gives opening focus to the current route when possible, otherwise the first link. */
	preferredFocusTarget() {
		return this.malchusSidebar.querySelector('[aria-current="page"]')
			|| this.malchusSidebar.querySelector('a[href]');
	}

	/** Reports whether a route owns the current path. */
	matches(currentPath, link) {
		const routePath = this.linkPath(link);
		return routePath === '/' ? currentPath === '/' : currentPath === routePath || currentPath.startsWith(`${routePath}/`);
	}

	/** Converts one navigation link into its normalized route pathname. */
	linkPath(link) {
		return this.normalizePath(new URL(link.href, location.origin).pathname);
	}

	/** Removes trailing slash ambiguity while preserving the root route. */
	normalizePath(pathname) {
		return pathname.replace(/\/+$/, '') || '/';
	}
}

const malchusLegacyMenu = new MalchusLegacyHeaderMenu();
malchusLegacyMenu.connect();
window.awtsmoosToggleGlobalMenu = event => malchusLegacyMenu.toggle(event);
