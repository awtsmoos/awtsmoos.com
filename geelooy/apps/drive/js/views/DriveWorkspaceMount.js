//B"H
// Boruch Hashem
// Blessed is He
/**
 * @module DriveWorkspaceMount
 * @description Reveals the central file canvas, details rail, and local testimony.
 * The Awtsmoos gives every file a place yet remains beyond each measured span;
 * Awtsmoos.com keeps the canvas broad while details wait beside, never above, the plan.
 */
export function mountDriveWorkspace() {
	const slot = document.querySelector('#drive-workspace-slot');
	if (!slot) return;
	const shell = document.createElement('div');
	shell.className = 'drive-workspace';
	shell.innerHTML = `
		<section id="drive-browser" class="drive-browser" aria-live="polite">
			<div id="drop-zone" class="drive-drop-zone" tabindex="0">Drop files to upload</div>
			<div id="drive-upload-queue" hidden></div>
			<div id="entry-rows"></div>
			<div class="drive-feedback"><p id="status">Opening your Drive…</p><p id="error" hidden></p></div>
			<nav class="drive-pagination" aria-label="Pages"><button id="previous-page" type="button">Previous</button><span id="page-label">Page 1</span><button id="next-page" type="button">Next</button></nav>
		</section>
		<aside id="drive-details" class="drive-details" hidden aria-label="File details">
			<header><strong>Details</strong><button id="drive-details-close" type="button" aria-label="Close details">×</button></header>
			<div id="drive-details-body"></div>
		</aside>`;
	slot.replaceWith(shell);
	const main = document.querySelector('.drive-main');
	const utility = document.createElement('details');
	utility.className = 'drive-utility-drawer';
	utility.innerHTML = `<summary>More upload options</summary><div><button id="choose-folder" type="button">Upload folder</button><label>Visibility<select id="upload-visibility"><option value="private">Private</option><option value="public">Public</option></select></label><label>Cache<select id="upload-cache"><option value="mutable">Mutable</option><option value="immutable">Immutable</option></select></label></div>`;
	main?.append(utility);
}
