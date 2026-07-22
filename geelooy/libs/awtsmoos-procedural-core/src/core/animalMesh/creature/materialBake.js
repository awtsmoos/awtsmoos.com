// B"H
// Boruch Hashem
// Blessed is He

function colorForLayer(layer, coordinate, normal) {
	const palette = layer.palette?.length ? layer.palette : [[0.5, 0.5, 0.5, 1]];
	const pattern = layer.pattern?.type || "solid";
	let selector = 0;
	if (pattern === "stripes") {
		selector = Math.abs(Math.floor(coordinate * Number(layer.pattern.frequency || 6))) % palette.length;
	} else if (pattern === "spots") {
		selector = Math.abs(Math.floor((coordinate + normal[1] * normal[2]) * Number(layer.pattern.frequency || 11))) % palette.length;
	}
	return palette[selector] || palette[0];
}

function blend(base, overlay, opacity) {
	return base.map((value, index) => value * (1 - opacity) + Number(overlay[index] ?? (index === 3 ? 1 : 0)) * opacity);
}

/**
 * Bakes procedural anatomical paint into optional per-vertex RGBA output. The
 * recipe remains authoritative, so this UV-independent Asiyah bake can be renewed
 * after remeshing without losing dorsal, ventral, axial, or region meaning.
 * @param {Object} creature - BriahCreature with material layers.
 * @param {Object} mesh - Renderer-neutral mesh.
 * @returns {Object} Optional baked color artifact.
 */
export function bakeCreatureMaterials(creature, mesh) {
	const vertexCount = mesh.positions.length / 3;
	const colors = new Float32Array(vertexCount * 4);
	for (let vertex = 0; vertex < vertexCount; vertex += 1) {
		const coordinate = vertexCount <= 1 ? 0 : vertex / (vertexCount - 1);
		const normal = [...mesh.normals.slice(vertex * 3, vertex * 3 + 3)];
		let color = [0.5, 0.5, 0.5, 1];
		for (const layer of creature.materialLayers) {
			const maskType = layer.mask?.type || "all";
			const included = maskType === "all" || (maskType === "dorsal" && normal[2] >= 0) || (maskType === "ventral" && normal[2] < 0) || maskType === "body-axis";
			if (included) {
				color = blend(color, colorForLayer(layer, coordinate, normal), layer.opacity);
			}
		}
		colors.set(color, vertex * 4);
	}
	return { type: "creature-material-bake", colors, coordinateSource: "semantic-anatomy", sourceLayerIds: creature.materialLayers.map((layer) => layer.id) };
}
