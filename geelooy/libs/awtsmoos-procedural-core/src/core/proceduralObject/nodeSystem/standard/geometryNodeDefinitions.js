// B"H
// Boruch Hashem
// Blessed is He
/** Standard geometry definitions expose meaningful shape operations as data. */

import {definition, input, output} from "./nodeDefinitionHelpers.js";

export const STANDARD_GEOMETRY_NODE_DEFINITIONS = Object.freeze([
	definition("geometry.box", "geometry", [
		input("size", "vector", [1, 1, 1]), input("center", "point", [0, 0, 0])
	], [output("geometry", "geometry")]),
	definition("geometry.plane", "geometry", [
		input("size", "vector", [1, 1, 0]), input("segments", "vector", [1, 1, 0]),
		input("center", "point", [0, 0, 0])
	], [output("geometry", "geometry")]),
	definition("geometry.uv-sphere", "geometry", [
		input("radii", "vector", [0.5, 0.5, 0.5]), input("center", "point", [0, 0, 0]),
		input("widthSegments", "integer", 24), input("heightSegments", "integer", 16)
	], [output("geometry", "geometry")]),
	definition("geometry.cylinder", "geometry", [
		input("radiusBottom", "float", 0.5), input("radiusTop", "float", 0.5),
		input("height", "distance", 1), input("segments", "integer", 24),
		input("center", "point", [0, 0, 0])
	], [output("geometry", "geometry")]),
	definition("geometry.transform", "geometry", [
		input("geometry", "geometry"), input("translation", "translation", [0, 0, 0]),
		input("rotation", "rotation", [0, 0, 0]), input("scale", "vector", [1, 1, 1])
	], [output("geometry", "geometry")]),
	definition("geometry.join", "geometry", [
		input("geometries", "geometry", null, {multiInput: true})
	], [output("geometry", "geometry")]),
	definition("geometry.output", "geometry", [input("geometry", "geometry")], [
		output("geometry", "geometry")
	])
]);
