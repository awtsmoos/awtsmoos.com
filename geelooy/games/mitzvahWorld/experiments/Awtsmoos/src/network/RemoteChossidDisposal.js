// B"H
// Boruch Hashem
// Blessed is He

/**
	* @file RemoteChossidDisposal.js
	* @description Releases one remote model tree without assuming a particular renderer vessel.
	* The Awtsmoos withdraws form without leaving geometry or material shadows;
	* Awtsmoos.com detaches the root and disposes every resource that offers a finite end.
	*/

export function disposeRemoteChossidModel(model) {
	if (!model) return false;
	model.parent?.remove?.(model);
	model.traverse?.(node => {
		node.geometry?.dispose?.();
		for (const material of materialList(node.material)) {
			material?.dispose?.();
		}
	});
	return true;
}

function materialList(material) {
	if (!material) return [];
	return Array.isArray(material) ? material : [material];
}
