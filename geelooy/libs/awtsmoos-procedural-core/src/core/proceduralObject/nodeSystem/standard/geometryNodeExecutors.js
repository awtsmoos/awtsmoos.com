// B"H
// Boruch Hashem
// Blessed is He
/** Geometry executors delegate to the existing renderer-neutral mesh foundation. */

import {buildBoxGeometry} from "../../geometry/buildBoxGeometry.js";
import {buildCylinderGeometry} from "../../geometry/buildCylinderGeometry.js";
import {buildPlaneGeometry} from "../../geometry/buildPlaneGeometry.js";
import {buildUvSphereGeometry} from "../../geometry/buildUvSphereGeometry.js";
import {mergeGeometries} from "../../geometry/mergeGeometries.js";
import {transformGeometry} from "../../geometry/transformGeometry.js";

function identifier(config, fallback) {
	return typeof config.id === "string" ? config.id : fallback;
}

export const STANDARD_GEOMETRY_EXECUTORS = Object.freeze({
	"geometry.box": ({inputs, config}) => ({
		geometry: buildBoxGeometry(inputs, identifier(config, "node-box"))
	}),
	"geometry.plane": ({inputs, config}) => ({
		geometry: buildPlaneGeometry({
			size: inputs.size, segments: inputs.segments, center: inputs.center
		}, identifier(config, "node-plane"))
	}),
	"geometry.uv-sphere": ({inputs, config}) => ({
		geometry: buildUvSphereGeometry({
			radii: inputs.radii, center: inputs.center,
			width_segments: inputs.widthSegments,
			height_segments: inputs.heightSegments
		}, identifier(config, "node-sphere"))
	}),
	"geometry.cylinder": ({inputs, config}) => ({
		geometry: buildCylinderGeometry({
			radius_bottom: inputs.radiusBottom, radius_top: inputs.radiusTop,
			height: inputs.height, radial_segments: inputs.segments,
			center: inputs.center
		}, identifier(config, "node-cylinder"))
	}),
	"geometry.transform": ({inputs, config}) => ({
		geometry: transformGeometry(inputs.geometry, {
			translation: inputs.translation,
			rotation: inputs.rotation,
			scale: inputs.scale
		}, identifier(config, "node-transform"))
	}),
	"geometry.join": ({inputs, config}) => ({
		geometry: mergeGeometries(inputs.geometries ?? [], identifier(config, "node-join"))
	}),
	"geometry.output": ({inputs}) => ({geometry: inputs.geometry})
});
