//B"H
// Boruch Hashem
// Blessed is He
/**
 * @module DriveChromeMount
 * @description Reveals the premium Drive hero, truthful navigation, search, creation, categories, and path controls.
 * The Awtsmoos surrounds every file without obscuring the file's own light;
 * Awtsmoos.com makes the chrome a luminous threshold where creation, finding, and going Up stay plain in sight.
 */
export function mountDriveChrome(root) {
	const app = document.createElement('div');
	app.className = 'drive-app';
	app.innerHTML = `
		<aside class="drive-sidebar">
			<a class="drive-brand" href="./"><span class="drive-brand-mark"></span><span class="drive-brand-copy"><span class="drive-brand-title">Awtsmoos <strong>Drive</strong></span><small>Your files. A bigger world. ✦</small></span></a>
			<nav class="drive-sidebar-nav" aria-label="Drive navigation">
				<button type="button" data-drive-nav="files" aria-current="true">▰ My Drive</button>
				<button type="button" data-drive-nav="recent">◷ Recent</button>
				<button type="button" data-drive-nav="shared">◉ Public</button>
				<button type="button" data-drive-nav="trash">♲ Trash</button>
			</nav>
			<a class="drive-advanced-link" href="./advanced.html">Advanced Drive tools</a>
		</aside>
		<main class="drive-main">
			<header class="drive-header drive-hero-header">
				<a class="drive-brand drive-mobile-brand" href="./"><span class="drive-brand-mark"></span><span class="drive-brand-copy"><span class="drive-brand-title">Awtsmoos <strong>Drive</strong></span><small>Your files. A bigger world. ✦</small></span></a>
				<form id="filter-form" class="drive-search" role="search">
					<label class="drive-search-field"><span aria-hidden="true">⌕</span><input id="search" type="search" placeholder="Search files, folders, and more…" autocomplete="off"></label>
					<input id="current-path" type="hidden"><input id="type-filter" type="hidden"><input id="visibility-filter" type="hidden"><input id="direction" type="hidden" value="asc"><input id="include-trash" type="checkbox" hidden>
				</form>
				<div id="drive-account-slot"></div>
			</header>
			<section class="drive-toolbar">
				<div class="drive-primary-actions"><button id="choose-files" class="drive-primary-action" type="button">↑ Upload</button><button id="new-folder" type="button">＋ New folder</button></div>
				<nav class="drive-category-bar" aria-label="File categories">
					<button type="button" data-drive-category="all" aria-pressed="true">▦ All</button><button type="button" data-drive-category="folders">📁 Folders</button><button type="button" data-drive-category="images">▧ Images</button><button type="button" data-drive-category="videos">▷ Videos</button><button type="button" data-drive-category="docs">▤ Docs</button>
				</nav>
				<div class="drive-toolbar-tools"><div class="drive-view-switch"><button id="view-home" type="button" aria-pressed="true">⌂</button><button id="view-grid" type="button">▦</button><button id="view-list" type="button">☷</button></div><label>Sort <select id="sort"><option value="path">Name</option><option value="updatedAt">Modified</option><option value="size">Size</option></select></label><button id="refresh" type="button" aria-label="Refresh">↻</button></div>
			</section>
			<section class="drive-location-bar"><div><button id="path-back" type="button" disabled>↑ Up</button><strong id="drive-location">My Drive</strong></div><span id="drive-item-count">0 items</span></section>
			<div id="drive-workspace-slot"></div>
		</main>`;
	root.append(app);
}
