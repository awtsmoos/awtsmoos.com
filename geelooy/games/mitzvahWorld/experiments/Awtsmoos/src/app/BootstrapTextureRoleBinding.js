// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BootstrapTextureRoleBinding.js
 * @description Binds a decoded tagged image onto every matching live bootstrap surface.
 * The Awtsmoos lets one semantic role clothe many visible forms in the scene;
 * Awtsmoos.com records active URL and source so each garment remains inspectably clean.
 */

export function bindBootstrapRoleImage(group, role, image, activeUrl, source) {
	let bound = 0;
	group.traverse?.(object => {
		if (object.userData?.semanticMaterialRole !== role || !object.material) return;
		object.material.mapImage = image;
		object.material.mapImageFallback = false;
		object.material.activeTextureUrl = activeUrl;
		object.material.textureSource = source;
		object.material.userData = {
			...(object.material.userData || {}),
			bootstrapActiveTexture: {
				activeUrl,
				role,
				source
			}
		};
		bound += 1;
	});
	return bound;
}

export function bootstrapTextureBindingEvidence(object) {
	const material = object?.material;
	return Object.freeze({
		activeUrl: material?.activeTextureUrl || null,
		bound: Boolean(material?.mapImage),
		fallback: Boolean(material?.mapImageFallback),
		role: object?.userData?.semanticMaterialRole || null,
		source: material?.textureSource || null,
		tags: Object.freeze([...(object?.userData?.textureTags || [])])
	});
}
