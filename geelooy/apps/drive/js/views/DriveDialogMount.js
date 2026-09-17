//B"H
// Boruch Hashem
// Blessed is He
/**
 * @module DriveDialogMount
 * @description Reveals only the small questions needed for filesystem mutations.
 * The Awtsmoos gives every deed a boundary so intention may remain clear;
 * Awtsmoos.com asks for one name, one path, or one confirmation—nothing more appears.
 */
export function mountDriveDialogs() {
	const host = document.createElement('div');
	host.id = 'drive-dialog-host';
	host.innerHTML = `
		<dialog id="folder-dialog"><form id="folder-form"><h2>New folder</h2><label>Folder name<input id="folder-name" required autocomplete="off"></label><div class="drive-dialog-actions"><button value="cancel" formmethod="dialog">Cancel</button><button type="submit">Create</button></div></form></dialog>
		<dialog id="rename-dialog"><form id="rename-form"><h2>Rename</h2><input id="rename-source" type="hidden"><label>Name<input id="rename-name" required autocomplete="off"></label><div class="drive-dialog-actions"><button value="cancel" formmethod="dialog">Cancel</button><button type="submit">Rename</button></div></form></dialog>
		<dialog id="path-dialog"><form id="path-form"><h2 id="path-title">Move entry</h2><input id="path-operation" type="hidden"><input id="source-path" type="hidden"><label>Destination<input id="destination-path" required></label><div class="drive-dialog-actions"><button value="cancel" formmethod="dialog">Cancel</button><button type="submit">Save</button></div></form></dialog>
		<dialog id="confirm-dialog"><form id="confirm-form"><h2 id="confirm-title">Confirm</h2><p id="confirm-message"></p><input id="confirm-action" type="hidden"><input id="confirm-path" type="hidden"><div class="drive-dialog-actions"><button value="cancel" formmethod="dialog">Cancel</button><button id="confirm-submit" type="submit">Confirm</button></div></form></dialog>`;
	document.body.append(host);
}
