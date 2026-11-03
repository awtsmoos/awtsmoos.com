// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module HeichelSettingsPanel
 * @description Owner-only settings surface for a heichel: rename and
 * description editing through the canonical heichel PUT, and a danger zone
 * that deletes the whole heichel through the canonical DELETE behind a
 * strong confirmation. The panel states the full cascade scope in plain
 * language before the delete can be confirmed, and the delete button stays
 * disabled until the owner types the heichel's name. Mounted only after the
 * ownership loader has proven the viewing alias owns this heichel; the
 * server gates remain the real enforcement and their refusals are shown
 * verbatim.
 */

import { appState } from '../state.js';
import { updateHeichelDetails, deleteHeichel } from '../api/heichel.js';

let mounted = false;

export function mountHeichelSettings() {
	if (mounted || !appState.ownsIt || !appState.heichelId) return;
	mounted = true;
	injectStyle();
	const button = document.createElement('button');
	button.type = 'button';
	button.className = 'heichel-settings-entry';
	button.textContent = '⚙ Heichel settings';
	button.addEventListener('click', openPanel);
	document.body.appendChild(button);
}

function heichelName() {
	return appState.heichelData?.name || appState.heichelId || '';
}

async function notify(message, kind) {
	try {
		const ui = await import('../ui.js');
		ui.notify(message, kind);
	} catch { /* the panel also reports inline */ }
}

function openPanel() {
	closePanel();
	const overlay = document.createElement('div');
	overlay.className = 'heichel-settings-overlay';
	overlay.id = 'heichelSettingsOverlay';
	const name = heichelName();
	const description = appState.heichelData?.description || '';

	const panel = document.createElement('div');
	panel.className = 'heichel-settings-panel';
	panel.setAttribute('role', 'dialog');
	panel.setAttribute('aria-label', 'Heichel settings');

	const heading = document.createElement('h2');
	heading.textContent = 'Heichel settings';
	panel.appendChild(heading);

	const detailsLabel = document.createElement('h3');
	detailsLabel.textContent = 'Details';
	panel.appendChild(detailsLabel);

	const nameLabel = document.createElement('label');
	nameLabel.textContent = 'Name';
	const nameInput = document.createElement('input');
	nameInput.type = 'text';
	nameInput.value = name;
	nameInput.maxLength = 50;
	nameLabel.appendChild(nameInput);
	panel.appendChild(nameLabel);

	const descLabel = document.createElement('label');
	descLabel.textContent = 'Description';
	const descInput = document.createElement('textarea');
	descInput.value = description;
	descInput.rows = 4;
	descInput.maxLength = 3650;
	descLabel.appendChild(descInput);
	panel.appendChild(descLabel);

	const saveRow = document.createElement('div');
	saveRow.className = 'heichel-settings-row';
	const saveButton = document.createElement('button');
	saveButton.type = 'button';
	saveButton.textContent = 'Save details';
	const detailsStatus = document.createElement('span');
	detailsStatus.className = 'heichel-settings-status';
	saveButton.addEventListener('click', async () => {
		saveButton.disabled = true;
		detailsStatus.textContent = 'Saving…';
		try {
			const res = await updateHeichelDetails({
				heichelId: appState.heichelId,
				aliasId: window.curAlias,
				name: nameInput.value.trim(),
				description: descInput.value
			});
			if (res?.error) throw new Error(serverMessage(res.error));
			appState.heichelData = { ...(appState.heichelData || {}), name: nameInput.value.trim(), description: descInput.value };
			try {
				const ui = await import('../ui.js');
				ui.updateHeichelHeader(appState.heichelData);
			} catch { /* header refresh is cosmetic here */ }
			detailsStatus.textContent = 'Saved.';
			await notify('Heichel details saved.', 'success');
		} catch (e) {
			detailsStatus.textContent = e.message || 'Save failed.';
		} finally {
			saveButton.disabled = false;
		}
	});
	saveRow.appendChild(saveButton);
	saveRow.appendChild(detailsStatus);
	panel.appendChild(saveRow);

	const dangerLabel = document.createElement('h3');
	dangerLabel.className = 'heichel-settings-danger-title';
	dangerLabel.textContent = 'Danger zone';
	panel.appendChild(dangerLabel);

	const scope = document.createElement('p');
	scope.className = 'heichel-settings-scope';
	scope.textContent = 'Deleting this Heichel permanently removes all of its series, every post in them (including posts written by other people), all comments on those posts, and its editor and viewer memberships. This cannot be undone.';
	panel.appendChild(scope);

	const confirmLabel = document.createElement('label');
	confirmLabel.textContent = `Type the Heichel name — ${name} — to enable deletion`;
	const confirmInput = document.createElement('input');
	confirmInput.type = 'text';
	confirmInput.value = '';
	confirmInput.setAttribute('autocomplete', 'off');
	confirmLabel.appendChild(confirmInput);
	panel.appendChild(confirmLabel);

	const deleteRow = document.createElement('div');
	deleteRow.className = 'heichel-settings-row';
	const deleteButton = document.createElement('button');
	deleteButton.type = 'button';
	deleteButton.className = 'heichel-settings-delete';
	deleteButton.textContent = 'Delete this Heichel permanently';
	deleteButton.disabled = true;
	const deleteStatus = document.createElement('span');
	deleteStatus.className = 'heichel-settings-status';
	confirmInput.addEventListener('input', () => {
		deleteButton.disabled = confirmInput.value.trim() !== name;
	});
	deleteButton.addEventListener('click', async () => {
		deleteButton.disabled = true;
		deleteStatus.textContent = 'Deleting…';
		try {
			const res = await deleteHeichel({
				heichelId: appState.heichelId,
				aliasId: window.curAlias
			});
			if (res?.error) throw new Error(serverMessage(res.error));
			await notify('Heichel deleted.', 'success');
			window.location.href = '/heichelos/';
		} catch (e) {
			deleteStatus.textContent = e.message || 'Delete failed.';
			deleteButton.disabled = false;
		}
	});
	deleteRow.appendChild(deleteButton);
	deleteRow.appendChild(deleteStatus);
	panel.appendChild(deleteRow);

	const closeRow = document.createElement('div');
	closeRow.className = 'heichel-settings-row';
	const closeButton = document.createElement('button');
	closeButton.type = 'button';
	closeButton.textContent = 'Close';
	closeButton.addEventListener('click', closePanel);
	overlay.addEventListener('click', (event) => {
		if (event.target === overlay) closePanel();
	});
	closeRow.appendChild(closeButton);
	panel.appendChild(closeRow);

	overlay.appendChild(panel);
	document.body.appendChild(overlay);
	nameInput.focus();
}

function closePanel() {
	document.getElementById('heichelSettingsOverlay')?.remove();
}

function serverMessage(error) {
	if (!error) return 'The server refused this change.';
	if (typeof error === 'string') return error;
	return error.message || error.details || error.code || 'The server refused this change.';
}

function injectStyle() {
	if (document.getElementById('heichelSettingsStyle')) return;
	const style = document.createElement('style');
	style.id = 'heichelSettingsStyle';
	style.textContent = `
		.heichel-settings-entry{position:fixed;right:14px;bottom:86px;z-index:900;padding:9px 14px;border-radius:999px;border:1px solid rgba(127,127,127,.45);background:rgba(20,22,34,.92);color:#f2ead8;font-size:14px;cursor:pointer;box-shadow:0 4px 18px rgba(0,0,0,.35)}
		.heichel-settings-overlay{position:fixed;inset:0;z-index:1200;background:rgba(4,6,12,.66);display:flex;align-items:flex-start;justify-content:center;overflow:auto;padding:28px 14px}
		.heichel-settings-panel{background:#14161f;color:#f2ead8;border:1px solid rgba(255,255,255,.16);border-radius:14px;max-width:560px;width:100%;padding:20px 22px;box-shadow:0 18px 50px rgba(0,0,0,.5)}
		.heichel-settings-panel h2{margin:0 0 10px;font-size:21px}
		.heichel-settings-panel h3{margin:18px 0 8px;font-size:15px;text-transform:uppercase;letter-spacing:.06em;opacity:.85}
		.heichel-settings-panel label{display:block;margin:10px 0;font-size:14px}
		.heichel-settings-panel input,.heichel-settings-panel textarea{display:block;width:100%;margin-top:5px;padding:9px 10px;border-radius:8px;border:1px solid rgba(255,255,255,.25);background:rgba(255,255,255,.06);color:inherit;font:inherit;box-sizing:border-box}
		.heichel-settings-row{display:flex;gap:12px;align-items:center;margin-top:12px;flex-wrap:wrap}
		.heichel-settings-row button{padding:9px 16px;border-radius:8px;border:1px solid rgba(255,255,255,.3);background:rgba(255,255,255,.08);color:inherit;cursor:pointer;font-size:14px}
		.heichel-settings-danger-title{color:#ff9c9c}
		.heichel-settings-scope{font-size:14px;line-height:1.5;background:rgba(255,80,80,.08);border:1px solid rgba(255,80,80,.3);border-radius:8px;padding:10px 12px}
		.heichel-settings-delete{background:rgba(160,30,30,.85)!important;border-color:rgba(255,120,120,.6)!important;color:#fff!important}
		.heichel-settings-delete:disabled{opacity:.4;cursor:not-allowed}
		.heichel-settings-status{font-size:13px;opacity:.9}
	`;
	document.head.appendChild(style);
}
