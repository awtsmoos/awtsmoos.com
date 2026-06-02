// B"H
/**
 * @file movement.js
 * @description
 * Chapter 71: The Gait Heard The Durable Crown.
 *
 * The Awtsmoos showed that `moving.running` is a frame breath, not a crown.
 * It can be false for one frame while controls are renewing themselves, causing
 * the robe to flash into walk. Animation now reads the durable world run mode
 * first, then falls back to the frame flag only when the world has no mode.
 */
import Utils from "../../../utils.js";

/** @param {string|Function|object|null} entry Animation map entry. @returns {string|null} */
function resolveEntry(entry) {
    if (!entry) return null;
    if (typeof entry === "string") return entry;
    if (typeof entry === "function") return entry();
    if (typeof entry !== "object") return null;
    const ran = Math.random();
    let sum = 0;
    let found = null;
    Object.entries(entry).forEach(pair => {
        if (found !== null) return;
        if (typeof pair[1] === "number" && pair[1] <= 1) sum += pair[1];
        if (ran <= sum) found = pair[0];
    });
    return found;
}

/** @param {object} entity Chai-like entity. @returns {boolean} True when durable run mode is active. */
function isRunMode(entity) {
    if (entity?.olam?.runMode === "run") return true;
    if (entity?.olam?.runMode === "walk") return false;
    if (entity?.olam?.inputs && Object.prototype.hasOwnProperty.call(entity.olam.inputs, "RUNNING")) return entity.olam.inputs.RUNNING === true;
    return entity?.moving?.running === true;
}

/** @param {object} entity Chai-like entity. @param {string} nm Requested animation role. @returns {string} Animation role. */
function gaitAwareKey(entity, nm) {
    if (nm !== "run" && nm !== "walk") return nm;
    return isRunMode(entity) ? "run" : "walk";
}

export default {
    /** Clears per-frame movement flags while preserving durable mode in Olam inputs. */
    resetMoving() {
        Object.keys(this.moving).forEach(q => {
            this.moving[q] = false;
        });
    },

    /** @param {string} nm Animation role like run, walk, jump, idle. @returns {string|null} Clip search string. */
    getChaweeyoos(nm) {
        const role = gaitAwareKey(this, nm);
        const primary = resolveEntry(this.chaweeyoosMap?.[role]);
        if (primary) return primary;
        if (role !== nm) return resolveEntry(this.chaweeyoosMap?.[nm]);
        return null;
    },

    /** @returns {object} Forward vector from the model garment. */
    getModelVector() {
        return Utils.getForwardVector(this.modelMesh, this.currentModelVector);
    },

    /** @returns {object} Forward vector from non-rotating movement body. */
    getForwardVector() {
        return Utils.getForwardVector(this.nonRotatingEmptyForMovement, this.worldDirectionVector);
    }
};
