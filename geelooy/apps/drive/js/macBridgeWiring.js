// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module MacBridgeWiring
 * @description
 * Least-invasive bootstrap for the Drive app's Mac bridge: resolves the real
 * OS tunnel handle (window.awtsmoosOs), discovers Mac routes, builds the
 * /drive VFS handle from the Drive app's own BeriahEntriesResource, and mounts
 * the Send to Mac / Fetch from Mac actions into the bulk bar. Called once from
 * MalchusDriveApplication.mount(). Every seam is injectable for tests; nothing
 * here touches tokens or the DOM beyond the action buttons.
 *
 * This is also the drive app's integration bootstrap: it loads the WS-5
 * provenance recorder (provenanceWiring) so the guarded emit calls in
 * bulkActions.js / NetzachUploadStreamController.js have a recorder to call.
 */

export async function installMacBridge(application, options = {}) {
	const {
		documentObject = typeof document !== 'undefined' ? document : null,
		osSource = () => (typeof globalThis !== 'undefined' ? globalThis.awtsmoosOs : null) || null,
		entriesResource = null,
		importHook = () => import('../../../os/vfs/macBridgeHook.js'),
		importActions = () => import('./macBridgeActions.js'),
		importHandle = () => import('./driveVfsHandle.js'),
		importEntries = () => import('./api/BeriahEntriesResource.js'),
		importProvenanceWiring = () => import('./provenanceWiring.js')
	} = options;

	const { installProvenanceWiring } = await importProvenanceWiring();
	const provenance = await installProvenanceWiring();

	const os = osSource();
	if (!os) return { installed: false, reason: 'no-os-handle', provenance };
	if (!documentObject) return { installed: false, reason: 'no-document', provenance };

	const { createMacVfsHandles } = await importHook();
	const { macVfsFor, listRoutes } = await createMacVfsHandles({ os });

	const resource = entriesResource ||
		new (await importEntries()).BeriahEntriesResource();
	const { createDriveVfsHandle, driveApiVfsPrimitives } = await importHandle();
	const driveVfs = createDriveVfsHandle(driveApiVfsPrimitives({ entriesResource: resource }));

	const routes = await listRoutes();
	const { mountMacBridgeActions } = await importActions();
	const api = mountMacBridgeActions({
		barHost: documentObject.querySelector('#drive-bulk-bar'),
		getEntries: () => application?.selection?.entries() || [],
		resolveBridge: async () => ({ macVfsFor, driveVfs }),
		routes,
		documentObject
	});
	return { installed: true, routes, provenance, unmount: api.unmount };
}
