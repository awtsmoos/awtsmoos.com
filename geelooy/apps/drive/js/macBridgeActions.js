//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module DriveMacBridgeActions
 * @description
 * Wires WS-6's real Mac ⇄ Virtual transfer dialog into the Drive UI without
 * touching any workstream file. Two buttons mount into the bulk-action bar —
 * "Send to Mac" and "Fetch from Mac" — plus an optional single-entry menu item
 * for the entry menu. All transfer machinery (engine, providers,
 * mountBridgeDialog, FolderPicker, path builders) comes from macBridge.js via
 * lazy dynamic import, so this module adds no weight until the user acts.
 *
 * Everything environment-specific is injected:
 *   resolveBridge() -> { macVfsFor, driveVfs }  (default: OS hook via lazy import)
 *   routes            -> normalized Mac route descriptors for the dialog
 *   driveVfs          -> part of resolveBridge(); see driveVfsHandle.js
 *
 * Direction semantics (from macBridge.js):
 *   'to-mac'   entries = drive entries [{ path (drive-relative), name }];
 *              destination picker browses the Mac route.
 *   'from-mac' entries = Mac entries [{ path (mac-inner), name }];
 *              destination picker browses Drive. Because the Drive UI cannot
 *              see Mac files, "Fetch from Mac" first opens a small Mac source
 *              picker (route + folder browser + file checkboxes), then hands
 *              the chosen Mac entries to the real dialog.
 */

const SEND_LABEL = 'Send to Mac';
const FETCH_LABEL = 'Fetch from Mac';
const BUTTON_CLASS = 'mac-bridge-action-btn';

function isFolderLike(entry = {}) {
	return entry.isDirectory === true ||
		entry.type === 'folder' ||
		entry.type === 'directory' ||
		entry.kind === 'folder';
}

function entryName(entry = {}) {
	return String(entry.name || entry.path || 'file').split('/').pop();
}

function driveInnerPath(entry = {}) {
	return String(entry.path || entry.name || '')
		.replace(/^\/+/, '')
		.replace(/^drive\//, '');
}

/**
 * True when at least one selected entry is a transferable file.
 * Folders are excluded — the transfer engine moves files, never trees.
 */
export function canMacTransfer(entries) {
	return (entries || []).some(entry => !isFolderLike(entry));
}

function makeButton(documentObject, label, onClick) {
	const button = documentObject.createElement('button');
	button.type = 'button';
	button.className = BUTTON_CLASS;
	button.dataset.macBridgeAction = label === SEND_LABEL ? 'send' : 'fetch';
	button.textContent = label;
	button.addEventListener('click', () => {
		try {
			const result = onClick();
			if (result && typeof result.catch === 'function') {
				result.catch(error => showBridgeError(documentObject, error));
			}
		} catch (error) {
			showBridgeError(documentObject, error);
		}
	});
	return button;
}

function showBridgeError(documentObject, error) {
	const message = error?.message || String(error);
	let line = documentObject.querySelector('[data-mac-bridge-error]');
	if (!line) {
		line = documentObject.createElement('div');
		line.dataset.macBridgeError = '1';
		line.className = 'mac-bridge-action-error';
		line.setAttribute('role', 'alert');
		(documentObject.body || documentObject).appendChild(line);
	}
	line.textContent = `Mac bridge: ${message}`;
}

function dialogHost(documentObject) {
	const host = documentObject.createElement('div');
	host.className = 'mac-bridge-dialog-host';
	(documentObject.body || documentObject).appendChild(host);
	return host;
}

const defaultImportBridge = () => import('./macBridge.js');

async function resolveRouteList(explicitRoutes) {
	if (Array.isArray(explicitRoutes)) return explicitRoutes;
	if (typeof globalThis !== 'undefined' && Array.isArray(globalThis.awtsmoosMacRoutes)) {
		return globalThis.awtsmoosMacRoutes;
	}
	return [];
}

/**
 * Default { macVfsFor, driveVfs } resolver: lazy-loads the OS hook and binds
 * /network/<route> handles through the tunnel adapter. The OS handle itself
 * (globalThis.awtsmoosOs) and the drive handle (globalThis.driveVfs) are host
 * responsibilities — when absent this throws a clear, actionable error at
 * click time, never at drive startup.
 */
export async function defaultResolveBridge() {
	const { createMacVfsHandles } = await import('../../../os/vfs/macBridgeHook.js');
	const os = (typeof globalThis !== 'undefined' && globalThis.awtsmoosOs) || null;
	const driveVfs = (typeof globalThis !== 'undefined' && globalThis.driveVfs) || null;
	if (!os) {
		throw new Error('no OS tunnel handle available — inject resolveBridge with a bound { macVfsFor, driveVfs }.');
	}
	return createMacVfsHandles({ os, driveVfs });
}

/**
 * Mounts "Send to Mac" / "Fetch from Mac" into the Drive UI.
 *
 * @param {object} options
 * @param {HTMLElement} [options.barHost]   bulk-action bar element to append buttons to
 * @param {Function} [options.getEntries]    () -> selected drive entries for Send
 * @param {Function} [options.getFolder]     () -> current drive folder (fetch destination)
 * @param {HTMLElement} [options.menuList]  entry-menu list element (optional)
 * @param {object} [options.menuEntry]       single entry for the menu item (optional)
 * @param {Function} [options.resolveBridge] () -> Promise<{ macVfsFor, driveVfs }>
 * @param {Array} [options.routes]           normalized Mac route descriptors
 * @param {Function} [options.importBridge]  () -> Promise<macBridge module>;
 *                                           defaults to import('./macBridge.js')
 * @returns {{ openSend, openFetch, unmount }}
 */
export function mountMacBridgeActions(options = {}) {
	const {
		barHost = null,
		getEntries = () => [],
		getFolder = () => '',
		menuList = null,
		menuEntry = null,
		resolveBridge = defaultResolveBridge,
		routes = null,
		importBridge = defaultImportBridge
	} = options;
	const documentObject = barHost?.ownerDocument || menuList?.ownerDocument || null;
	const mounted = [];

	async function bridge() {
		const handles = await resolveBridge();
		if (!handles || typeof handles.macVfsFor !== 'function') {
			throw new Error('resolveBridge must return { macVfsFor, driveVfs }.');
		}
		if (!handles.driveVfs) {
			throw new Error('driveVfs is not bound — inject resolveBridge with a drive handle (see driveVfsHandle.js).');
		}
		return handles;
	}

	async function openSend(entries) {
		const files = (entries || getEntries() || []).filter(entry => !isFolderLike(entry));
		if (!files.length) return { opened: false, reason: 'no-files' };
		const [{ mountBridgeDialog }, { macVfsFor, driveVfs }] = await Promise.all([importBridge(), bridge()]);
		const routeList = await resolveRouteList(routes);
		mountBridgeDialog(dialogHost(documentObject), {
			entries: files.map(file => ({ path: driveInnerPath(file), name: entryName(file) })),
			direction: 'to-mac',
			routes: routeList,
			macVfsFor,
			driveVfs,
			startFolder: ''
		});
		return { opened: true };
	}

	async function openFetch() {
		const { macVfsFor, driveVfs } = await bridge();
		const routeList = await resolveRouteList(routes);
		if (!routeList.length) {
			throw new Error('no Mac routes available — connect a Mac tunnel first.');
		}
		const picked = await pickMacSources({ documentObject, macVfsFor, routes: routeList, importBridge });
		if (!picked) return { opened: false, reason: 'cancelled' };
		const { mountBridgeDialog } = await importBridge();
		mountBridgeDialog(dialogHost(documentObject), {
			entries: picked.entries,
			direction: 'from-mac',
			routes: routeList,
			route: picked.route,
			macVfsFor,
			driveVfs,
			startFolder: String(getFolder() || '').replace(/^\/+/, '').replace(/^drive\//, '')
		});
		return { opened: true };
	}

	if (barHost && typeof barHost.appendChild === 'function' && documentObject) {
		const sendBtn = makeButton(documentObject, SEND_LABEL, () => openSend());
		const fetchBtn = makeButton(documentObject, FETCH_LABEL, () => openFetch());
		barHost.appendChild(sendBtn);
		barHost.appendChild(fetchBtn);
		mounted.push(sendBtn, fetchBtn);
	}

	if (menuList && menuEntry && typeof menuList.appendChild === 'function' && documentObject) {
		const item = documentObject.createElement('button');
		item.type = 'button';
		item.className = `${BUTTON_CLASS} menu`;
		item.dataset.macBridgeAction = 'send';
		item.textContent = SEND_LABEL;
		item.addEventListener('click', () => {
			try {
				Promise.resolve(openSend([menuEntry])).catch(error => showBridgeError(documentObject, error));
			} catch (error) {
				showBridgeError(documentObject, error);
			}
		});
		menuList.appendChild(item);
		mounted.push(item);
	}

	return {
		openSend,
		openFetch,
		unmount() {
			for (const node of mounted) node.remove?.();
			mounted.length = 0;
		}
	};
}

/**
 * Mac source picker for "Fetch from Mac": route select, folder browser
 * (WS-6 FolderPicker over the route's VFS handle), and file checkboxes.
 * Resolves { route, entries: [{ path (mac-inner), name }] } or null on cancel.
 */
export async function pickMacSources({ documentObject, macVfsFor, routes, importBridge = defaultImportBridge }) {
	const { FolderPicker } = await importBridge();
	return new Promise(resolve => {
		const overlay = documentObject.createElement('div');
		overlay.className = 'mac-bridge-source-overlay';
		const card = documentObject.createElement('div');
		card.className = 'mac-bridge-source-card';
		overlay.appendChild(card);

		const title = documentObject.createElement('div');
		title.className = 'mac-bridge-source-title';
		title.textContent = 'Fetch from Mac — choose files';
		card.appendChild(title);

		const routeRow = documentObject.createElement('div');
		routeRow.className = 'mac-bridge-row';
		const routeLabel = documentObject.createElement('span');
		routeLabel.textContent = 'Mac';
		const routeSelect = documentObject.createElement('select');
		for (const route of routes) {
			const option = documentObject.createElement('option');
			option.value = route.route || route.id || '';
			option.textContent = route.title || option.value;
			routeSelect.appendChild(option);
		}
		routeRow.appendChild(routeLabel);
		routeRow.appendChild(routeSelect);
		card.appendChild(routeRow);

		const crumb = documentObject.createElement('div');
		crumb.className = 'mac-bridge-crumb';
		card.appendChild(crumb);
		const fileBox = documentObject.createElement('div');
		fileBox.className = 'mac-bridge-source-files';
		card.appendChild(fileBox);
		const navRow = documentObject.createElement('div');
		navRow.className = 'mac-bridge-row';
		const upBtn = documentObject.createElement('button');
		upBtn.type = 'button';
		upBtn.textContent = '↑ Up';
		navRow.appendChild(upBtn);
		card.appendChild(navRow);

		const foot = documentObject.createElement('div');
		foot.className = 'mac-bridge-source-foot';
		const cancelBtn = documentObject.createElement('button');
		cancelBtn.type = 'button';
		cancelBtn.textContent = 'Cancel';
		const goBtn = documentObject.createElement('button');
		goBtn.type = 'button';
		goBtn.textContent = 'Fetch selected';
		goBtn.disabled = true;
		foot.appendChild(cancelBtn);
		foot.appendChild(goBtn);
		card.appendChild(foot);

		const errorLine = documentObject.createElement('div');
		errorLine.className = 'mac-bridge-error';
		card.appendChild(errorLine);

		(documentObject.body || documentObject).appendChild(overlay);

		const checked = new Map(); // innerPath -> name
		let picker = null;
		let relPath = '';

		function close(value) {
			overlay.remove();
			resolve(value);
		}

		function renderFiles(snapshot) {
			relPath = snapshot.path === '/' ? '' : String(snapshot.path).replace(/^\/+/, '');
			crumb.textContent = `/${relPath}`;
			fileBox.textContent = '';
			if (snapshot.loading) {
				const loading = documentObject.createElement('span');
				loading.textContent = 'Loading…';
				fileBox.appendChild(loading);
			}
			if (snapshot.error) errorLine.textContent = snapshot.error;
			for (const folder of snapshot.folders || []) {
				const btn = documentObject.createElement('button');
				btn.type = 'button';
				btn.className = 'mac-bridge-folder';
				btn.textContent = `📁 ${folder.name}`;
				btn.addEventListener('click', () => picker?.enter(folder.path).then(renderAll).catch(() => {}));
				fileBox.appendChild(btn);
			}
			listFiles().catch(() => {});
		}

		async function listFiles() {
			const vfs = macVfsFor(routeSelect.value);
			let items = [];
			try {
				items = await vfs.list(relPath ? `/${relPath}` : '/');
			} catch (error) {
				errorLine.textContent = error?.message || String(error);
				return;
			}
			for (const item of Array.isArray(items) ? items : []) {
				if (isFolderLike(item)) continue;
				const name = entryName(item);
				const inner = relPath ? `${relPath}/${name}` : name;
				const label = documentObject.createElement('label');
				label.className = 'mac-bridge-source-file';
				const box = documentObject.createElement('input');
				box.type = 'checkbox';
				box.checked = checked.has(inner);
				box.addEventListener('change', () => {
					if (box.checked) checked.set(inner, name);
					else checked.delete(inner);
					goBtn.disabled = checked.size === 0;
				});
				const text = documentObject.createElement('span');
				text.textContent = name;
				label.appendChild(box);
				label.appendChild(text);
				fileBox.appendChild(label);
			}
		}

		async function renderAll() {
			renderFiles(picker.snapshot());
		}

		async function resetPicker() {
			checked.clear();
			goBtn.disabled = true;
			errorLine.textContent = '';
			try {
				picker = new FolderPicker({ vfs: macVfsFor(routeSelect.value), root: '/', onChange: renderFiles });
				await picker.open('/');
			} catch (error) {
				errorLine.textContent = error?.message || String(error);
			}
		}

		upBtn.addEventListener('click', () => picker?.up().then(renderAll).catch(() => {}));
		routeSelect.addEventListener('change', () => resetPicker());
		cancelBtn.addEventListener('click', () => close(null));
		goBtn.addEventListener('click', () => {
			const entries = Array.from(checked.entries()).map(([path, name]) => ({ path, name }));
			close(entries.length ? { route: routeSelect.value, entries } : null);
		});

		resetPicker();
	});
}
