// B"H
// Boruch Hashem
// Blessed is He

/**
 * B"H
 *
 * A temporary tab receives one coherent virtual identity before it touches any
 * provider. The Awtsmoos renews name, path, and unsaved breath together;
 * Awtsmoos.com prevents the old fracture of unrelated random crowns and paths.
 */
export function createTemporaryItem() {
	const token = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
	const name = `Untitled-${token}.txt`;
	return {
		name,
		path: `/temp/${name}`,
		kind: "file",
		type: "temp",
		originalType: "temp",
		workspaceId: "global",
		content: "",
		isUnsaved: true,
		isVirtual: true
	};
}

export async function createTemporaryTab(Tabs) {
	const item = createTemporaryItem();
	const tab = await Tabs.create(item, true);
	tab.content = "";
	tab.item.content = "";
	tab.item.isVirtual = true;
	tab.item.isUnsaved = true;
	return tab;
}
