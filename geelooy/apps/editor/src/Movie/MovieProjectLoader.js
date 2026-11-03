// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file MovieProjectLoader.js
 * @description The Awtsmoos lets a declared JSON project become a living Mitzvah World scene without a single guessed intention;
 * Awtsmoos.com validates every object, keyframe, and instant before one stone is placed, so a broken scroll is named aloud and never silently swallowed.
 *
 * Project JSON schema (editor movie project, version 1):
 * { "name": "My Movie", "duration": 3, "objects": [ {
 *   "name": "Hero", "type": "Box", "color": "#ff3333", "position": [0, 0.5, 0],
 *   "keyframes": [ { "property": "position.x", "time": 0, "value": -3 } ] } ] }
 * duration: required seconds > 0. objects: required non-empty; type is one of
 * Box | Sphere | Plane | Cylinder | Cone | Torus; name/color/position optional.
 * keyframes: property is position.x/y/z, rotation.x/y/z, scale.x/y/z, or
 * material.opacity; time within [0, duration]; value numeric.
 */
import * as THREE from 'three';

const PRIMITIVE_TYPES = ['box', 'sphere', 'plane', 'cylinder', 'cone', 'torus'];
const ANIMATABLE = /^(position|rotation|scale)\.[xyz]$|^material\.opacity$/;

/**
 * Parse, validate, and build one editor movie project inside the live App.
 * @param {object} app The running editor App (window.MWA).
 * @param {string} jsonText Raw project JSON text from the user.
 * @returns {{name:string, duration:number, objects:object[], keyframes:number}} Load summary.
 * @throws {Error} With a user-readable message when the JSON or project is invalid.
 */
export function loadMovieProject(app, jsonText) {
	const project = parseProject(jsonText);
	const created = [];
	let keyframeCount = 0;
	for (const spec of project.objects) {
		const mesh = buildObject(app, spec);
		created.push({ name: mesh.name, uuid: mesh.uuid });
		keyframeCount += addKeyframes(app, mesh, spec);
	}
	const timeline = app.timelineManager;
	timeline.playback.endTime = project.duration;
	if ('endTime' in timeline) timeline.endTime = project.duration;
	timeline.emitTimelineDataChanged?.();
	timeline.seek(0);
	return { name: project.name, duration: project.duration, objects: created, keyframes: keyframeCount };
}

/** @param {string} jsonText Raw text. @returns {object} Validated project data. */
function parseProject(jsonText) {
	let data;
	try {
		data = JSON.parse(String(jsonText));
	} catch (error) {
		throw new Error(`Project JSON is not valid JSON: ${error.message}`);
	}
	if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('Project JSON must be an object with "duration" and "objects".');
	const duration = Number(data.duration);
	if (!Number.isFinite(duration) || duration <= 0) {
		throw new Error('Project "duration" must be a positive number of seconds.');
	}
	if (!Array.isArray(data.objects) || data.objects.length === 0) {
		throw new Error('Project "objects" must be a non-empty array.');
	}
	data.objects.forEach((spec, index) => validateObject(spec, index, duration));
	return { name: String(data.name || 'Untitled Movie'), duration, objects: data.objects };
}

/** @param {object} spec One object spec. @param {number} index Position for error messages. @param {number} duration Project duration. */
function validateObject(spec, index, duration) {
	const where = `objects[${index}]`;
	if (!spec || typeof spec !== 'object') throw new Error(`${where} must be an object.`);
	const type = String(spec.type || 'Box').toLowerCase();
	if (!PRIMITIVE_TYPES.includes(type)) {
		throw new Error(`${where}.type "${spec.type}" is not one of: ${PRIMITIVE_TYPES.join(', ')}.`);
	}
	if (spec.position !== undefined && (!Array.isArray(spec.position) || spec.position.length !== 3 || spec.position.some(v => !Number.isFinite(Number(v))))) {
		throw new Error(`${where}.position must be [x, y, z] numbers.`);
	}
	for (const keyframe of spec.keyframes || []) {
		if (!ANIMATABLE.test(String(keyframe?.property || ''))) {
			throw new Error(`${where} keyframe property "${keyframe?.property}" is not animatable (use position.x, rotation.y, scale.z, material.opacity, ...).`);
		}
		const time = Number(keyframe.time);
		if (!Number.isFinite(time) || time < 0 || time > duration) {
			throw new Error(`${where} keyframe time ${keyframe.time} is outside [0, ${duration}].`);
		}
		if (!Number.isFinite(Number(keyframe.value))) {
			throw new Error(`${where} keyframe value for ${keyframe.property} must be a number.`);
		}
	}
}

/** @param {object} app Editor App. @param {object} spec Validated object spec. @returns {object} Created THREE mesh. */
function buildObject(app, spec) {
	const position = new THREE.Vector3(...(spec.position || [0, 0.5, 0]).map(Number));
	const mesh = app.objectManager.createPrimitive(spec.type || 'Box', position);
	if (!mesh) throw new Error(`Could not create object of type "${spec.type}".`);
	if (!mesh.parent) app.objectManager._addObjectInternal(mesh);
	mesh.position.set(position.x, position.y, position.z);
	if (spec.name) mesh.name = String(spec.name);
	if (spec.color && mesh.material?.color) mesh.material.color.set(String(spec.color));
	if (!app.timelineManager.getLayer(mesh.uuid)) app.timelineManager.createLayerForObject(mesh);
	return mesh;
}

/** @param {object} app Editor App. @param {object} mesh Created mesh. @param {object} spec Object spec. @returns {number} Keyframes added. */
function addKeyframes(app, mesh, spec) {
	let added = 0;
	for (const keyframe of spec.keyframes || []) {
		const ok = app.timelineManager._addKeyframeInternal(
			mesh.uuid,
			String(keyframe.property),
			Number(keyframe.time),
			Number(keyframe.value)
		);
		if (!ok) throw new Error(`Could not add keyframe ${keyframe.property} @ ${keyframe.time}s for "${mesh.name}".`);
		added++;
	}
	return added;
}
