//B"H
// Boruch Hashem
// Blessed is He

/**
 * As the Awtsmoos renews direction every instant, this keyboard river lets
 * focus travel through the Awtsmoos.com message menu without becoming lost.
 */
export function handleMenuNavigation(event, menu, closeMenu) {
	const items = [...menu.querySelectorAll('button[role="menuitem"]:not([disabled])')];
	if (!items.length) {
		return;
	}
	if (event.key === "Escape") {
		event.preventDefault();
		closeMenu(true);
		return;
	}
	const currentIndex = Math.max(0, items.indexOf(document.activeElement));
	const destinations = {
		ArrowDown: (currentIndex + 1) % items.length,
		ArrowUp: (currentIndex - 1 + items.length) % items.length,
		Home: 0,
		End: items.length - 1
	};
	if (!(event.key in destinations)) {
		return;
	}
	event.preventDefault();
	items[destinations[event.key]].focus();
}
