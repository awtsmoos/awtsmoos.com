
// B"H
/**
 * @file shapeKeySystem.js
 * @brief
 *   THE LIVING EXPRESSION ENGINE — ShapeKeySystem v2
 *   ==================================================
 *   Manages morph-target (shape key) animation for all registered mesh objects.
 *
 * @module shapeKeySystem
 */

export class ShapeKeySystem {

    constructor(renderer) {
        this.renderer = renderer;
        this.weights = {};
        this._oratorLogic = null;
        this._speakerId = null;
        console.log('B"H - ShapeKeySystem v2: Expression Engine Online.');
    }

    setOratorLogic(logic, speakerId) {
        this._oratorLogic = logic;
        this._speakerId   = speakerId;
        console.log(`B"H - SKS: OratorLogic wired to speaker '${speakerId}'.`);
    }

    setWeight(objId, keyName, weight) {
        if (!this.weights[objId]) this.weights[objId] = {};
        this.weights[objId][keyName] = weight;
    }

    update(dt = 0) {
        if (this._oratorLogic && this._speakerId) {
            this._oratorLogic.update(dt, this.renderer, this._speakerId);
        }

        for (const objId in this.weights) {
            const obj = this.renderer.objectMap.get(objId);
            if (!obj || !obj.basePositions || !obj.shapeKeys) continue;

            const activeKeys = this.weights[objId];
            
            // B"H - UNCONDITIONAL DIRTY FLAG
            // We must flag the object as dirty every frame its keys are being managed,
            // because if all weights hit 0, the basePositions must still be uploaded!
            obj.dirty = true;
            obj.positions.set(obj.basePositions);

            let hasUpdate = false;

            for (const keyName in activeKeys) {
                const weight = activeKeys[keyName];
                if (weight < 0.0001) continue;

                const deltas = obj.shapeKeys[keyName];
                if (!deltas || deltas.length !== obj.positions.length) {
                    if (!obj._warnedSK) {
                        console.warn(`B"H - SKS: Key '${keyName}' size mismatch on [${objId}]`);
                        obj._warnedSK = true;
                    }
                    continue;
                }

                hasUpdate = true;
                for (let i = 0; i < obj.positions.length; i++) {
                    obj.positions[i] += deltas[i] * weight;
                }
            }

            if (hasUpdate && !obj._loggedSpeech) {
                console.log(`B"H - [${objId}] expressions active.`);
                obj._loggedSpeech = true;
            }
        }
    }
}
