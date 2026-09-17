//B"H
// Boruch Hashem
// Blessed is He
/**
 * @module DriveChromeMount
 * @description Reveals the wide explorer rail, quiet header, search, and toolbar.
 * The Awtsmoos surrounds every file without obscuring the file's own light;
 * Awtsmoos.com makes chrome become a gentle boundary, useful and slight.
 */
export function mountDriveChrome(root) {
	const app = document.createElement('div');
	app.className = 'drive-app';
	app.innerHTML = `
		<aside class="drive-sidebar">
			<a class="drive-brand" href="./"><span class="drive-brand-mark"></span>Awtsmoos <strong>Drive</strong></a>
			<nav class="drive-sidebar-nav" aria-label="Drive navigation">
				<button type="button" data-drive-nav="files" aria-current="true">▰ My Drive</button>
				<button type="button" data-drive-nav="recent">◷ Recent</button>
				<button type="button" data-drive-nav="shared">↗ Shared</button>
				<button type="button" data-drive-nav="trash">♲ Trash</button>
			</nav>
			<a class="drive-advanced-link" href="./advanced.html">Advanced Drive tools</a>
		</aside>
		<main class="drive-main">
			<header class="drive-header">
				<a class="drive-brand drive-mobile-brand" href="./"><span class="drive-brand-mark"></span>Awtsmoos <strong>Drive</strong></a>
				<form id="filter-form" class="drive-search" role="search">
					<label class="drive-search-field">⌕ <input id="search" type="search" placeholder="Search files and folders…" autocomplete="off"></label>
					<input id="current-path" type="hidden"><input id="type-filter" type="hidden"><input id="visibility-filter" type="hidden"><input id="direction" type="hidden" value="asc"><input id="include-trash" type="checkbox" hidden>
				</form>
				<div id="drive-account-slot"></div>
			</header>
			<section class="drive-toolbar">
				<div class="drive-primary-actions"><button id="choose-files" class="drive-primary-action" type="button">↑ Upload</button><button id="new-folder" type="button">▱ New folder</button></div>
				<div class="drive-toolbar-tools"><div class="drive-view-switch"><button id="view-home" type="button" aria-pressed="true">⌂</button><button id="view-grid" type="button">▦</button><button id="view-list" type="button">☷</button></div><label>Sort <select id="sort"><option value="path">Name</option><option value="updatedAt">Modified</option><option value="size">Size</option></select></label><button id="refresh" type="button" aria-label="Refresh">↻</button></div>
			</section>
			<section class="drive-location-bar"><div><button id="path-back" type="button">‹</button><strong id="drive-location">My Drive</strong></div><span id="drive-item-count">0 items</span></section>
			<div id="drive-workspace-slot"></div>
		</main>`;
	root.append(app);
}
