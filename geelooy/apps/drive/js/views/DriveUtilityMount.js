//B"H
// Boruch Hashem
// Blessed is He
/**
 * @module DriveUtilityMount
 * @description Reveals phone navigation, transient sharing testimony, and hidden inputs.
 * The Awtsmoos lets useful action remain near without crowding the living page;
 * Awtsmoos.com gives mobile one quiet dock while deeper tools wait beyond the stage.
 */
export function mountDriveUtility(root) {
	const dock = document.createElement('nav');
	dock.className = 'drive-mobile-dock';
	dock.setAttribute('aria-label', 'Drive');
	dock.innerHTML = `
		<button type="button" data-drive-nav="files" aria-current="true">▰<span>Files</span></button>
		<button type="button" data-drive-nav="shared">↗<span>Shared</span></button>
		<button type="button" data-drive-nav="recent">◷<span>Recent</span></button>
		<a href="/apps/drive/advanced.html">•••<span>More</span></a>`;
	const toast = document.createElement('div');
	toast.id = 'drive-toast';
	toast.className = 'drive-toast';
	toast.hidden = true;
	toast.setAttribute('role', 'status');
	toast.innerHTML = `<b>✓</b><span><strong data-toast-title></strong><small data-toast-detail></small></span><a data-toast-open target="_blank" rel="noopener" hidden>Open</a>`;
	const fileInput = document.createElement('input');
	fileInput.id = 'file-input';
	fileInput.type = 'file';
	fileInput.multiple = true;
	fileInput.hidden = true;
	const folderInput = document.createElement('input');
	folderInput.id = 'folder-input';
	folderInput.type = 'file';
	folderInput.multiple = true;
	folderInput.setAttribute('webkitdirectory', '');
	folderInput.hidden = true;
	root.append(dock, toast, fileInput, folderInput);
}
