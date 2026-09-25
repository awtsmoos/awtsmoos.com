// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module MacBridgeHook
 * @description
 * OS-side hook point for WS-6's virtual ⇄ Mac bridge. Two responsibilities:
 *
 * 1. createMacVfsHandles({ os, driveVfs }) — binds one VFS handle per Mac
 *    route. The real tunnelAdapter(os) already serves `/network/<route>/…`
 *    paths; the per-route handle scopes bare inner paths ('/', '/docs') to
 *    that route while passing already-qualified `/network/<route>/…` paths
 *    through untouched (WS-6's sendToMac/fetchFromMac hand the engine fully
 *    qualified paths, while FolderPicker browses from '/'). The adapter is
 *    lazy-imported so unit tests can inject a fake via `adapterFactory`.
 *
 * 2. fileManagerActions({ macVfsFor, driveVfs, routes, mountBridgeDialog }) —
 *    action descriptors the OS file manager can mount for selections:
 *    selections under /drive get "Send to Mac"; selections under a single
 *    /network/<route> get "Fetch to Drive". The route is parsed from the
 *    selection paths, so no extra discovery call is needed in the manager.
 *
 * 3. registerMacBridgeActions(registry, context) — plugs the two descriptors
 *    into any command registry exposing register(action). The concrete OS
 *    file-manager registry name must be confirmed on the Mac during Phase 2;
 *    this helper invents no registry of its own.
 *
 * The /drive handle itself comes from the OS mount table (drive provider) or
 * is injected — this module never invents one.
 */

const NETWORK_PREFIX = '/network/';
const DRIVE_PREFIX = '/drive';

function isFolderLike(entry = {}) {
	return entry.isDirectory === true ||
		entry.type === 'folder' ||
		entry.type === 'directory' ||
		entry.kind === 'folder';
}

function entryName(entry = {}) {
	return String(entry.name || entry.path || 'file').split('/').pop();
}

function driveInnerPath(path) {
	return String(path || '').replace(/^\/+/, '').replace(/^drive\//, '');
}

/** Parses `/network/<route>/inner…` → { route, inner } or null. */
export function parseNetworkPath(path) {
	const clean = String(path || '');
	if (!clean.startsWith(NETWORK_PREFIX)) return null;
	const rest = clean.slice(NETWORK_PREFIX.length).replace(/^\/+/, '');
	const slash = rest.indexOf('/');
	if (slash < 0) return { route: rest, inner: '' };
	return { route: rest.slice(0, slash), inner: rest.slice(slash + 1) };
}

function isDrivePath(path) {
	const clean = String(path || '');
	return clean === DRIVE_PREFIX || clean.startsWith(`${DRIVE_PREFIX}/`);
}

/**
 * @param {{ os: object, driveVfs?: object|null, adapterFactory?: Function }} options
 *   adapterFactory(os) -> Promise<adapter> — injectable for tests; defaults
 *   to a lazy import of WS-6's real tunnelAdapter.
 * @returns {Promise<{ macVfsFor(route:string): object, listRoutes(): Promise<Array>, driveVfs: object|null }>}
 */
export async function createMacVfsHandles({ os = null, driveVfs = null, adapterFactory = null } = {}) {
	if (!os) throw new Error('createMacVfsHandles requires { os }.');
	const makeAdapter = adapterFactory || (async target => (await import('./tunnelAdapter.js')).tunnelAdapter(target));
	const adapter = await makeAdapter(os);

	function macVfsFor(route) {
		if (!route) throw new Error('macVfsFor requires a route.');
		const prefix = `${NETWORK_PREFIX}${route}`;
		// WS-6 hands the engine fully-qualified /network/<route>/… paths but
		// browses from '/' in FolderPicker: scope bare paths, pass qualified.
		const scope = (vfsPath = '/') => {
			const raw = String(vfsPath || '/');
			if (raw === prefix || raw.startsWith(`${prefix}/`)) return raw;
			return `${prefix}${raw.startsWith('/') ? raw : `/${raw}`}`;
		};
		return {
			route,
			list: (vfsPath = '/') => adapter.list(scope(vfsPath)),
			read: (vfsPath, readOptions) => adapter.read(scope(vfsPath), readOptions),
			write: (vfsPath, payload) => adapter.write(scope(vfsPath), payload),
			mkdir: (vfsPath) => adapter.mkdir(scope(vfsPath)),
			remove: (vfsPath) => adapter.remove(scope(vfsPath))
		};
	}

	/**
	 * Discovers Mac routes by listing /network through the real adapter.
	 * Entries are normalized defensively to { route, title }.
	 */
	async function listRoutes() {
		const items = await adapter.list(NETWORK_PREFIX);
		return (Array.isArray(items) ? items : [])
			.map(item => {
				const path = String(item?.path || '');
				const route = String(item?.name || item?.route || path.split('/').filter(Boolean).pop() || '');
				return { route, title: String(item?.title || item?.label || route || 'Mac') };
			})
			.filter(entry => entry.route);
	}

	return { macVfsFor, listRoutes, driveVfs };
}

async function defaultMountBridgeDialog() {
	const module = await import('../../apps/drive/js/macBridge.js');
	return module.mountBridgeDialog;
}

/**
 * Builds the two file-manager actions. The manager mounts them wherever
 * selections live; appliesTo() decides visibility per selection.
 *
 * @param {object} options
 * @param {Function} options.macVfsFor   (route) -> vfs handle
 * @param {object} options.driveVfs      /drive handle (reads/writes /drive/… paths)
 * @param {Array} [options.routes]       normalized Mac route descriptors
 * @param {Function} [options.mountBridgeDialog]  injectable; default lazy import
 * @param {Function} [options.dialogHost] (document) -> container element
 */
export function fileManagerActions({
	macVfsFor = null,
	driveVfs = null,
	routes = [],
	mountBridgeDialog = null,
	dialogHost = null
} = {}) {
	if (typeof macVfsFor !== 'function') throw new Error('fileManagerActions requires macVfsFor(route).');
	if (!driveVfs) throw new Error('fileManagerActions requires driveVfs.');

	const entryPaths = (selection = []) =>
		(selection || []).map(entry => String(entry?.path || entry?.name || ''));

	const hasFiles = (selection = []) =>
		(selection || []).some(entry => !isFolderLike(entry));

	function dialogContainer(documentObject) {
		if (typeof dialogHost === 'function') return dialogHost(documentObject);
		const host = documentObject.createElement('div');
		host.className = 'mac-bridge-dialog-host';
		(documentObject.body || documentObject).appendChild(host);
		return host;
	}

	async function openDialog() {
		if (typeof mountBridgeDialog === 'function') return mountBridgeDialog;
		return defaultMountBridgeDialog();
	}

	const sendToMac = {
		id: 'macbridge.send-to-mac',
		label: 'Send to Mac',
		icon: '🖥️',
		appliesTo(selection = []) {
			const paths = entryPaths(selection);
			return paths.length > 0 && paths.every(isDrivePath) && hasFiles(selection);
		},
		async run(selection = [], context = {}) {
			const mount = await openDialog();
			const documentObject = context.document || (typeof document !== 'undefined' ? document : null);
			if (!documentObject) throw new Error('Send to Mac needs a document to mount the dialog.');
			const files = (selection || [])
				.filter(entry => !isFolderLike(entry))
				.map(entry => ({ path: driveInnerPath(entry.path), name: entryName(entry) }));
			mount(dialogContainer(documentObject), {
				entries: files,
				direction: 'to-mac',
				routes,
				macVfsFor,
				driveVfs,
				startFolder: ''
			});
			return { ok: true, files: files.length };
		}
	};

	const fetchToDrive = {
		id: 'macbridge.fetch-to-drive',
		label: 'Fetch to Drive',
		icon: '💾',
		appliesTo(selection = []) {
			const paths = entryPaths(selection);
			if (!paths.length || !hasFiles(selection)) return false;
			const parsed = paths.map(parseNetworkPath);
			if (parsed.some(entry => !entry)) return false;
			return new Set(parsed.map(entry => entry.route)).size === 1;
		},
		async run(selection = [], context = {}) {
			const mount = await openDialog();
			const documentObject = context.document || (typeof document !== 'undefined' ? document : null);
			if (!documentObject) throw new Error('Fetch to Drive needs a document to mount the dialog.');
			// Pair each entry with its parsed path BEFORE filtering folders:
			// filtering first would misalign parsed[index] when a folder
			// precedes a file in the selection.
			const files = (selection || [])
				.map(entry => ({ entry, parsed: parseNetworkPath(String(entry?.path || '')) }))
				.filter(({ entry, parsed }) => parsed && !isFolderLike(entry))
				.map(({ entry, parsed }) => ({ path: parsed.inner, name: entryName(entry) }));
			const first = parseNetworkPath(String(selection[0]?.path || ''));
			const route = first ? first.route : '';
			mount(dialogContainer(documentObject), {
				entries: files,
				direction: 'from-mac',
				routes,
				route,
				macVfsFor,
				driveVfs,
				startFolder: String(context.driveFolder || '').replace(/^\/+/, '').replace(/^drive\//, '')
			});
			return { ok: true, files: files.length, route };
		}
	};

	return [sendToMac, fetchToDrive];
}

/**
 * Registers the two Mac-bridge actions with any command registry exposing
 * register(action). The registry itself is injected — the concrete OS
 * file-manager registry binding must be confirmed on the Mac during Phase 2.
 *
 * @param {{ register: Function }} registry
 * @param {object} context  forwarded to fileManagerActions()
 * @returns {Array} the registered action descriptors
 */
export function registerMacBridgeActions(registry, context = {}) {
	if (!registry || typeof registry.register !== 'function') {
		throw new Error('registerMacBridgeActions requires a registry with register(action).');
	}
	const actions = fileManagerActions(context);
	for (const action of actions) registry.register(action);
	return actions;
}
