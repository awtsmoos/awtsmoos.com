
/**
 * B"H
 * @file movement.js
 * Helper methods for calculating movement vectors and animation states.
 */
import Utils from "../../../utils.js";

export default {
    resetMoving() {
        Object.keys(this.moving).forEach(q => {
            this.moving[q] = false;
        });
    },

    getChaweeyoos(nm) {
        const c = this.chaweeyoosMap[nm];
        if(!c) return null;
        if(typeof(c) === "string") return c;
        if(typeof(c) === "function") return c();
        
        if(typeof(c) === "object") {
            const ran = Math.random();
            let sum = 0;
            let found = null;
            Object.entries(c).forEach(q => {
                if(found !== null) return;
                if(typeof(q[1]) === "number" && q[1] <= 1) sum += q[1];
                if(ran <= sum) found = q[0];
            });
            return found;
        }
    },

    getModelVector() {
        return Utils.getForwardVector(
            this.modelMesh,
            this.currentModelVector
        );
    },

    getForwardVector() {
        return Utils.getForwardVector(
            this.nonRotatingEmptyForMovement,
            this.worldDirectionVector
        );
    }
};
