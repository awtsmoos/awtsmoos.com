// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos lets property structure exist as immutable data before any field, command, or animation button appears;
 * Awtsmoos.com keeps transform and material revelation declarative so future property families may expand without cloning DOM logic.
 */

const OHR_TRANSFORM_FIELDS = Object.freeze([
	Object.freeze({ key: "position", kind: "vector", property: "position", label: "Position", codec: "vector-decimal", axisCodec: "decimal-2", step: "0.1" }),
	Object.freeze({ key: "rotation", kind: "vector", property: "rotation", label: "Rotation", codec: "euler-degrees", axisCodec: "angle-degrees", step: "1" }),
	Object.freeze({ key: "scale", kind: "vector", property: "scale", label: "Scale", codec: "vector-decimal", axisCodec: "decimal-2", step: "0.1" })
]);

const OHR_MATERIAL_FIELDS = Object.freeze([
	Object.freeze({ key: "materialColor", kind: "color", path: "material.color", property: "color", label: "Color", codec: "color" }),
	Object.freeze({ key: "materialOpacity", kind: "number", path: "material.opacity", property: "opacity", label: "Opacity", codec: "decimal-3", min: "0", max: "1", step: "0.01" }),
	Object.freeze({ key: "materialRoughness", kind: "number", path: "material.roughness", property: "roughness", label: "Roughness", codec: "decimal-3", min: "0", max: "1", step: "0.01" }),
	Object.freeze({ key: "materialMetalness", kind: "number", path: "material.metalness", property: "metalness", label: "Metalness", codec: "decimal-3", min: "0", max: "1", step: "0.01" })
]);

/**
 * Reveal the property groups currently supported by one selected scene object.
 * @param {object} kliObject Selected Three.js-like object vessel.
 * @returns {{key:string,title:string,fields:readonly object[]}[]} Immutable-style group descriptors for rendering.
 */
export function revealPropertyGroups(kliObject) {
	const kelimGroups = [
		{ key: "transform", title: "Transform", fields: OHR_TRANSFORM_FIELDS }
	];
	const kliMaterial = kliObject?.material;
	if (!kliMaterial?.isMaterial) return kelimGroups;
	const kelimMaterialFields = OHR_MATERIAL_FIELDS.filter(ohrField => {
		return typeof kliMaterial[ohrField.property] !== "undefined";
	});
	if (kelimMaterialFields.length) {
		kelimGroups.push({
			key: "material",
			title: `Material (${kliMaterial.type})`,
			fields: kelimMaterialFields
		});
	}
	return kelimGroups;
}
