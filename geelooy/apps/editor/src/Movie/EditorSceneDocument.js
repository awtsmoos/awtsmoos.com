// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Editor's scene used to exist only as live THREE objects in memory; the Awtsmoos
 * now lets Awtsmoos.com speak of it as one plain document — objects with transforms,
 * materials, and hierarchy, plus timeline layers, tracks, and keyframes copied through
 * the managers' existing plain-data shapes (never through the interpolation engine).
 * This module is deliberately free of THREE imports: it reads duck-typed records so the
 * format itself can be verified anywhere, and value decoding lives with the THREE glue.
 */

export const EDITOR_SCENE_FORMAT = "awtsmoos-mitzvah-world-scene";
export const EDITOR_SCENE_VERSION = 1;

/**
 * Serialize the live scene into the canonical Editor scene document.
 * @param {{name?:string, duration?:number, background?:string|null, roots?:object[], layers?:object[], include?:(object:object)=>boolean}} reshimuScene
 * Manager-shaped inputs: roots are scene objects, layers are timeline Layer records.
 * @returns {object} JSON-safe scene document.
 */
export function serializeSceneDocument(reshimuScene = {}) {
	return {
		format: EDITOR_SCENE_FORMAT,
		version: EDITOR_SCENE_VERSION,
		name: reshimuScene.name || "Untitled Scene",
		duration: finiteNumber(reshimuScene.duration, 0),
		background: reshimuScene.background || null,
		objects: (reshimuScene.roots || []).map(kliObject =>
			serializeObjectRecord(kliObject, reshimuScene.include)
		),
		layers: (reshimuScene.layers || []).map(serializeLayerRecord)
	};
}

/**
 * Serialize one scene object and its included descendants into a plain record.
 * @param {object} kliObject Duck-typed scene object (position/rotation/scale vectors).
 * @param {(object:object)=>boolean} [tivInclude] Child filter; defaults to selectable non-outline objects.
 * @returns {object} JSON-safe object record.
 */
export function serializeObjectRecord(kliObject, tivInclude) {
	const include = typeof tivInclude === "function" ? tivInclude : defaultInclude;
	const record = {
		uuid: kliObject.uuid,
		name: kliObject.name || "",
		editorType: kliObject.userData?.type || null,
		threeType: kliObject.type || null,
		isGroup: Boolean(kliObject.isGroup),
		visible: kliObject.visible !== false,
		position: vectorToArray(kliObject.position, 0),
		rotation: eulerToArray(kliObject.rotation),
		scale: vectorToArray(kliObject.scale, 1),
		geometry: serializeGeometry(kliObject),
		material: serializeMaterial(kliObject),
		children: []
	};
	for (const kliChild of kliObject.children || []) {
		if (include(kliChild)) {
			record.children.push(serializeObjectRecord(kliChild, include));
		}
	}
	return record;
}

/**
 * Serialize one timeline layer (objectUUID/objectName + a Map or record of tracks).
 * @param {object} kliLayer Timeline layer record.
 * @returns {object} JSON-safe layer record with verbatim keyframes.
 */
export function serializeLayerRecord(kliLayer) {
	const reshimuTracks = kliLayer?.tracks instanceof Map
		? [...kliLayer.tracks.values()]
		: Object.values(kliLayer?.tracks || {});
	return {
		objectUuid: kliLayer?.objectUUID ?? kliLayer?.objectUuid ?? null,
		objectName: kliLayer?.objectName || "",
		tracks: reshimuTracks.map(kliTrack => ({
			propertyPath: kliTrack.propertyPath,
			keyframes: (kliTrack.keyframes || []).map(kliKeyframe => ({
				time: finiteNumber(kliKeyframe.time, 0),
				value: encodeKeyframeValue(kliKeyframe.value),
				interpolation: kliKeyframe.interpolation || "LINEAR"
			}))
		}))
	};
}

/**
 * Encode one keyframe value into JSON-safe data. Numbers and other primitives pass
 * through untouched (the component tracks the Editor actually authors); THREE-shaped
 * values are tagged so the import side can rebuild them exactly.
 * @param {*} ohrValue Live keyframe value.
 * @returns {*} JSON-safe value.
 */
export function encodeKeyframeValue(ohrValue) {
	if (ohrValue === null || typeof ohrValue !== "object") {
		return ohrValue;
	}
	if (ohrValue.isColor && typeof ohrValue.getHex === "function") {
		return { $type: "color", hex: ohrValue.getHex() };
	}
	if (ohrValue.isQuaternion) {
		return { $type: "quaternion", x: ohrValue.x, y: ohrValue.y, z: ohrValue.z, w: ohrValue.w };
	}
	if (ohrValue.isEuler) {
		return { $type: "euler", x: ohrValue.x, y: ohrValue.y, z: ohrValue.z, order: ohrValue.order || "XYZ" };
	}
	if (ohrValue.isVector3) {
		return { $type: "vector3", x: ohrValue.x, y: ohrValue.y, z: ohrValue.z };
	}
	if (Array.isArray(ohrValue)) {
		return ohrValue.map(encodeKeyframeValue);
	}
	try {
		return JSON.parse(JSON.stringify(ohrValue));
	} catch {
		return String(ohrValue);
	}
}

/**
 * Parse and normalize a scene document from JSON text or a plain object.
 * @param {string|object} reshimuInput JSON text or document object.
 * @returns {object} Normalized scene document.
 * @throws {SyntaxError} When text is not valid JSON (message preserved for the UI).
 * @throws {TypeError} When the document is not an Editor scene document.
 */
export function parseSceneDocument(reshimuInput) {
	const ohrDocument = typeof reshimuInput === "string"
		? JSON.parse(reshimuInput)
		: reshimuInput;
	if (!ohrDocument || typeof ohrDocument !== "object" || Array.isArray(ohrDocument)) {
		throw new TypeError("Scene document must be a JSON object.");
	}
	if (ohrDocument.format !== EDITOR_SCENE_FORMAT) {
		throw new TypeError(`Not an Editor scene document (expected format "${EDITOR_SCENE_FORMAT}").`);
	}
	if (Number(ohrDocument.version) !== EDITOR_SCENE_VERSION) {
		throw new TypeError(`Unsupported scene document version: ${ohrDocument.version}.`);
	}
	return {
		format: EDITOR_SCENE_FORMAT,
		version: EDITOR_SCENE_VERSION,
		name: typeof ohrDocument.name === "string" && ohrDocument.name ? ohrDocument.name : "Untitled Scene",
		duration: finiteNumber(ohrDocument.duration, 0),
		background: typeof ohrDocument.background === "string" ? ohrDocument.background : null,
		objects: Array.isArray(ohrDocument.objects) ? ohrDocument.objects : [],
		layers: Array.isArray(ohrDocument.layers) ? ohrDocument.layers : []
	};
}

/**
 * Flatten a scene document's object tree into creation order (parents first).
 * @param {object} ohrDocument Scene document.
 * @returns {{record:object, parentUuid:string|null}[]} Flat records.
 */
export function flattenSceneObjects(ohrDocument) {
	const reshimuFlat = [];
	const walk = (reshimuRecords, shemParentUuid) => {
		for (const ohrRecord of reshimuRecords || []) {
			reshimuFlat.push({ record: ohrRecord, parentUuid: shemParentUuid });
			walk(ohrRecord.children, ohrRecord.uuid);
		}
	};
	walk(ohrDocument?.objects, null);
	return reshimuFlat;
}

function defaultInclude(kliObject) {
	return Boolean(kliObject?.userData?.isSelectable) && !kliObject?.userData?.isOutline;
}

function serializeGeometry(kliObject) {
	if (!kliObject.geometry) {
		return null;
	}
	const reshimuParameters = {};
	for (const [shemKey, ohrValue] of Object.entries(kliObject.geometry.parameters || {})) {
		if (typeof ohrValue === "number" || typeof ohrValue === "boolean" || typeof ohrValue === "string") {
			reshimuParameters[shemKey] = ohrValue;
		}
	}
	return { type: kliObject.geometry.type || "BufferGeometry", parameters: reshimuParameters };
}

function serializeMaterial(kliObject) {
	const kliMaterial = Array.isArray(kliObject.material) ? kliObject.material[0] : kliObject.material;
	if (!kliMaterial) {
		return null;
	}
	const record = { type: kliMaterial.type || null };
	if (typeof kliMaterial.color?.getHexString === "function") {
		record.color = `#${kliMaterial.color.getHexString()}`;
	}
	for (const shemKey of ["roughness", "metalness", "opacity"]) {
		if (typeof kliMaterial[shemKey] === "number") {
			record[shemKey] = kliMaterial[shemKey];
		}
	}
	if (typeof kliMaterial.transparent === "boolean") {
		record.transparent = kliMaterial.transparent;
	}
	return record;
}

function vectorToArray(kliVector, ohrFallback) {
	return [
		finiteNumber(kliVector?.x, ohrFallback),
		finiteNumber(kliVector?.y, ohrFallback),
		finiteNumber(kliVector?.z, ohrFallback)
	];
}

function eulerToArray(kliEuler) {
	return vectorToArray(kliEuler, 0);
}

function finiteNumber(ohrValue, ohrFallback) {
	const mispar = Number(ohrValue);
	return Number.isFinite(mispar) ? mispar : ohrFallback;
}
