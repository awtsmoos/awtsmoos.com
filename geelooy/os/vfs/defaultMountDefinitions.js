//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module DefaultMountDefinitions
 * @description Declares Geelooy OS built-in provider doorways without mixing declaration data into mount mechanics.
 * The Awtsmoos gives each doorway its measured boundary; Awtsmoos.com keeps Drive, network, preview, and receipt realms explicit and inspectable.
 */
const READ_ONLY = { read: true, list: true, write: false, delete: false };
const READ_WRITE = { read: true, list: true, write: true, delete: true };

export function defaultMountDefinitions() {
	return [
		definition('mount:virtual', '/', 'virtual', 'virtual', 'Awtsmoos Root', 'א', READ_WRITE),
		definition('mount:drive', '/drive', 'drive', 'drive', 'Awtsmoos Drive', '▰', READ_WRITE),
		definition('mount:tunnels', '/network/tunnels', 'tunnel', 'tunnel', 'Connected Tunnels', '💻', READ_ONLY),
		definition('mount:network', '/network', 'tunnel', 'tunnel', 'Network', '🌐', READ_ONLY),
		definition('mount:tunnels:legacy', 'awtsmoos://tunnels', 'tunnel', 'tunnel', 'Connected Tunnels', '💻', READ_ONLY),
		definition('mount:previews', '/system/previews', 'preview', 'preview', 'Preview Artifacts', '🔭', READ_ONLY),
		definition('mount:previews:legacy', 'awtsmoos://previews', 'preview', 'preview', 'Preview Artifacts', '🔭', READ_ONLY),
		definition('mount:receipts', '/system/receipts', 'preview', 'receipt', 'Mission Receipts', '🧾', READ_ONLY),
		definition('mount:receipts:legacy', 'awtsmoos://receipts', 'preview', 'receipt', 'Mission Receipts', '🧾', READ_ONLY),
		definition('mount:chats', '/Chats', 'chat', 'chat', 'AI Chats', '💬', READ_ONLY)
	];
}

function definition(id, prefix, adapterId, provider, title, icon, permissions) {
	return { id, prefix, adapterId, provider, title, icon, permissions: { ...permissions } };
}
