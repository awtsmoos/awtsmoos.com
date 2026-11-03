// B"H
// Boruch Hashem
// Blessed is He
/**
 * The seam between the Editor's live managers and its plain scene documents.
 * Building a document reads the managers' existing records only. Applying a
 * document rebuilds objects through ObjectManager's internal add path (the same
 * hook undoable commands use, so a document load creates no nested history) and
 * writes keyframes through the timeline's internal add hook for the same reason;
 * the verified interpolation engine is never touched. Geometry honesty: objects
 * born as Editor primitives are rebuilt as fresh unit primitives from their
 * recorded type — vertex-level edit-mode sculpting is not part of the document —
 * and geometry that cannot be rebuilt becomes a flagged placeholder cube whose
 * presence is counted in the returned report.
 */
import * as THREE from "three";
import { Utils } from "../Core/Utils.js";
import { serializeSceneDocument } from "./EditorSceneDocument.js";

/** Unit-primitive factories mirroring ObjectManager.createPrimitive's dimensions. */
const PRIMITIVE_FACTORIES = {
	Box: () => new THREE.BoxGeometry(1, 1, 1),
	Sphere: () => new THREE.SphereGeometry(0.5, 32, 16),
	Plane: () => new THREE.PlaneGeometry(1, 1),
	Cylinder: () => new THREE.CylinderGeometry(0.5, 0.5, 1, 32),
	Cone: () => new THREE.ConeGeometry(0.5, 1, 32),
	Torus: () => new THREE.TorusGeometry(0.5, 0.25, 16, 100)
};

/** Parametric geometry factories for recorded geometry types without an editor type. */
const GEOMETRY_FACTORIES = {
	BoxGeometry: p => new THREE.BoxGeometry(num(p?.width, 1), num(p?.height, 1), num(p?.depth, 1)),
	SphereGeometry: p => new THREE.SphereGeometry(num(p?.radius, 0.5), num(p?.widthSegments, 32), num(p?.heightSegments, 16)),
	PlaneGeometry: p => new THREE.PlaneGeometry(num(p?.width, 1), num(p?.height, 1)),
	CylinderGeometry: p => new THREE.CylinderGeometry(num(p?.radiusTop, 0.5), num(p?.radiusBottom, 0.5), num(p?.height, 1), num(p?.radialSegments, 32)),
	ConeGeometry: p => new THREE.ConeGeometry(num(p?.radius, 0.5), num(p?.height, 1), num(p?.radialSegments, 32)),
	TorusGeometry: p => new THREE.TorusGeometry(num(p?.radius, 0.5), num(p?.tube, 0.25), num(p?.radialSegments, 16), num(p?.tubularSegments, 100))
};

/**
 * Build the current scene document from the live managers.
 * @param {{objectManager:object, timelineManager:object, sceneManager?:object, name?:string}} kelimManagers
 * @returns {object} Scene document.
 */
export function buildSceneDocument(kelimManagers) {
	const { objectManager, timelineManager, sceneManager } = kelimManagers;
	const ohrDocument = serializeSceneDocument({
		name: kelimManagers.name || "Untitled Scene",
		duration: timelineManager.endTime,
		background: sceneManager?.scene?.background?.getHexString
			? `#${sceneManager.scene.background.getHexString()}`
			: null,
		roots: objectManager.getAllObjects(),
		layers: timelineManager.getLayersArray(),
		include: kliObject =>
			objectManager.getObjectByUUID(kliObject.uuid) === kliObject &&
			Boolean(kliObject.userData?.isSelectable) &&
			!kliObject.userData?.isOutline
	});
	// Layer display names follow the objects' current names (renames do not
	// rewrite stored layer records), so the document always tells the truth.
	for (const kliLayer of ohrDocument.layers) {
		const kliObject = objectManager.getObjectByUUID(kliLayer.objectUuid);
		if (kliObject) {
			kliLayer.objectName = kliObject.name;
		}
	}
	return ohrDocument;
}

/**
 * Replace the live scene with a scene document's contents.
 * @param {object} ohrDocument Normalized scene document (see parseSceneDocument).
 * @param {{objectManager:object, timelineManager:object, sceneManager?:object, eventEmitter:object}} kelimManagers
 * @returns {{created:number, placeholders:number, keyframes:number, lastKeyframeTime:number}} Import report.
 */
export function applySceneDocument(ohrDocument, kelimManagers) {
	const { objectManager, timelineManager, sceneManager, eventEmitter } = kelimManagers;
	const ohrReport = { created: 0, placeholders: 0, keyframes: 0, lastKeyframeTime: 0 };

	for (const kliRoot of [...objectManager.getAllObjects()]) {
		objectManager._removeObjectInternal(kliRoot.uuid);
		eventEmitter.emit("objectRemoved", kliRoot);
	}
	objectManager.clearSelection(false);

	const mapLayerByUuid = new Map((ohrDocument.layers || []).map(kliLayer => [kliLayer.objectUuid, kliLayer]));
	const mapObjectByOldUuid = new Map();
	const createRecord = (ohrRecord, kliParent) => {
		const kliObject = buildObject(ohrRecord, ohrReport);
		if (kliObject.name) {
			const kliClash = objectManager.getObjectByName(kliObject.name);
			if (kliClash && kliClash !== kliObject) {
				kliObject.name = Utils.generateUniqueName(kliObject.name, shemName => objectManager.getObjectByName(shemName));
			}
		}
		objectManager._addObjectInternal(kliObject, kliParent, true, true);
		mapObjectByOldUuid.set(ohrRecord.uuid, kliObject);
		ohrReport.created += 1;
		timelineManager.createLayerForObject(kliObject);
		const ohrDocLayer = mapLayerByUuid.get(ohrRecord.uuid);
		for (const kliTrack of ohrDocLayer?.tracks || []) {
			for (const kliKeyframe of kliTrack.keyframes || []) {
				const nivraAdded = timelineManager._addKeyframeInternal(
					kliObject.uuid,
					kliTrack.propertyPath,
					Number(kliKeyframe.time) || 0,
					decodeKeyframeValue(kliKeyframe.value)
				);
				if (nivraAdded) {
					ohrReport.keyframes += 1;
					ohrReport.lastKeyframeTime = Math.max(ohrReport.lastKeyframeTime, Number(kliKeyframe.time) || 0);
				}
			}
		}
		for (const ohrChild of ohrRecord.children || []) {
			createRecord(ohrChild, kliObject);
		}
		return kliObject;
	};
	for (const ohrRecord of ohrDocument.objects || []) {
		createRecord(ohrRecord, objectManager.scene);
	}

	if (ohrDocument.background && sceneManager?.scene?.background?.set) {
		sceneManager.scene.background.set(ohrDocument.background);
	}
	timelineManager.endTime = Math.max(Number(ohrDocument.duration) || 0, ohrReport.lastKeyframeTime, 1);
	eventEmitter.emit("sceneGraphChanged");
	eventEmitter.emit("timelineDataChanged");
	return ohrReport;
}

/**
 * Decode one JSON-safe keyframe value back into its live shape.
 * @param {*} ohrEncoded Encoded value from EditorSceneDocument.encodeKeyframeValue.
 * @returns {*} Live value (THREE value objects rebuilt for tagged shapes).
 */
export function decodeKeyframeValue(ohrEncoded) {
	if (ohrEncoded === null || typeof ohrEncoded !== "object") {
		return ohrEncoded;
	}
	if (Array.isArray(ohrEncoded)) {
		return ohrEncoded.map(decodeKeyframeValue);
	}
	switch (ohrEncoded.$type) {
		case "color":
			return new THREE.Color(ohrEncoded.hex);
		case "vector3":
			return new THREE.Vector3(ohrEncoded.x, ohrEncoded.y, ohrEncoded.z);
		case "quaternion":
			return new THREE.Quaternion(ohrEncoded.x, ohrEncoded.y, ohrEncoded.z, ohrEncoded.w);
		case "euler":
			return new THREE.Euler(ohrEncoded.x, ohrEncoded.y, ohrEncoded.z, ohrEncoded.order || "XYZ");
		default:
			return ohrEncoded;
	}
}

function buildObject(ohrRecord, ohrReport) {
	let kliObject;
	if (ohrRecord.isGroup) {
		kliObject = new THREE.Group();
	} else {
		kliObject = new THREE.Mesh(buildGeometry(ohrRecord, ohrReport), buildMaterial(ohrRecord));
	}
	kliObject.name = ohrRecord.name || "";
	if (ohrRecord.editorType) {
		kliObject.userData.type = ohrRecord.editorType;
	}
	if (ohrRecord.placeholder) {
		kliObject.userData.importedPlaceholder = true;
	}
	kliObject.position.set(...triple(ohrRecord.position, 0));
	kliObject.rotation.set(...triple(ohrRecord.rotation, 0));
	kliObject.scale.set(...triple(ohrRecord.scale, 1));
	kliObject.visible = ohrRecord.visible !== false;
	return kliObject;
}

function buildGeometry(ohrRecord, ohrReport) {
	if (ohrRecord.editorType && PRIMITIVE_FACTORIES[ohrRecord.editorType]) {
		return PRIMITIVE_FACTORIES[ohrRecord.editorType]();
	}
	const ohrGeometry = ohrRecord.geometry;
	if (ohrGeometry?.type && GEOMETRY_FACTORIES[ohrGeometry.type]) {
		return GEOMETRY_FACTORIES[ohrGeometry.type](ohrGeometry.parameters || {});
	}
	ohrReport.placeholders += 1;
	ohrRecord.placeholder = true;
	return new THREE.BoxGeometry(1, 1, 1);
}

function buildMaterial(ohrRecord) {
	const ohrMaterial = ohrRecord.material;
	const kliMaterial = new THREE.MeshStandardMaterial({
		color: 0xffffff,
		roughness: 0.7,
		metalness: 0.1,
		side: THREE.DoubleSide
	});
	if (ohrMaterial?.color) {
		kliMaterial.color.set(ohrMaterial.color);
	}
	if (typeof ohrMaterial?.roughness === "number") {
		kliMaterial.roughness = ohrMaterial.roughness;
	}
	if (typeof ohrMaterial?.metalness === "number") {
		kliMaterial.metalness = ohrMaterial.metalness;
	}
	if (typeof ohrMaterial?.opacity === "number") {
		kliMaterial.opacity = ohrMaterial.opacity;
	}
	if (typeof ohrMaterial?.transparent === "boolean") {
		kliMaterial.transparent = ohrMaterial.transparent;
	}
	return kliMaterial;
}

function triple(reshimuValues, ohrFallback) {
	return [0, 1, 2].map(misparIndex => num(reshimuValues?.[misparIndex], ohrFallback));
}

function num(ohrValue, ohrFallback) {
	const mispar = Number(ohrValue);
	return Number.isFinite(mispar) ? mispar : ohrFallback;
}
