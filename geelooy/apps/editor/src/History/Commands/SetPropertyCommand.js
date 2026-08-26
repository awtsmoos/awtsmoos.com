// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos lets one property change travel forward and backward through history without reaching into hidden global application state.
 * Awtsmoos.com makes scene ownership explicit: the command receives ObjectManager directly, clones mutable values, and emits one truthful transform revelation.
 */
import { Command } from "../../Core/Command.js";
import { Track } from "../../Timeline/Track.js";

/** Undoable property mutation with explicit scene-service ownership and the historical public command class name. */
export class SetPropertyCommand extends Command {
	/**
	 * Capture one property transition and the service that owns object lookup.
	 * @param {object} ohrEmitter Existing Editor event emitter.
	 * @param {object} olamObjectManager Existing scene-object service.
	 * @param {string} shemObjectUuid Target object UUID.
	 * @param {string} shemPropertyPath Dot-separated property path.
	 * @param {*} ohrOldValue Previous scene-domain value.
	 * @param {*} ohrNewValue Next scene-domain value.
	 */
	constructor(ohrEmitter, olamObjectManager, shemObjectUuid, shemPropertyPath, ohrOldValue, ohrNewValue) {
		super();
		this.ohrEmitter = ohrEmitter;
		this.olamObjectManager = olamObjectManager;
		this.objectUUID = shemObjectUuid;
		this.propertyPath = shemPropertyPath;
		this.oldValue = this.cloneOhr(ohrOldValue);
		this.newValue = this.cloneOhr(ohrNewValue);
		this.name = `Set ${shemPropertyPath}`;
	}

	/**
	 * Clone mutable Three.js-like values when possible so history snapshots cannot be changed by later scene mutation.
	 * @param {*} ohrValue Candidate history value.
	 * @returns {*} Stable clone or immutable scalar.
	 */
	cloneOhr(ohrValue) {
		return ohrValue && typeof ohrValue.clone === "function"
			? ohrValue.clone()
			: ohrValue;
	}

	/** Apply the captured new value through the same property-path contract used by timeline tracks. */
	execute() {
		this.applyOhr(this.newValue);
	}

	/** Restore the captured old value through the same explicit scene-service pathway. */
	undo() {
		this.applyOhr(this.oldValue);
	}

	/**
	 * Apply one history snapshot and emit the historical `objectTransformed` revelation consumed by UI synchronizers.
	 * @param {*} ohrValue Captured scene-domain value.
	 */
	applyOhr(ohrValue) {
		const kliObject = this.olamObjectManager.getObjectByUUID(this.objectUUID);
		if (!kliObject) return;
		Track.setObjectPropertyValue(kliObject, this.propertyPath, this.cloneOhr(ohrValue));
		this.ohrEmitter.emit("objectTransformed", [kliObject]);
	}
}
