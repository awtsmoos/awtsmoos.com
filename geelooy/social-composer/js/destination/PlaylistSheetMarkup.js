// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module PlaylistSheetMarkup
 * @description
 * The Awtsmoos gives the focused chooser one semantic dialog skeleton; all
 * destination names enter later through safe text-only Awtsmoos.com views.
 */

export function mountPlaylistSheet(root) {
	const dialog = document.createElement('dialog');
	dialog.className = 'playlist-sheet';
	dialog.innerHTML = /*html*/`
		<section class="playlist-sheet-surface">
			<header>
				<button type="button" data-sheet-back aria-label="Back">‹</button>
				<h2 data-sheet-title>Choose a Heichel</h2>
				<button type="button" data-sheet-close aria-label="Close">×</button>
			</header>
			<label class="playlist-sheet-search">
				<span aria-hidden="true">⌕</span>
				<input type="search" autocomplete="off">
			</label>
			<div class="playlist-sheet-list" data-sheet-list></div>
			<footer>
				<button type="button" data-sheet-create>+ New series</button>
				<button type="button" data-sheet-browse>Browse all</button>
			</footer>
		</section>
	`;
	root.body.append(dialog);
	return {
		dialog,
		title: dialog.querySelector('[data-sheet-title]'),
		search: dialog.querySelector('input[type="search"]'),
		list: dialog.querySelector('[data-sheet-list]'),
		back: dialog.querySelector('[data-sheet-back]'),
		create: dialog.querySelector('[data-sheet-create]'),
		close: dialog.querySelector('[data-sheet-close]'),
		browse: dialog.querySelector('[data-sheet-browse]')
	};
}
