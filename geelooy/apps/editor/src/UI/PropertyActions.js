// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos lets visible property intention become history-safe scene mutation and timeline revelation through one focused Yesod vessel.
 * Awtsmoos.com keeps commands, keyframes, and unit conversion outside the view so every field remains simple while its effects stay explicit.
 */
import { SetPropertyCommand } from "../History/Commands/SetPropertyCommand.js";
import { Track } from "../Timeline/Track.js";
import { createVectorDomainValue, decodePropertyInput } from "./PropertyValueCodec.js";

/** Own property-side effects while leaving rendering and live synchronization pure of command construction. */
export class YesodPropertyActions {
	/**
	 * Bind existing Editor services required for undoable property mutation and historical keyframe events.
	 * @param {object} ohrEmitter Existing Editor event emitter.
	 * @param {object} olamObjectManager Existing scene-object service.
	 * @param {object} netzachTimelineManager Existing timeline service.
	 * @param {object} chochmahHistoryManager Existing undo/redo service.
	 */
	constructor(ohrEmitter, olamObjectManager, netzachTimelineManager, chochmahHistoryManager) {
		this.ohrEmitter = ohrEmitter;
		this.olamObjectManager = olamObjectManager;
		this.netzachTimelineManager = netzachTimelineManager;
		this.chochmahHistoryManager = chochmahHistoryManager;
	}

	/**
	 * Reveal whether a keyframe exists for one property at the timeline's current instant.
	 * @param {object} kliObject Selected scene object.
	 * @param {string} shemPath Dot-separated property path.
	 * @returns {boolean} True when the track owns a keyframe at currentTime.
	 */
	hasKeyframeNow(kliObject, shemPath) {
		const kliLayer = this.netzachTimelineManager.getLayer(kliObject.uuid);
		const kliTrack = kliLayer?.getTrack(shemPath);
		return Boolean(kliTrack?.getKeyframeAt(this.netzachTimelineManager.currentTime));
	}

	/**
	 * Emit the historical create-or-remove keyframe request with the property's current scene-domain value.
	 * @param {object} kliObject Selected scene object.
	 * @param {string} shemPath Dot-separated property path.
	 */
	toggleKeyframe(kliObject, shemPath) {
		this.ohrEmitter.emit("createKeyframeRequest", {
			objectUUID: kliObject.uuid,
			propertyPath: shemPath,
			value: Track.getObjectPropertyValue(kliObject, shemPath)
		});
	}

	/**
	 * Decode one scalar/color input and add a global-free SetPropertyCommand when the proposed value is valid.
	 * @param {object} kliObject Selected scene object.
	 * @param {object} ohrField Scalar/color descriptor.
	 * @param {HTMLInputElement} kliInput Edited input vessel.
	 */
	commitField(kliObject, ohrField, kliInput) {
		const ohrNewValue = decodePropertyInput(kliInput.value, ohrField.codec);
		if (typeof ohrNewValue === "undefined") return;
		this.addPropertyCommand(kliObject, ohrField.path, ohrNewValue);
	}

	/**
	 * Decode all visible axes into one Vector3/Euler domain value and add one history command for the compound property.
	 * @param {object} kliObject Selected scene object.
	 * @param {object} ohrField Vector/Euler descriptor.
	 * @param {Record<string,HTMLInputElement>} kelimAxes Inputs indexed by x/y/z.
	 */
	commitVector(kliObject, ohrField, kelimAxes) {
		const ohrNewValue = createVectorDomainValue(kliObject, ohrField, {
			x: kelimAxes.x.value,
			y: kelimAxes.y.value,
			z: kelimAxes.z.value
		});
		if (!ohrNewValue) return;
		this.addPropertyCommand(kliObject, ohrField.property, ohrNewValue);
	}

	/**
	 * Create one undoable property command with explicit ObjectManager injection and add it to HistoryManager.
	 * @param {object} kliObject Selected scene object.
	 * @param {string} shemPath Dot-separated property path.
	 * @param {*} ohrNewValue New scene-domain value.
	 */
	addPropertyCommand(kliObject, shemPath, ohrNewValue) {
		const ohrOldValue = Track.getObjectPropertyValue(kliObject, shemPath);
		const kliCommand = new SetPropertyCommand(
			this.ohrEmitter,
			this.olamObjectManager,
			kliObject.uuid,
			shemPath,
			ohrOldValue,
			ohrNewValue
		);
		this.chochmahHistoryManager.add(kliCommand);
	}
}
