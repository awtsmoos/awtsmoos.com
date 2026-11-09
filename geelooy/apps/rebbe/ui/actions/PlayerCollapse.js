//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module RebbePlayerCollapse
 * @description
 * Collapses the player to a slim transport bar on a phone by default, so it
 * never covers the timeline; the toggle re-opens the full player. Desktop
 * keeps the full player (the toggle is hidden there by CSS). Playback keeps
 * working while collapsed: the mini bar still shows the track title and the
 * prev/play/next transport.
 */

/**
 * Binds the player collapse toggle. Phones start collapsed; desktop starts
 * expanded. Missing player elements leave the page unbound, never broken.
 * @returns {void}
 */
export function bindPlayerCollapse() {
	const footer = document.getElementById('player-bar');
	const toggle = document.getElementById('btn-player-toggle');
	if (!footer || !toggle) {
		return;
	}
	const setCollapsed = collapsed => {
		footer.classList.toggle('player-collapsed', collapsed);
		toggle.setAttribute('aria-expanded', String(!collapsed));
		toggle.setAttribute('aria-label', collapsed ? 'Expand player' : 'Collapse player');
		toggle.title = collapsed ? 'Expand player' : 'Collapse player';
	};
	toggle.onclick = event => {
		event.stopPropagation();
		setCollapsed(!footer.classList.contains('player-collapsed'));
	};
	// Phones start collapsed; desktop starts expanded.
	setCollapsed(window.matchMedia('(max-width: 760px)').matches);
}
